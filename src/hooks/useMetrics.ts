import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import type { Cliente } from '../pages/KanbanPage';

export interface Metrics {
  totalLeads: number;
  vendas: number;
  ticketMedio: number;
  atividadesHoje: number;
}

const CACHE_TTL_MS = 60_000; // 60 seconds

// Module-level cache — persists across re-mounts (page navigation)
const metricsCache: { data: { metrics: Metrics; clientes: Cliente[] } | null; fetchedAt: number } = {
  data: null,
  fetchedAt: 0,
};

export function useMetrics() {
  const [metrics, setMetrics] = useState<Metrics | null>(metricsCache.data?.metrics ?? null);
  const [clientes, setClientes] = useState<Cliente[]>(metricsCache.data?.clientes ?? []);
  const [loading, setLoading] = useState(!metricsCache.data);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;

    const fetchData = async () => {
      // Return cache if still fresh
      if (metricsCache.data && Date.now() - metricsCache.fetchedAt < CACHE_TTL_MS) {
        if (isMounted.current) {
          setMetrics(metricsCache.data.metrics);
          setClientes(metricsCache.data.clientes);
          setLoading(false);
        }
        return;
      }

      try {
        const [clientesRes, atividadesRes] = await Promise.all([
          supabase.from('clientes_crm').select(`
            id,
            nome,
            status_funil,
            updated_at,
            planos ( valor_mensal )
          `),
          supabase.from('atividades').select('id', { count: 'exact' }).gte('created_at', new Date(new Date().setHours(0,0,0,0)).toISOString())
        ]);

        if (clientesRes.error) throw clientesRes.error;
        if (atividadesRes.error) throw atividadesRes.error;

        const dataClientes = (clientesRes.data || []) as unknown as Cliente[];
        const closedClientes = dataClientes.filter(c => c.status_funil === 'FECHADO');

        let totalReceita = 0;
        closedClientes.forEach(c => {
          if (c.planos) totalReceita += c.planos.valor_mensal;
        });

        const newMetrics: Metrics = {
          totalLeads: dataClientes.length,
          vendas: closedClientes.length,
          ticketMedio: closedClientes.length > 0 ? totalReceita / closedClientes.length : 0,
          atividadesHoje: atividadesRes.count || 0
        };

        // Update module-level cache
        metricsCache.data = { metrics: newMetrics, clientes: dataClientes };
        metricsCache.fetchedAt = Date.now();

        if (isMounted.current) {
          setClientes(dataClientes);
          setMetrics(newMetrics);
        }
      } catch (error) {
        console.error('Erro ao buscar metricas', error);
      } finally {
        if (isMounted.current) setLoading(false);
      }
    };

    fetchData();

    return () => { isMounted.current = false; };
  }, []);

  return { metrics, clientes, loading };
}

import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';

export interface FinanceResumo {
  receita: { current: number; trend: number };
  despesa: { current: number; trend: number };
  saldo: { current: number; trend: number };
  historico: Array<{ month: string; receita: number; despesa: number }>;
  lancamentos: Array<{ id: string; tipo: string; descricao: string; valor: number; data: string }>;
}

const CACHE_TTL_MS = 60_000;

const financasCache: { data: FinanceResumo | null; fetchedAt: number } = {
  data: null,
  fetchedAt: 0,
};

export function useFinancas() {
  const [data, setData] = useState<FinanceResumo | null>(financasCache.data);
  const [loading, setLoading] = useState(!financasCache.data);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;

    const fetchResumo = async () => {
      if (financasCache.data && Date.now() - financasCache.fetchedAt < CACHE_TTL_MS) {
        if (isMounted.current) {
          setData(financasCache.data);
          setLoading(false);
        }
        return;
      }

      try {
        const { data: clientes, error } = await supabase
          .from('clientes_crm')
          .select(`status_funil, planos ( valor_mensal )`);

        if (error) throw error;

        let totalReceita = 0;
        clientes.forEach((c: any) => {
          if (c.status_funil === 'FECHADO' && c.planos) {
            totalReceita += c.planos.valor_mensal;
          }
        });

        const result: FinanceResumo = {
          receita: { current: totalReceita, trend: 15 },
          despesa: { current: 3500, trend: -5 },
          saldo: { current: totalReceita - 3500, trend: 20 },
          historico: [
            { month: 'Jan', receita: totalReceita * 0.7, despesa: 3200 },
            { month: 'Fev', receita: totalReceita * 0.8, despesa: 3100 },
            { month: 'Mar', receita: totalReceita * 0.9, despesa: 3600 },
            { month: 'Abr', receita: totalReceita, despesa: 3500 },
          ],
          lancamentos: [
            { id: '1', tipo: 'receita', descricao: 'Planos Recorrentes', valor: 97, data: new Date().toISOString() },
            { id: '2', tipo: 'despesa', descricao: 'Assinatura Ferramentas', valor: 80, data: new Date().toISOString() }
          ]
        };

        financasCache.data = result;
        financasCache.fetchedAt = Date.now();

        if (isMounted.current) setData(result);
      } catch (err) {
        console.error('Erro ao buscar finanças:', err);
      } finally {
        if (isMounted.current) setLoading(false);
      }
    };

    fetchResumo();

    return () => { isMounted.current = false; };
  }, []);

  return { data, loading };
}

import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useToast } from './useToast';
import type { Cliente } from '../pages/KanbanPage';

const CACHE_TTL_MS = 60_000;

// Module-level cache — invalidated by Realtime events
const clientesCache: { data: Cliente[] | null; fetchedAt: number } = {
  data: null,
  fetchedAt: 0,
};

export function useClientes() {
  const [clientes, setClientes] = useState<Cliente[]>(clientesCache.data ?? []);
  const [loading, setLoading] = useState(!clientesCache.data);
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(false);
  const { error } = useToast();
  const isMounted = useRef(true);

  const fetchClientes = async (forceRefresh = false) => {
    // Use cache if fresh and not forcing refresh
    if (!forceRefresh && clientesCache.data && Date.now() - clientesCache.fetchedAt < CACHE_TTL_MS) {
      if (isMounted.current) {
        setClientes(clientesCache.data);
        setLoading(false);
      }
      return;
    }

    try {
      const { data, error: sbError } = await supabase
        .from('clientes_crm')
        .select(`
          id,
          nome,
          telefone,
          email,
          status_funil,
          origem,
          updated_at,
          planos (
            nome,
            valor_mensal
          )
        `)
        .order('updated_at', { ascending: false });

      if (sbError) throw sbError;

      const result = (data as unknown) as Cliente[];
      clientesCache.data = result;
      clientesCache.fetchedAt = Date.now();

      if (isMounted.current) setClientes(result);
    } catch (err: any) {
      error('Erro ao buscar clientes', err.message);
    } finally {
      if (isMounted.current) setLoading(false);
    }
  };

  useEffect(() => {
    isMounted.current = true;
    fetchClientes();

    // Realtime subscription — also invalidates cache on mutations
    const subscription = supabase
      .channel('clientes_crm_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'clientes_crm' },
        (payload) => {
          // Invalidate cache so next fetch is fresh
          clientesCache.fetchedAt = 0;

          if (payload.eventType === 'INSERT') {
            setClientes((prev) => [payload.new as Cliente, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setClientes((prev) =>
              prev.map((c) => (c.id === payload.new.id ? { ...c, ...payload.new } : c))
            );
          } else if (payload.eventType === 'DELETE') {
            setClientes((prev) => prev.filter((c) => c.id !== payload.old.id));
          }
        }
      )
      .subscribe((status) => {
        if (isMounted.current) setIsRealtimeConnected(status === 'SUBSCRIBED');
      });

    return () => {
      isMounted.current = false;
      subscription.unsubscribe();
    };
  }, []);

  const updateClienteStatus = async (id: string, newStatus: string) => {
    // Optimistic update
    const previousClientes = [...clientes];
    setClientes((prev) => prev.map((c) => (c.id === id ? { ...c, status_funil: newStatus } : c)));

    try {
      const { error: patchError } = await supabase
        .from('clientes_crm')
        .update({ status_funil: newStatus })
        .eq('id', id);

      if (patchError) throw patchError;
      clientesCache.fetchedAt = 0; // Invalidate cache after mutation
      return true;
    } catch (err: any) {
      // Revert optimistic update
      setClientes(previousClientes);
      error('Falha ao mover cliente', err.message);
      return false;
    }
  };

  return {
    clientes,
    loading,
    isRealtimeConnected,
    fetchClientes: () => fetchClientes(true),
    updateClienteStatus
  };
}

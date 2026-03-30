import { useState, useEffect } from 'react';
import api from '../lib/api';
import { normalizeStatus, getStatusInfo } from '../utils/status';
import { LeadDrawer, type Cliente } from '../components/LeadDrawer';
import { Loader2, Phone, Search, List, CalendarClock } from 'lucide-react';

export function ClientesList() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);

  useEffect(() => { fetchClientes(); }, []);

  const fetchClientes = async () => {
    try {
      const { data } = await api.get('/clientes');
      const normalized = data.map((c: Cliente) => ({ ...c, status_funil: normalizeStatus(c.status_funil) }));
      setClientes(normalized);
    } catch (err) {
      console.error('Erro ao buscar clientes', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdated = (updated: Cliente) => {
    setClientes((prev) => prev.map((c) => (c.id === updated.id ? { ...c, ...updated, status_funil: normalizeStatus(updated.status_funil) } : c)));
    setSelectedCliente(null);
  };

  const handleDeleted = (id: string) => {
    setClientes((prev) => prev.filter((c) => c.id !== id));
  };

  const filtered = clientes.filter(
    (c) => c.nome?.toLowerCase().includes(search.toLowerCase()) || c.telefone?.includes(search)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-indigo-500/10 rounded-xl flex items-center justify-center border border-indigo-500/20">
            <List className="text-indigo-400 h-5 w-5" />
          </div>
          <div>
            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
              Todos os Leads
            </h2>
            <p className="text-xs text-zinc-500">{filtered.length} resultado{filtered.length !== 1 ? 's' : ''}</p>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome ou telefone..."
            className="pl-9 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-white placeholder-zinc-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors w-full sm:w-72"
          />
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-950/50 border-b border-zinc-800">
                <th className="py-3 px-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Lead</th>
                <th className="py-3 px-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Contato</th>
                <th className="py-3 px-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Status</th>
                <th className="py-3 px-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Plano</th>
                <th className="py-3 px-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Follow-up</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center">
                    <Loader2 className="animate-spin h-6 w-6 text-indigo-500 mx-auto" />
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-zinc-500 text-sm">
                    Nenhum lead encontrado.
                  </td>
                </tr>
              ) : (
                filtered.map((cliente) => {
                  const si = getStatusInfo(cliente.status_funil);
                  return (
                    <tr
                      key={cliente.id}
                      onClick={() => setSelectedCliente(cliente)}
                      className="hover:bg-zinc-800/30 transition-colors cursor-pointer group"
                    >
                      <td className="py-3 px-4">
                        <div className="font-medium text-white group-hover:text-indigo-300 transition-colors">{cliente.nome}</div>
                        <div className="text-xs text-zinc-500">{new Date(cliente.updated_at).toLocaleDateString('pt-BR')}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 text-sm text-zinc-300">
                          <Phone className="h-3 w-3 text-zinc-500" /> {cliente.telefone}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border ${si.border} ${si.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${si.dot}`} />
                          {si.label}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-zinc-400">{cliente.planos?.nome ?? '—'}</span>
                      </td>
                      <td className="py-3 px-4">
                        {cliente.proximo_followup ? (
                          <span className="flex items-center gap-1 text-xs text-amber-400">
                            <CalendarClock className="h-3 w-3" />
                            {new Date(cliente.proximo_followup).toLocaleDateString('pt-BR')}
                          </span>
                        ) : (
                          <span className="text-zinc-700 text-xs">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <LeadDrawer
        cliente={selectedCliente}
        onClose={() => setSelectedCliente(null)}
        onUpdated={handleUpdated}
        onDeleted={handleDeleted}
      />
    </div>
  );
}

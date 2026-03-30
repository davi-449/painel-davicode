import { useState, useEffect } from 'react';
import api from '../lib/api';
import { Loader2, Phone, Send, Eye, Search, List } from 'lucide-react';

interface Cliente {
  id: string;
  nome: string;
  telefone: string;
  email?: string;
  status_funil: string;
  origem?: string;
  planos?: { nome: string; valor_mensal: number } | null;
  updated_at: string;
}

const normalizeStatus = (status?: string | null): string => {
  if (!status) return 'NOVO';
  const s = status.toUpperCase().trim();
  if (s === 'EM ATENDIMENTO' || s === 'EM_ATENDIMENTO') return 'EM_ATENDIMENTO';
  if (s === 'FOLLOW UP' || s === 'FOLLOW_UP' || s === 'FOLLOWUP') return 'FOLLOWUP';
  if (s === 'PROPOSTA' || s === 'PROPOSTA ENVIADA' || s === 'PROPOSTA_ENVIADA') return 'PROPOSTA_ENVIADA';
  if (s === 'PAGAMENTO' || s === 'AGUARDANDO PAGAMENTO' || s === 'AGUARDANDO_PAGAMENTO') return 'AGUARDANDO_PAGAMENTO';
  return s.replace(/\s+/g, '_');
};

const COLUMNS = [
  { id: 'NOVO', label: 'Novo', color: 'bg-blue-500', border: 'border-blue-500/30' },
  { id: 'EM_ATENDIMENTO', label: 'Em Atendimento', color: 'bg-amber-500', border: 'border-amber-500/30' },
  { id: 'FOLLOWUP', label: 'Follow Up', color: 'bg-purple-500', border: 'border-purple-500/30' },
  { id: 'PROPOSTA_ENVIADA', label: 'Proposta', color: 'bg-cyan-500', border: 'border-cyan-500/30' },
  { id: 'AGUARDANDO_PAGAMENTO', label: 'Pagamento', color: 'bg-yellow-500', border: 'border-yellow-500/30' },
  { id: 'FECHADO', label: 'Fechado', color: 'bg-green-500', border: 'border-green-500/30' },
  { id: 'PERDIDO', label: 'Perdido', color: 'bg-red-500', border: 'border-red-500/30' },
];

function ClienteSheet({ cliente, onClose, onDispatch }: { 
  cliente: Cliente | null; onClose: () => void; onDispatch: (id: string) => void;
}) {
  if (!cliente) return null;
  const statusIndex = COLUMNS.findIndex((c) => c.id === cliente.status_funil);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-zinc-900 border-l border-zinc-800 h-full overflow-y-auto shadow-2xl animate-slide-in flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-zinc-800">
          <button onClick={onClose} className="absolute top-4 right-4 text-zinc-500 hover:text-white text-xl">✕</button>
          <h3 className="text-xl font-bold text-white">{cliente.nome}</h3>
          <p className="text-sm text-zinc-500 mt-1">{cliente.email || 'Sem email'}</p>
        </div>

        {/* Info */}
        <div className="p-6 space-y-3 text-sm border-b border-zinc-800">
          <div className="flex justify-between">
            <span className="text-zinc-400">Telefone</span>
            <a href={`https://wa.me/55${cliente.telefone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer"
               className="text-green-400 font-mono hover:underline flex items-center gap-1">
              <Phone className="h-3 w-3" /> {cliente.telefone}
            </a>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-400">Status</span>
            <span className="text-indigo-400 font-medium">{COLUMNS.find(c => c.id === cliente.status_funil)?.label || cliente.status_funil}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-400">Plano</span>
            <span className="text-white">{cliente.planos?.nome || '—'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-400">Origem</span>
            <span className="text-white">{cliente.origem || '—'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-400">Última atualização</span>
            <span className="text-white text-xs">{new Date(cliente.updated_at).toLocaleString('pt-BR')}</span>
          </div>
        </div>

        {/* Funnel Timeline */}
        <div className="p-6 flex-1">
          <h4 className="text-sm font-semibold text-zinc-300 mb-4">Jornada no Funil</h4>
          <div className="space-y-0">
            {COLUMNS.map((col, idx) => {
              const isPast = idx < statusIndex;
              const isCurrent = idx === statusIndex;
              return (
                <div key={col.id} className="flex items-start gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`w-3 h-3 rounded-full border-2 ${
                      isCurrent ? `${col.color} border-transparent ring-2 ring-offset-1 ring-offset-zinc-900 ring-indigo-500` :
                      isPast ? 'bg-zinc-600 border-zinc-600' :
                      'bg-transparent border-zinc-700'
                    }`} />
                    {idx < COLUMNS.length - 1 && (
                      <div className={`w-0.5 h-6 ${isPast || isCurrent ? 'bg-zinc-600' : 'bg-zinc-800'}`} />
                    )}
                  </div>
                  <p className={`text-sm pb-4 -mt-0.5 ${
                    isCurrent ? 'text-white font-semibold' :
                    isPast ? 'text-zinc-500' :
                    'text-zinc-700'
                  }`}>
                    {col.label} {isCurrent && '←'}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-zinc-800 flex gap-3">
          <a
            href={`https://wa.me/55${cliente.telefone.replace(/\D/g, '')}`}
            target="_blank"
            rel="noreferrer"
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium bg-green-600 hover:bg-green-700 text-white transition-colors"
          >
            <Phone className="h-4 w-4" /> WhatsApp
          </a>
          <button
            onClick={() => onDispatch(cliente.id)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
          >
            <Send className="h-4 w-4" /> Disparar n8n
          </button>
        </div>
      </div>
    </div>
  );
}

export function ClientesList() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);

  useEffect(() => {
    fetchClientes();
  }, []);

  const fetchClientes = async () => {
    try {
      const { data } = await api.get('/clientes');
      const normalizedData = data.map((c: Cliente) => ({ ...c, status_funil: normalizeStatus(c.status_funil) }));
      setClientes(normalizedData);
    } catch (err) {
      console.error('Erro ao buscar clientes', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDispatch = async (clienteId: string) => {
    try {
      await api.post('/dispatch', { cliente_id: clienteId });
      alert('Disparo enviado com sucesso!');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erro ao disparar');
    }
  };

  const filteredClientes = clientes.filter(c => 
    c.nome.toLowerCase().includes(search.toLowerCase()) || 
    c.telefone.includes(search)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-indigo-500/10 rounded-xl flex items-center justify-center border border-indigo-500/20">
            <List className="text-indigo-400 h-5 w-5" />
          </div>
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
            Todos os Leads
          </h2>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar lead por nome ou tel..."
            className="pl-9 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-white placeholder-zinc-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors w-full sm:w-72"
          />
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-950/50 border-b border-zinc-800">
                <th className="py-3 px-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Nome</th>
                <th className="py-3 px-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Contato</th>
                <th className="py-3 px-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Status</th>
                <th className="py-3 px-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Plano</th>
                <th className="py-3 px-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center">
                    <Loader2 className="animate-spin h-6 w-6 text-indigo-500 mx-auto" />
                  </td>
                </tr>
              ) : filteredClientes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-zinc-500">
                    Nenhum lead encontrado.
                  </td>
                </tr>
              ) : (
                filteredClientes.map((cliente) => {
                  const statusInfo = COLUMNS.find(c => c.id === cliente.status_funil);
                  return (
                    <tr key={cliente.id} className="hover:bg-zinc-800/30 transition-colors group">
                      <td className="py-3 px-4">
                        <div className="font-medium text-white">{cliente.nome}</div>
                        <div className="text-xs text-zinc-500">{new Date(cliente.updated_at).toLocaleDateString('pt-BR')}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 text-sm text-zinc-300">
                          <Phone className="h-3 w-3 text-zinc-500" /> {cliente.telefone}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${statusInfo?.border || 'border-zinc-700 bg-zinc-800 text-zinc-300'}`}>
                          {statusInfo?.label || cliente.status_funil}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-zinc-400">{cliente.planos?.nome || '—'}</span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setSelectedCliente(cliente)}
                          className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:bg-indigo-600 hover:text-white transition-colors"
                          title="Ver Detalhes"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <ClienteSheet cliente={selectedCliente} onClose={() => setSelectedCliente(null)} onDispatch={handleDispatch} />
    </div>
  );
}

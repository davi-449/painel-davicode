import { useState } from 'react';
import { Search, Loader2, ArrowUpDown, Calendar, DollarSign, Clock } from 'lucide-react';
import { useClientes } from '../hooks/useClientes';
import { StatusBadge } from '../components/ui/StatusBadge';

export function ClientesListaPage() {
  const { clientes, loading } = useClientes();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredClientes = clientes.filter(c => 
    c.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.telefone.includes(searchTerm)
  );

  return (
    <div className="h-full flex flex-col pt-4 animate-slide-in">
      <header className="mb-8">
        <h2 className="text-3xl font-bold font-heading text-gradient mb-2">Contatos & Leads</h2>
        <p className="text-slate-400">Visão analítica de todos os contatos no CRM, incluindo fechamentos.</p>
      </header>

      <div className="mb-6 flex gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
          <input
            type="text"
            placeholder="Buscar por nome, email ou telefone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
          />
        </div>
      </div>

      <div className="flex-1 bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden glass-card flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/[0.08] text-xs uppercase tracking-wider text-slate-500 bg-white/[0.02] font-semibold">
                <th className="py-4 px-6">Cliente</th>
                <th className="py-4 px-6">Etapa</th>
                <th className="py-4 px-6">Plano Atual</th>
                <th className="py-4 px-6">Fechamento <ArrowUpDown className="inline w-3 h-3 ml-1" /></th>
                <th className="py-4 px-6 text-right">Cadastrado em</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center">
                    <Loader2 className="w-6 h-6 text-emerald-500 animate-spin mx-auto" />
                  </td>
                </tr>
              ) : filteredClientes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500">
                    Nenhum contato encontrado.
                  </td>
                </tr>
              ) : (
                filteredClientes.map((cliente) => {
                  const extraData = cliente as any;
                  return (
                    <tr key={cliente.id} className="group hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500/20 to-emerald-500/20 border border-white/10 flex items-center justify-center font-bold text-white shadow-inner">
                            {cliente.nome.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-200 text-sm">{cliente.nome}</p>
                            <p className="text-xs text-slate-500">{cliente.telefone}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <StatusBadge status={cliente.status_funil} />
                      </td>
                      <td className="py-4 px-6">
                        {cliente.planos ? (
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-slate-300">{cliente.planos.nome}</span>
                            <span className="text-xs text-emerald-400/80 font-mono">
                              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cliente.planos.valor_mensal)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-slate-600">—</span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        {extraData.valor_contrato ? (
                          <div className="flex items-center gap-4 border border-white/5 bg-black/20 px-3 py-2 rounded-lg w-fit">
                            <div className="flex flex-col">
                              <span className="text-[10px] uppercase text-emerald-500/70 mb-0.5 flex items-center gap-1"><DollarSign className="w-3 h-3"/> Valor Total</span>
                              <span className="text-sm font-mono text-emerald-400">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(extraData.valor_contrato)}
                              </span>
                            </div>
                            <div className="w-px h-8 bg-white/10 mx-1"></div>
                            <div className="flex flex-col">
                              <span className="text-[10px] uppercase text-indigo-400/70 mb-0.5 flex items-center gap-1"><Clock className="w-3 h-3"/> Vigência</span>
                              <span className="text-sm text-indigo-300 font-mono">{extraData.tempo_contrato_meses} meses</span>
                            </div>
                            <div className="w-px h-8 bg-white/10 mx-1"></div>
                            <div className="flex flex-col">
                              <span className="text-[10px] uppercase text-rose-400/70 mb-0.5 flex items-center gap-1"><Calendar className="w-3 h-3"/> Vence em</span>
                              <span className="text-sm text-rose-300 font-mono">{new Date(extraData.data_vencimento).toLocaleDateString('pt-BR')}</span>
                            </div>
                          </div>
                        ) : extraData.motivo_perda ? (
                          <div className="text-sm text-rose-400/80 bg-rose-500/10 px-3 py-1.5 rounded-lg border border-rose-500/20 max-w-xs truncate" title={extraData.motivo_perda}>
                            Perdido: {extraData.motivo_perda}
                          </div>
                        ) : (
                          <span className="text-sm text-slate-600 italic">Em andamento</span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <span className="text-sm text-slate-500 font-mono">
                          {new Date(cliente.updated_at).toLocaleDateString('pt-BR', {
                            day: '2-digit', month: 'short', year: 'numeric'
                          })}
                        </span>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

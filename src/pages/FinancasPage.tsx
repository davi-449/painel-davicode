import { useState } from 'react';
import { useFinancas } from '../hooks/useFinancas';
import { FinanceKPI } from '../components/ui/FinanceKPI';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

// FinanceResumo is defined in useFinancas

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card p-3 rounded-lg border border-white/[0.1] shadow-2xl">
        <p className="text-sm font-semibold text-white mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center justify-between gap-4 text-sm mb-1 last:mb-0">
            <span className="text-slate-300 capitalize flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
              {entry.name}:
            </span>
            <span className="font-bold text-white">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(entry.value)}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export function FinancasPage() {
  const { data, loading, addLancamento, deleteLancamento } = useFinancas();
  
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formModal, setFormModal] = useState({
    tipo: 'receita' as 'receita' | 'despesa',
    descricao: '',
    valor: '',
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-100px)]">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  const handleOpenModal = () => {
    setFormModal({ tipo: 'receita', descricao: '', valor: '' });
    setShowModal(true);
  };

  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formModal.descricao || !formModal.valor) return;
    setIsSubmitting(true);
    try {
      await addLancamento(formModal.tipo, formModal.descricao, Number(formModal.valor));
      setShowModal(false);
    } catch (err: any) {
      alert(`Erro ao adicionar: ${err?.message || 'Verifique os dados.'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (id.startsWith('__mock__')) {
      alert('Linhas de exemplo (mock) não podem ser excluídas. Elas sumirão sozinhas quando você cadastrar lançamentos reais.');
      return;
    }
    
    if (window.confirm('Tem certeza que deseja excluir este lançamento?')) {
      try {
        await deleteLancamento(id);
      } catch (err: any) {
        alert(`Erro ao excluir: ${err?.message || 'Tente novamente.'}`);
      }
    }
  };

  return (
    <div className="space-y-8 animate-slide-in relative" style={{ animationDuration: '300ms' }}>
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-4">
        <div>
          <h2 className="text-3xl font-bold font-heading text-gradient w-fit mb-2">Gestão Financeira</h2>
          <p className="text-slate-400">Acompanhe as receitas e despesas geradas pela agência.</p>
        </div>
        <button
          onClick={handleOpenModal}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-5 rounded-xl transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
        >
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline">Nova Transação</span>
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <FinanceKPI 
          title="Receita Recorrente (MRR)" 
          value={data?.receita.current || 0} 
          trend={data?.receita.trend || 0} 
          type="receita" 
        />
        <FinanceKPI 
          title="Despesas Mensais" 
          value={data?.despesa.current || 0} 
          trend={data?.despesa.trend || 0} 
          type="despesa" 
        />
        <FinanceKPI 
          title="Saldo Líquido" 
          value={data?.saldo.current || 0} 
          trend={data?.saldo.trend || 0} 
          type="saldo" 
        />
      </div>

      <div className="glass-card rounded-2xl p-6">
        <h3 className="text-lg font-bold text-white mb-6 font-heading flex items-center gap-2">
          <span className="w-1.5 h-6 bg-emerald-500 rounded-full"></span>
          Histórico de Fluxo de Caixa
        </h3>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data?.historico || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorReceita" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorDespesa" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="month" stroke="#8b949e" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis
                stroke="#8b949e"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `R$ ${val / 1000}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="receita" name="Receitas" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorReceita)" />
              <Area type="monotone" dataKey="despesa" name="Despesas" stroke="#f43f5e" strokeWidth={2} fillOpacity={1} fill="url(#colorDespesa)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tabela de Lançamentos */}
      <div className="glass-card p-6 rounded-2xl">
        <h3 className="text-lg font-bold text-white mb-4 font-heading">Últimos Lançamentos</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.08]">
                <th className="text-left font-semibold text-slate-400 p-3">Tipo</th>
                <th className="text-left font-semibold text-slate-400 p-3">Descrição</th>
                <th className="text-right font-semibold text-slate-400 p-3">Valor</th>
                <th className="text-right font-semibold text-slate-400 p-3">Data</th>
                <th className="text-center font-semibold text-slate-400 p-3 w-16">Ações</th>
              </tr>
            </thead>
            <tbody>
              {data?.lancamentos.map((lanc) => (
                <tr key={lanc.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors group">
                  <td className="p-3">
                    <span className={`capitalize px-2 py-0.5 rounded-full text-xs font-medium ${lanc.tipo === 'receita' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                      {lanc.tipo}
                    </span>
                  </td>
                  <td className="p-3 text-slate-200">{lanc.descricao}</td>
                  <td className="p-3 text-right font-mono text-slate-200">
                    {lanc.tipo === 'receita' ? '+' : '-'} {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(lanc.valor)}
                  </td>
                  <td className="p-3 text-right text-slate-500">
                    {new Date(lanc.data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                  </td>
                  <td className="p-3 text-center">
                    {!lanc.id.startsWith('__mock__') && (
                      <button 
                        onClick={() => handleDelete(lanc.id)}
                        className="p-1.5 rounded-md text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors opacity-0 group-hover:opacity-100"
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {(!data?.lancamentos || data.lancamentos.length === 0) && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    Nenhum lançamento encontrado ainda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal - Nova Transação */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div 
            className="w-full max-w-md bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-white mb-6 font-heading">Nova Transação</h3>
            
            <form onSubmit={handleModalSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Tipo</label>
                <select
                  value={formModal.tipo}
                  onChange={(e) => setFormModal({ ...formModal, tipo: e.target.value as any })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                >
                  <option value="receita">Receita (Entrada)</option>
                  <option value="despesa">Despesa (Saída)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Descrição</label>
                <input
                  type="text"
                  required
                  value={formModal.descricao}
                  onChange={(e) => setFormModal({ ...formModal, descricao: e.target.value })}
                  placeholder="Ex: Assinatura, Hospedagem..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Valor (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  min="0.01"
                  value={formModal.valor}
                  onChange={(e) => setFormModal({ ...formModal, valor: e.target.value })}
                  placeholder="0.00"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
              </div>

              <div className="flex gap-3 pt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-xl transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

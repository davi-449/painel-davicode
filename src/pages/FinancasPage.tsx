import { useFinancas } from '../hooks/useFinancas';
import { FinanceKPI } from '../components/ui/FinanceKPI';
import { Loader2 } from 'lucide-react';
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
  const { data, loading } = useFinancas();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-100px)]">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-slide-in" style={{ animationDuration: '300ms' }}>
      <header>
        <h2 className="text-3xl font-bold font-heading text-gradient w-fit mb-2 mt-4">Gestão Financeira</h2>
        <p className="text-slate-400">Acompanhe as receitas e despesas geradas pela agência.</p>
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
              </tr>
            </thead>
            <tbody>
              {data?.lancamentos.map((lanc) => (
                <tr key={lanc.id} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                  <td className="p-3">
                    <span className={`capitalize px-2 py-0.5 rounded-full text-xs ${lanc.tipo === 'receita' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

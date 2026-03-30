import { useEffect, useState } from 'react';
import api from '../lib/api';
import { Users, CreditCard, DollarSign, Activity, Loader2 } from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { normalizeStatus, COLUMNS } from '../utils/status';
import { LeadDrawer, type Cliente } from '../components/LeadDrawer';

interface Metrics {
  totalLeads: number;
  vendas: number;
  ticketMedio: number;
  atividadesHoje: number;
}

export function Dashboard() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [metricsRes, clientesRes] = await Promise.all([
        api.get('/dashboard/metrics'),
        api.get('/clientes'),
      ]);
      setMetrics(metricsRes.data);
      const normalizedClientes = clientesRes.data.map((c: Cliente) => ({
        ...c,
        status_funil: normalizeStatus(c.status_funil)
      }));
      setClientes(normalizedClientes);
    } catch (error) {
      console.error('Erro ao buscar dados', error);
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
    setSelectedCliente(null);
  };

  if (loading) {
    return <div className="flex h-64 items-center justify-center"><Loader2 className="animate-spin text-indigo-500 h-8 w-8" /></div>;
  }

  // Build funnel distribution from real data
  const funnelCounts = COLUMNS.map((col) => ({
    name: col.label,
    value: clientes.filter((c) => c.status_funil === col.id).length,
    colorId: col.id,
    colorHex: getHexFromTailwind(col.color),
  }));

  const barData = funnelCounts.map((f) => ({ name: f.name, leads: f.value }));

  // Recent activity (last 5 updated clients)
  const recentActivity = [...clientes]
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-white mb-6 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400 w-fit">Visão Geral</h2>
      
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="Total de Leads" value={metrics?.totalLeads || 0} icon={<Users className="text-indigo-400 h-5 w-5" />} color="indigo" />
        <KPICard label="Vendas (Fechados)" value={metrics?.vendas || 0} icon={<CreditCard className="text-green-400 h-5 w-5" />} color="green" />
        <KPICard label="Ticket Médio" value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(metrics?.ticketMedio || 0)} icon={<DollarSign className="text-purple-400 h-5 w-5" />} color="purple" />
        <KPICard label="Atividades Hoje" value={metrics?.atividadesHoje || 0} icon={<Activity className="text-blue-400 h-5 w-5" />} color="blue" />
      </div>

      {/* Visual Funnel (Horizontal) */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-lg">
        <h3 className="text-lg font-bold text-zinc-100 mb-6">Funil em Tempo Real</h3>
        <div className="flex w-full items-stretch gap-1 h-12 rounded-lg overflow-hidden border border-zinc-800">
          {funnelCounts.map((f) => {
            const percentage = metrics?.totalLeads ? (f.value / metrics.totalLeads) * 100 : 0;
            if (percentage === 0) return null;
            return (
              <div 
                key={f.name}
                style={{ width: `${percentage}%` }}
                className={`h-full flex flex-col justify-center items-center group relative cursor-pointer hover:opacity-90 transition-all ${getBgClassFromId(f.colorId)}`}
                title={`${f.name}: ${f.value} leads`}
              >
                <span className="text-xs font-bold text-white/90 truncate px-1">{f.value}</span>
              </div>
            );
          })}
        </div>
        <div className="flex flex-wrap justify-between gap-4 mt-6">
           {funnelCounts.map((f) => (
             <div key={f.name} className="flex items-center gap-2">
               <div className={`w-3 h-3 rounded-full ${getBgClassFromId(f.colorId)} opacity-80`} />
               <span className="text-xs text-zinc-400 font-medium">{f.name}</span>
             </div>
           ))}
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart — Funil */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-bold text-zinc-100 mb-6">Leads por Etapa</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="name" stroke="#a1a1aa" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip
                  cursor={{ fill: '#27272a' }}
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46', borderRadius: '8px', color: '#f4f4f5' }}
                />
                <Bar dataKey="leads" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart — Distribuição */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-bold text-zinc-100 mb-6">Proporção do Base</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={funnelCounts.filter((f) => f.value > 0)}
                  cx="50%" cy="50%"
                  innerRadius={55} outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                  nameKey="name"
                  stroke="none"
                >
                  {funnelCounts.filter((f) => f.value > 0).map((entry, idx) => (
                    <Cell key={idx} fill={entry.colorHex} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46', borderRadius: '8px', color: '#f4f4f5' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', color: '#a1a1aa' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-lg">
        <h3 className="text-lg font-bold text-zinc-100 mb-4">Leads Movimentados Recentemente</h3>
        {recentActivity.length === 0 ? (
          <p className="text-zinc-500 text-sm">Nenhuma atividade recente.</p>
        ) : (
          <div className="space-y-3">
            {recentActivity.map((c) => {
              const colInfo = COLUMNS.find((col) => col.id === c.status_funil);
              return (
                <div 
                  key={c.id} 
                  onClick={() => setSelectedCliente(c)}
                  className="flex items-center justify-between py-2 border-b border-zinc-800/50 last:border-0 cursor-pointer hover:bg-zinc-800/20 transition-colors px-2 -mx-2 rounded-lg"
                >
                  <div>
                    <p className="text-sm font-medium text-white">{c.nome}</p>
                    <p className="text-xs text-zinc-500 flex items-center gap-1.5 mt-0.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${colInfo?.dot || 'bg-zinc-500'}`} />
                      {colInfo?.label || c.status_funil}
                    </p>
                  </div>
                  <span className="text-xs text-zinc-500">
                    {new Date(c.updated_at).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              );
            })}
          </div>
        )}
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

// ── Reusable KPI Card ─────────────────────────────
const KPI_COLOR_MAP: Record<string, { border: string; bg: string; glow: string }> = {
  indigo: { border: 'hover:border-indigo-500/50', bg: 'bg-indigo-500/10', glow: 'group-hover:bg-indigo-500/20' },
  green: { border: 'hover:border-green-500/50', bg: 'bg-green-500/10', glow: 'group-hover:bg-green-500/20' },
  purple: { border: 'hover:border-purple-500/50', bg: 'bg-purple-500/10', glow: 'group-hover:bg-purple-500/20' },
  blue: { border: 'hover:border-blue-500/50', bg: 'bg-blue-500/10', glow: 'group-hover:bg-blue-500/20' },
};

function KPICard({ label, value, icon, color }: { label: string; value: string | number; icon: React.ReactNode; color: string }) {
  const c = KPI_COLOR_MAP[color] ?? KPI_COLOR_MAP.indigo;
  return (
    <div className={`bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-lg relative overflow-hidden group ${c.border} transition-colors`}>
      <div className={`absolute top-0 right-0 w-24 h-24 ${c.bg} rounded-full blur-2xl ${c.glow} transition-all`}></div>
      <div className="flex items-center justify-between relative z-10">
        <h3 className="text-zinc-400 font-medium">{label}</h3>
        {icon}
      </div>
      <p className="text-3xl font-bold text-white mt-4 relative z-10">{value}</p>
    </div>
  );
}

function getHexFromTailwind(bgClass: string) {
  if (bgClass.includes('blue')) return '#3b82f6';
  if (bgClass.includes('amber')) return '#f59e0b';
  if (bgClass.includes('purple')) return '#a855f7';
  if (bgClass.includes('cyan')) return '#06b6d4';
  if (bgClass.includes('yellow')) return '#eab308';
  if (bgClass.includes('green')) return '#22c55e';
  if (bgClass.includes('red')) return '#ef4444';
  return '#6366f1';
}

function getBgClassFromId(id: string) {
  const col = COLUMNS.find(c => c.id === id);
  return col?.color || 'bg-zinc-500';
}

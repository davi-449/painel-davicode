import { useEffect, useState } from 'react';
import api from '../lib/api';
import { Users, CreditCard, DollarSign, Activity, Loader2 } from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, Legend,
} from 'recharts';

interface Metrics {
  totalLeads: number;
  vendas: number;
  ticketMedio: number;
  atividadesHoje: number;
}

interface Cliente {
  id: string;
  nome: string;
  status_funil: string;
  updated_at: string;
}

const FUNNEL_COLORS: Record<string, string> = {
  NOVO: '#3b82f6',
  EM_ATENDIMENTO: '#f59e0b',
  FOLLOW_UP: '#a855f7',
  PROPOSTA: '#06b6d4',
  FECHADO: '#22c55e',
  PERDIDO: '#ef4444',
};

const FUNNEL_LABELS: Record<string, string> = {
  NOVO: 'Novo',
  EM_ATENDIMENTO: 'Em Atendimento',
  FOLLOW_UP: 'Follow Up',
  PROPOSTA: 'Proposta',
  FECHADO: 'Fechado',
  PERDIDO: 'Perdido',
};

export function Dashboard() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [metricsRes, clientesRes] = await Promise.all([
          api.get('/dashboard/metrics'),
          api.get('/clientes'),
        ]);
        setMetrics(metricsRes.data);
        setClientes(clientesRes.data);
      } catch (error) {
        console.error('Erro ao buscar dados', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <div className="flex h-64 items-center justify-center"><Loader2 className="animate-spin text-indigo-500 h-8 w-8" /></div>;
  }

  // Build funnel distribution from real data
  const funnelCounts = Object.keys(FUNNEL_LABELS).map((status) => ({
    name: FUNNEL_LABELS[status],
    value: clientes.filter((c) => c.status_funil === status).length,
    color: FUNNEL_COLORS[status],
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

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart — Funil */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-bold text-zinc-100 mb-6">Funil de Vendas</h3>
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
          <h3 className="text-lg font-bold text-zinc-100 mb-6">Distribuição no Funil</h3>
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
                    <Cell key={idx} fill={entry.color} />
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
        <h3 className="text-lg font-bold text-zinc-100 mb-4">Atividades Recentes</h3>
        {recentActivity.length === 0 ? (
          <p className="text-zinc-500 text-sm">Nenhuma atividade recente.</p>
        ) : (
          <div className="space-y-3">
            {recentActivity.map((c) => (
              <div key={c.id} className="flex items-center justify-between py-2 border-b border-zinc-800/50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-white">{c.nome}</p>
                  <p className="text-xs text-zinc-500">Status: {FUNNEL_LABELS[c.status_funil] || c.status_funil}</p>
                </div>
                <span className="text-xs text-zinc-500">
                  {new Date(c.updated_at).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Reusable KPI Card ─────────────────────────────
function KPICard({ label, value, icon, color }: { label: string; value: string | number; icon: React.ReactNode; color: string }) {
  return (
    <div className={`bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-lg relative overflow-hidden group hover:border-${color}-500/50 transition-colors`}>
      <div className={`absolute top-0 right-0 w-24 h-24 bg-${color}-500/10 rounded-full blur-2xl group-hover:bg-${color}-500/20 transition-all`}></div>
      <div className="flex items-center justify-between relative z-10">
        <h3 className="text-zinc-400 font-medium">{label}</h3>
        {icon}
      </div>
      <p className="text-3xl font-bold text-white mt-4 relative z-10">{value}</p>
    </div>
  );
}

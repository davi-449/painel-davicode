import { useEffect, useState } from 'react';
import api from '../lib/api';
import { Users, CreditCard, DollarSign, Activity as ActivityIcon } from 'lucide-react';
import { FunnelBarChart } from '../components/charts/FunnelBarChart';
import { FunnelPieChart } from '../components/charts/FunnelPieChart';
import { SkeletonCard } from '../components/ui/SkeletonCard';
import { ActivityTimeline, Activity } from '../components/ui/ActivityTimeline';
import { StatusBadge, FunnelStatus } from '../components/ui/StatusBadge';
import { FinanceKPI } from '../components/ui/FinanceKPI';
import { cn } from '../lib/utils';

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
  NOVO: '#60a5fa', // blue-400
  EM_ATENDIMENTO: '#fbbf24', // amber-400
  FOLLOW_UP: '#a78bfa', // violet-400
  PROPOSTA: '#22d3ee', // cyan-400
  FECHADO: '#34d399', // emerald-400
  PERDIDO: '#fb7185', // rose-400
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
    return (
      <div className="space-y-6">
        <h2 className="text-3xl font-bold text-white mb-6 font-heading text-gradient w-fit">Visão Geral</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(k => <SkeletonCard key={k} />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <SkeletonCard className="h-96" />
          <SkeletonCard className="h-96" />
        </div>
      </div>
    );
  }

  // Build funnel distribution from real data
  const funnelCounts = Object.keys(FUNNEL_LABELS).map((status) => ({
    name: FUNNEL_LABELS[status],
    value: clientes.filter((c) => c.status_funil === status).length,
    color: FUNNEL_COLORS[status],
  }));

  const barData = funnelCounts.map((f) => ({ name: f.name, leads: f.value, fill: f.color }));

  // Recent activity mapping
  const recentActivityMap: Activity[] = [...clientes]
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 5)
    .map(c => ({
      id: c.id,
      tipo: 'status',
      descricao: `${c.nome} foi atualizado para ${FUNNEL_LABELS[c.status_funil] || c.status_funil}`,
      created_at: c.updated_at
    }));

  return (
    <div className="space-y-8 animate-slide-in" style={{ animationDuration: '300ms' }}>
      <header>
        <h2 className="text-3xl font-bold font-heading text-gradient w-fit mb-2 mt-4">Dashboard</h2>
        <p className="text-slate-400">Acompanhe suas principais métricas de vendas.</p>
      </header>
      
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="Total de Leads" value={metrics?.totalLeads || 0} icon={<Users className="text-indigo-400 h-5 w-5" />} color="indigo" />
        <FinanceKPI title="Vendas Realizadas" value={(metrics?.vendas || 0) * (metrics?.ticketMedio || 0)} trend={12} type="receita" />
        <KPICard label="Ticket Médio" value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(metrics?.ticketMedio || 0)} icon={<DollarSign className="text-purple-400 h-5 w-5" />} color="violet" />
        <KPICard label="Atividades Hoje" value={metrics?.atividadesHoje || 0} icon={<ActivityIcon className="text-cyan-400 h-5 w-5" />} color="cyan" />
      </div>

      {/* Charts & Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar Chart — Funil */}
        <div className="glass-card rounded-2xl p-6 lg:col-span-2 flex flex-col">
          <h3 className="text-lg font-bold text-white mb-6 font-heading flex items-center gap-2">
            <span className="w-1.5 h-6 bg-indigo-500 rounded-full"></span>
            Funil de Vendas
          </h3>
          <div className="flex-1 min-h-[300px] w-full">
            <FunnelBarChart data={barData} />
          </div>
        </div>

        {/* Pie Chart — Distribuição */}
        <div className="glass-card rounded-2xl p-6 flex flex-col">
            <h3 className="text-lg font-bold text-white mb-6 font-heading flex items-center gap-2">
                <span className="w-1.5 h-6 bg-violet-500 rounded-full"></span>
                Distribuição
            </h3>
            <div className="flex-1">
                <FunnelPieChart data={funnelCounts} />
            </div>
        </div>
      </div>

      {/* Recent Activities Timeline */}
      <div className="glass-card rounded-2xl p-6 mt-6">
        <h3 className="text-lg font-bold text-white mb-6 font-heading flex items-center gap-2">
            <span className="w-1.5 h-6 bg-cyan-500 rounded-full"></span>
            Atividades Recentes
        </h3>
        <div className="max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            <ActivityTimeline activities={recentActivityMap} />
        </div>
      </div>
    </div>
  );
}

// ── Reusable Premium KPI Card ─────────────────────────────
const KPI_COLOR_MAP: Record<string, { bg: string; iconBg: string }> = {
  indigo: { bg: 'from-indigo-500/10 to-transparent', iconBg: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' },
  green: { bg: 'from-emerald-500/10 to-transparent', iconBg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' },
  violet: { bg: 'from-violet-500/10 to-transparent', iconBg: 'bg-violet-500/10 border-violet-500/20 text-violet-400' },
  cyan: { bg: 'from-cyan-500/10 to-transparent', iconBg: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400' },
};

function KPICard({ label, value, icon, color }: { label: string; value: string | number; icon: React.ReactNode; color: string }) {
  const c = KPI_COLOR_MAP[color] ?? KPI_COLOR_MAP.indigo;
  
  return (
    <div className="glass-card p-6 rounded-2xl relative overflow-hidden group">
      {/* Background Gradient Glow */}
      <div className={cn("absolute top-0 right-0 w-32 h-32 rounded-full blur-[40px] opacity-20 group-hover:opacity-40 transition-opacity bg-gradient-to-br", c.bg)}></div>
      
      <div className="flex items-center justify-between relative z-10 mb-4">
        <h3 className="text-sm font-medium text-slate-400">{label}</h3>
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center border shadow-inner transition-transform group-hover:scale-110", c.iconBg)}>
          {icon}
        </div>
      </div>
      
      <div className="relative z-10">
        <p className="text-5xl font-bold font-heading text-white tracking-tight">{value}</p>
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { Users, CreditCard, DollarSign, Activity, Loader2 } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface Metrics {
  totalLeads: number;
  vendas: number;
  ticketMedio: number;
  atividadesHoje: number;
}

export function Dashboard() {
  const { token } = useAuth();
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const { data } = await axios.get('http://localhost:3001/api/dashboard/metrics', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMetrics(data);
      } catch (error) {
        console.error('Erro ao buscar métricas', error);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchMetrics();
  }, [token]);

  // Mocked data for charts as requested
  const chartData = [
    { name: 'Novo', leads: 12 },
    { name: 'Atendto', leads: 8 },
    { name: 'Follow', leads: 15 },
    { name: 'Prop.', leads: 5 },
    { name: 'Fech.', leads: metrics?.vendas || 0 },
    { name: 'Perd.', leads: 3 },
  ];

  if (loading) {
    return <div className="flex h-64 items-center justify-center"><Loader2 className="animate-spin text-indigo-500 h-8 w-8" /></div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-white mb-6 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400 w-fit">Visão Geral</h2>
      
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-lg relative overflow-hidden group hover:border-indigo-500/50 transition-colors">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all"></div>
          <div className="flex items-center justify-between relative z-10">
            <h3 className="text-zinc-400 font-medium">Total de Leads</h3>
            <Users className="text-indigo-400 h-5 w-5" />
          </div>
          <p className="text-3xl font-bold text-white mt-4 relative z-10">{metrics?.totalLeads || 0}</p>
        </div>

        {/* Card 2 */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-lg relative overflow-hidden group hover:border-green-500/50 transition-colors">
          <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/10 rounded-full blur-2xl group-hover:bg-green-500/20 transition-all"></div>
          <div className="flex items-center justify-between relative z-10">
            <h3 className="text-zinc-400 font-medium">Vendas (Fechados)</h3>
            <CreditCard className="text-green-400 h-5 w-5" />
          </div>
          <p className="text-3xl font-bold text-white mt-4 relative z-10">{metrics?.vendas || 0}</p>
        </div>

        {/* Card 3 */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-lg relative overflow-hidden group hover:border-purple-500/50 transition-colors">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all"></div>
          <div className="flex items-center justify-between relative z-10">
            <h3 className="text-zinc-400 font-medium">Ticket Médio</h3>
            <DollarSign className="text-purple-400 h-5 w-5" />
          </div>
          <p className="text-3xl font-bold text-white mt-4 relative z-10">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(metrics?.ticketMedio || 0)}
          </p>
        </div>

        {/* Card 4 */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-lg relative overflow-hidden group hover:border-blue-500/50 transition-colors">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all"></div>
          <div className="flex items-center justify-between relative z-10">
            <h3 className="text-zinc-400 font-medium">Atividades Hoje</h3>
            <Activity className="text-blue-400 h-5 w-5" />
          </div>
          <p className="text-3xl font-bold text-white mt-4 relative z-10">{metrics?.atividadesHoje || 0}</p>
        </div>
      </div>

      {/* Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-bold text-zinc-100 mb-6">Funil de Vendas (Mock)</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="name" stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{fill: '#27272a'}}
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46', borderRadius: '8px', color: '#f4f4f5' }}
                />
                <Bar dataKey="leads" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-lg flex flex-col items-center justify-center text-center">
          <div className="h-16 w-16 bg-zinc-800/50 border border-zinc-700/50 rounded-full flex items-center justify-center mb-4">
            <Activity className="text-zinc-500 h-8 w-8" />
          </div>
          <h3 className="text-lg font-bold text-zinc-300 mb-2">Desempenho Geral</h3>
          <p className="text-zinc-500 max-w-sm">
            Mais visualizações detalhadas do CRM estarão disponíveis nas próximas atualizações do painel.
          </p>
        </div>
      </div>
    </div>
  );
}

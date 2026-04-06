import { Clock, MessageCircle, FileText, CheckCircle2, UserPlus, PhoneCall, Bot } from 'lucide-react';

export interface Activity {
  id: string;
  tipo: string;
  descricao: string;
  created_at: string;
}

interface ActivityTimelineProps {
  activities: Activity[];
  isLoading?: boolean;
}

const getIconForType = (type: string) => {
  switch (type.toLowerCase()) {
    case 'mensagem':
    case 'whatsapp':
      return <MessageCircle className="w-4 h-4 text-emerald-400" />;
    case 'ligacao':
      return <PhoneCall className="w-4 h-4 text-blue-400" />;
    case 'nota':
      return <FileText className="w-4 h-4 text-amber-400" />;
    case 'status':
      return <CheckCircle2 className="w-4 h-4 text-violet-400" />;
    case 'criacao':
      return <UserPlus className="w-4 h-4 text-indigo-400" />;
    case 'automacao':
      return <Bot className="w-4 h-4 text-cyan-400" />;
    default:
      return <Clock className="w-4 h-4 text-slate-400" />;
  }
};

const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + ' anos atrás';
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + ' meses atrás';
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + ' dias atrás';
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + ' horas atrás';
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + ' minutos atrás';
  return 'agora mesmo';
};

export function ActivityTimeline({ activities, isLoading }: ActivityTimelineProps) {
  if (isLoading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-4">
            <div className="w-8 h-8 rounded-full skeleton flex-shrink-0"></div>
            <div className="w-full space-y-2 pt-1">
              <div className="w-3/4 h-4 skeleton rounded"></div>
              <div className="w-1/4 h-3 skeleton rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500">
        <Clock className="w-8 h-8 mx-auto mb-3 opacity-20" />
        <p className="text-sm">Nenhuma atividade registrada ainda.</p>
      </div>
    );
  }

  return (
    <div className="relative border-l border-white/[0.08] ml-4 space-y-8 pb-4">
      {activities.map((activity) => (
        <div key={activity.id} className="relative pl-6 group">
          {/* Icon node */}
          <div className="absolute -left-4 top-0 w-8 h-8 rounded-full bg-[#16203A] border border-white/[0.1] flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:border-white/[0.2] transition-transform">
            {getIconForType(activity.tipo)}
          </div>
          
          <div className="glass-card p-4 rounded-xl translate-y-[-4px]">
            <p className="text-sm text-slate-200">{activity.descricao}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[11px] font-medium text-indigo-400 capitalize bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                {activity.tipo}
              </span>
              <span className="text-xs text-slate-500">
                {formatTimeAgo(activity.created_at)}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

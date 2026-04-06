import { cn } from '../../lib/utils';

export type FunnelStatus = 
  | 'NOVO' 
  | 'EM_ATENDIMENTO' 
  | 'FOLLOW_UP' 
  | 'PROPOSTA' 
  | 'FECHADO' 
  | 'PERDIDO';

interface StatusBadgeProps {
  status: FunnelStatus | string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const getStatusStyles = (s: string) => {
    switch (s.toUpperCase()) {
      case 'NOVO':
        return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      case 'EM_ATENDIMENTO':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'FOLLOW_UP':
        return 'text-violet-400 bg-violet-500/10 border-violet-500/20';
      case 'PROPOSTA':
        return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20';
      case 'FECHADO':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'PERDIDO':
        return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
      default:
        return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
    }
  };

  const formatText = (s: string) => {
    return s.replace(/_/g, ' ').toUpperCase();
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
        getStatusStyles(status),
        className
      )}
    >
      {formatText(status)}
    </span>
  );
}

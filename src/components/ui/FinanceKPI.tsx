import { cn } from '../../lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface FinanceKPIProps {
  title: string;
  value: number;
  trend: number; // percentage change vs prev month
  type: 'receita' | 'despesa' | 'saldo';
  className?: string;
  isLoading?: boolean;
}

export function FinanceKPI({ title, value, trend, type, className, isLoading }: FinanceKPIProps) {
  if (isLoading) {
    return (
      <div className={cn("glass-card p-6 rounded-xl flex items-center justify-center h-32", className)}>
        <div className="w-2/3 h-10 rounded skeleton"></div>
      </div>
    );
  }

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(val);
  };

  const getTrendIcon = () => {
    if (trend > 0) return <TrendingUp className="w-4 h-4" />;
    if (trend < 0) return <TrendingDown className="w-4 h-4" />;
    return <Minus className="w-4 h-4" />;
  };

  const getTrendColor = () => {
    if (trend === 0) return 'text-slate-400';
    if (type === 'despesa') {
      return trend > 0 ? 'text-rose-400' : 'text-emerald-400';
    }
    return trend > 0 ? 'text-emerald-400' : 'text-rose-400';
  };

  const getValueColor = () => {
    if (type === 'saldo') {
      return value >= 0 ? 'text-emerald-400' : 'text-rose-400';
    }
    return 'text-white';
  };

  return (
    <div className={cn("glass-card p-6 rounded-xl relative overflow-hidden group", className)}>
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        {type === 'receita' && <TrendingUp className="w-16 h-16 text-emerald-500" />}
        {type === 'despesa' && <TrendingDown className="w-16 h-16 text-rose-500" />}
      </div>
      
      <p className="text-sm font-medium text-slate-400 mb-1 relative z-10">{title}</p>
      
      <div className="flex items-baseline gap-3 relative z-10">
        <h3 className={cn("text-3xl font-bold font-heading", getValueColor())}>
          {formatCurrency(value)}
        </h3>
      </div>

      <div className="mt-4 flex items-center gap-1.5 relative z-10">
        <span className={cn("flex items-center text-xs font-semibold", getTrendColor())}>
          {getTrendIcon()}
          <span className="ml-1">{Math.abs(trend)}%</span>
        </span>
        <span className="text-xs text-slate-500">em relação ao mês passado</span>
      </div>
    </div>
  );
}

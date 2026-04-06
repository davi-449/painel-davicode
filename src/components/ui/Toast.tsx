import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { useToastContext } from '../../contexts/ToastContext';
import { cn } from '../../lib/utils';

export function ToastContainer() {
  const { toasts, removeToast } = useToastContext();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 w-full max-w-sm pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            "pointer-events-auto flex items-start gap-3 p-4 rounded-xl border animate-slide-in shadow-2xl glass-card",
            toast.type === 'success' && "border-emerald-500/20 bg-emerald-500/5",
            toast.type === 'error' && "border-rose-500/20 bg-rose-500/5",
            toast.type === 'warning' && "border-amber-500/20 bg-amber-500/5",
            toast.type === 'info' && "border-blue-500/20 bg-blue-500/5"
          )}
        >
          <div className="flex-shrink-0 mt-0.5">
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
            {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-400" />}
            {toast.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-400" />}
            {toast.type === 'info' && <Info className="w-5 h-5 text-blue-400" />}
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-slate-100">{toast.title}</h4>
            {toast.description && (
              <p className="text-xs text-slate-400 mt-1">{toast.description}</p>
            )}
          </div>

          <button
            onClick={() => removeToast(toast.id)}
            className="flex-shrink-0 text-slate-500 hover:text-slate-300 transition-colors p-1 rounded-md hover:bg-white/5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}

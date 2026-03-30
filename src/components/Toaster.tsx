import { useToastManager } from '../hooks/useToast';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

const ICONS = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
};

const STYLES = {
  success: 'bg-zinc-900 border-green-500/40 text-green-400',
  error: 'bg-zinc-900 border-red-500/40 text-red-400',
  info: 'bg-zinc-900 border-indigo-500/40 text-indigo-400',
};

export function Toaster() {
  const { toasts, removeToast } = useToastManager();

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => {
        const Icon = ICONS[t.type];
        return (
          <div
            key={t.id}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-2xl pointer-events-auto animate-slide-up max-w-sm ${STYLES[t.type]}`}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <p className="text-sm font-medium text-white flex-1">{t.message}</p>
            <button onClick={() => removeToast(t.id)} className="text-zinc-500 hover:text-white transition-colors">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

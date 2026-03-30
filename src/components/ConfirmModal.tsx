import { AlertTriangle, Loader2 } from 'lucide-react';
import { useState } from 'react';

interface ConfirmModalProps {
  title: string;
  message: string;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
  confirmLabel?: string;
  danger?: boolean;
}

export function ConfirmModal({ title, message, onConfirm, onCancel, confirmLabel = 'Confirmar', danger = false }: ConfirmModalProps) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-scale-in">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${danger ? 'bg-red-500/10' : 'bg-amber-500/10'}`}>
          <AlertTriangle className={`h-6 w-6 ${danger ? 'text-red-400' : 'text-amber-400'}`} />
        </div>
        <h3 className="text-lg font-bold text-white text-center mb-2">{title}</h3>
        <p className="text-sm text-zinc-400 text-center mb-6">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-lg text-sm font-medium text-zinc-400 border border-zinc-700 hover:bg-zinc-800 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-50 ${
              danger ? 'bg-red-600 hover:bg-red-700' : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

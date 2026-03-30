import { useState, useCallback } from 'react';

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

let toastCallback: ((toast: Omit<Toast, 'id'>) => void) | null = null;

export const toast = {
  success: (message: string) => toastCallback?.({ message, type: 'success' }),
  error: (message: string) => toastCallback?.({ message, type: 'error' }),
  info: (message: string) => toastCallback?.({ message, type: 'info' }),
};

export function useToastManager() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((t: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { ...t, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((x) => x.id !== id));
    }, 3500);
  }, []);

  // Register global callback on mount
  toastCallback = addToast;

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((x) => x.id !== id));
  }, []);

  return { toasts, removeToast };
}

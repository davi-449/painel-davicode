import { useToastContext } from '../contexts/ToastContext';

export function useToast() {
  const { addToast } = useToastContext();

  return {
    toast: ({ title, description, type }: { title: string; description?: string; type?: 'success' | 'error' | 'info' | 'warning' }) => {
      addToast({ title, description, type: type || 'info' });
    },
    success: (title: string, description?: string) => addToast({ title, description, type: 'success' }),
    error: (title: string, description?: string) => addToast({ title, description, type: 'error' }),
    info: (title: string, description?: string) => addToast({ title, description, type: 'info' }),
    warning: (title: string, description?: string) => addToast({ title, description, type: 'warning' }),
  };
}

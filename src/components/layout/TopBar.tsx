import { useState, useEffect } from 'react';
import { Search, Bell, Command } from 'lucide-react';
import { GlobalSearch } from '../ui/GlobalSearch';

export function TopBar() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    }).format(date);
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <>
      <header className="h-16 border-b border-white/[0.06] bg-white/[0.01] backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-40">
        <div className="flex items-center text-slate-400 text-sm">
          <span className="capitalize">{formatDate(currentTime)}</span>
          <span className="mx-2">•</span>
          <span>{formatTime(currentTime)}</span>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsSearchOpen(true)}
            className="group flex items-center gap-2 bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] hover:border-white/[0.15] px-3 py-1.5 rounded-lg transition-all duration-200"
          >
            <Search className="w-4 h-4 text-slate-400 group-hover:text-slate-200" />
            <span className="text-sm text-slate-400 group-hover:text-slate-200 hidden sm:inline-block">Pesquisar...</span>
            <div className="flex items-center gap-1 ml-4 opacity-60 group-hover:opacity-100">
              <kbd className="bg-black/20 border border-white/[0.1] rounded px-1.5 py-0.5 text-[10px] font-mono flex items-center gap-0.5">
                <Command className="w-3 h-3" />
                <span>K</span>
              </kbd>
            </div>
          </button>

          <button className="relative p-2 text-slate-400 hover:text-slate-200 transition-colors rounded-full hover:bg-white/[0.05]">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full shadow-[0_0_8px_rgba(244,63,94,0.6)]"></span>
          </button>
        </div>
      </header>

      <GlobalSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}

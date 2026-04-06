import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, UserPlus, Settings, LogOut, TrendingUp } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../../lib/utils';

interface SidebarProps {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (val: boolean) => void;
}

export function Sidebar({ mobileMenuOpen, setMobileMenuOpen }: SidebarProps) {
  const { logout, user } = useAuth();
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Finanças', path: '/financas', icon: TrendingUp },
    { name: 'Leads CRM', path: '/clientes', icon: Users, exact: true },
    { name: 'Novo Lead', path: '/clientes/novo', icon: UserPlus },
    { name: 'Configurações', path: '/configuracoes', icon: Settings },
  ];

  const getUserInitials = (name?: string) => {
    if (!name) return 'U';
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <>
      <div
        className={cn(
          "fixed md:sticky top-0 left-0 h-screen w-64 glass-sidebar p-5 transition-transform z-50 flex flex-col pointer-events-auto",
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
        <div className="flex items-center gap-3 mb-8 px-2 mt-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.4)]">
            <span className="font-bold text-white font-heading text-lg leading-none tracking-tighter">D</span>
          </div>
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-violet-400 font-heading">
            DaviCode
          </h1>
        </div>

        <nav className="flex-1 space-y-1.5 mt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact 
              ? location.pathname === item.path
              : location.pathname.startsWith(item.path);
              
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group text-sm font-medium",
                  isActive
                    ? "bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
                    : "text-slate-400 hover:text-slate-100 hover:bg-white/[0.04] border border-transparent"
                )}
              >
                <Icon size={18} className={cn(
                  "transition-transform duration-200",
                  isActive ? "text-indigo-400" : "text-slate-500 group-hover:text-slate-300 group-hover:scale-110"
                )} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="pt-4 border-t border-white/[0.06] mt-4 space-y-3">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-black/20 border border-white/[0.05]">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-600 to-violet-700 flex items-center justify-center text-xs font-bold shadow-inner">
              {getUserInitials(user?.nome)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-200 truncate">{user?.nome || 'Usuário'}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-3 w-full px-3 py-2.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors text-sm font-medium border border-transparent hover:border-rose-500/20"
          >
            <LogOut size={18} />
            <span>Encerrar sessão</span>
          </button>
        </div>
      </div>
      
      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </>
  );
}

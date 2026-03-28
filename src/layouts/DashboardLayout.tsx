import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LayoutDashboard, Users, UserPlus, Settings, LogOut, Menu, X } from 'lucide-react';

export function DashboardLayout() {
  const { logout, user } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Leads CRM', path: '/clientes', icon: Users },
    { name: 'Novo Lead', path: '/clientes/novo', icon: UserPlus },
    { name: 'Configurações', path: '/configuracoes', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col md:flex-row font-sans text-zinc-100">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-zinc-900 border-b border-zinc-800">
        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
          DaviCode CRM
        </h1>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-zinc-400 hover:text-white">
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <div
        className={`fixed md:sticky top-0 left-0 h-screen w-64 bg-zinc-900 border-r border-zinc-800 p-4 transition-transform z-50 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="hidden md:flex flex-col mb-8 p-2">
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
            DaviCode CRM
          </h1>
        </div>

        <nav className="flex-1 space-y-2 mt-4 md:mt-0">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.path === '/clientes'
              ? location.pathname === '/clientes'
              : location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-indigo-600/10 border border-indigo-500/30 text-indigo-400 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50 border border-transparent'
                }`}
              >
                <Icon size={20} className={isActive ? 'text-indigo-400' : 'text-zinc-500'} />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-4 left-4 right-4 space-y-4">
          <div className="px-3 py-2 bg-zinc-950 rounded-lg border border-zinc-800/50 shadow-inner">
            <p className="text-sm font-medium text-white truncate">{user?.nome}</p>
            <p className="text-xs text-zinc-500 truncate">{user?.email}</p>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-3 w-full px-3 py-2.5 text-zinc-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium">Sair</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col p-4 md:p-8 overflow-x-hidden pt-6 relative">
        <main className="flex-1 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>
      
      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}

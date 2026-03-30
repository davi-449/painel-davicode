import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LayoutDashboard, Users, UserPlus, Settings, LogOut, Menu, X, List } from 'lucide-react';
import { NovoLeadModal } from '../components/NovoLeadModal';
import { Toaster } from '../components/Toaster';

export function DashboardLayout() {
  const { logout, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNovoLead, setShowNovoLead] = useState(false);

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Leads CRM', path: '/clientes', icon: Users },
    { name: 'Todos os Leads', path: '/clientes-lista', icon: List }
  ];

  const adminItems = [
    { name: 'Configurações', path: '/configuracoes', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col md:flex-row font-sans text-zinc-100 selection:bg-indigo-500/30">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-zinc-900 border-b border-zinc-800 sticky top-0 z-40">
        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400 flex items-center gap-2">
          DaviCode <span className="text-white">CRM</span>
        </h1>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-zinc-400 hover:text-white">
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <div
        className={`fixed md:sticky top-0 left-0 h-screen w-64 bg-zinc-900/90 backdrop-blur-md border-r border-zinc-800 p-4 transition-transform z-50 flex flex-col ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="hidden md:flex items-center gap-2 mb-8 p-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <span className="text-white font-bold text-lg leading-none">D</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            DaviCode <span className="text-zinc-500 font-medium">CRM</span>
          </h1>
        </div>

        {/* Global CTA */}
        <button
          onClick={() => {
            setShowNovoLead(true);
            setMobileMenuOpen(false);
          }}
          className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-lg font-medium shadow-md shadow-indigo-900/20 transition-all active:scale-[0.98] mb-6"
        >
          <UserPlus size={18} />
          Novo Lead
        </button>

        <nav className="flex-1 space-y-6 overflow-y-auto custom-scrollbar -mr-2 pr-2">
          <div>
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-3 ml-2">Principal</p>
            <div className="space-y-1">
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
                        ? 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-medium'
                        : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50 border border-transparent'
                    }`}
                  >
                    <Icon size={18} className={isActive ? 'text-indigo-400' : 'text-zinc-500'} />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-3 ml-2">Admin</p>
            <div className="space-y-1">
              {adminItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname.startsWith(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-medium'
                        : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50 border border-transparent'
                    }`}
                  >
                    <Icon size={18} className={isActive ? 'text-indigo-400' : 'text-zinc-500'} />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>

        <div className="pt-4 border-t border-zinc-800/50 mt-4 space-y-3 shrink-0">
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700">
              <span className="text-sm font-bold text-zinc-400">{user?.nome?.charAt(0).toUpperCase()}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.nome}</p>
              <p className="text-xs text-zinc-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center justify-center gap-2 w-full px-3 py-2 text-zinc-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors border border-transparent h-10"
          >
            <LogOut size={16} />
            <span className="text-sm font-medium">Encerrar sessão</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-y-auto relative bg-zinc-950">
        <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8">
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

      {/* Global Apps */}
      {showNovoLead && (
        <NovoLeadModal 
          onClose={() => setShowNovoLead(false)} 
          onSuccess={() => {
            // Se estiver na lista de clientes, force um recarregamento (opcional, o user pode dar refresh)
            if (location.pathname === '/clientes' || location.pathname === '/clientes-lista') {
              navigate(location.pathname, { replace: true }); 
            }
          }} 
        />
      )}
      <Toaster />
    </div>
  );
}

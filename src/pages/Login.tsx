import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { Lock, Mail, Loader2, ArrowRight } from 'lucide-react';

import { useToast } from '../hooks/useToast';

// ... (imports existentes)

export function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { error } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await api.post('/auth/login', { email, senha });
      login(data.token, data.user);
      navigate('/dashboard');
    } catch (err: any) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        'Erro ao realizar login. Verifique suas credenciais.';
      error('Falha no Login', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden bg-slate-950 font-sans">
      {/* Background Effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] mix-blend-screen" />
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-emerald-600/10 rounded-full blur-[150px] mix-blend-screen" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-violet-600/10 rounded-full blur-[100px] mix-blend-screen" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
      </div>

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-[420px] animate-slide-in" style={{ animationDuration: '400ms' }}>
        
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-[0_0_30px_rgba(99,102,241,0.4)] mb-6 ring-1 ring-white/20">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold font-heading text-white tracking-tight mb-2">DaviCode<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400"> CRM</span></h1>
          <p className="text-slate-400 font-medium">Gestão de Leads Premium</p>
        </div>

        {/* Login Card */}
        <div className="glass-card rounded-[2rem] p-8 shadow-2xl border border-white/[0.08] relative overflow-hidden backdrop-blur-2xl">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50" />
          
          <form onSubmit={handleLogin} className="space-y-6">
            

            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-300 ml-1">Work Email</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                    <Mail className="h-5 w-5" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-11 pr-4 py-3.5 bg-black/20 border border-white/[0.08] rounded-xl text-white placeholder:text-slate-600 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all text-sm font-medium"
                    placeholder="voce@davicode.com.br"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-sm font-semibold text-slate-300">Password</label>
                  <a href="#" className="text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors">Esqueceu?</a>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                    <Lock className="h-5 w-5" />
                  </div>
                  <input
                    type="password"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    className="block w-full pl-11 pr-4 py-3.5 bg-black/20 border border-white/[0.08] rounded-xl text-white placeholder:text-slate-600 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all text-sm font-medium"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full relative group overflow-hidden rounded-xl bg-slate-100 text-slate-900 border-0 p-[2px] transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:hover:scale-100 mt-2"
            >
              {/* Dynamic Gradient Border Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[length:200%_auto] animate-gradient" />
              
              <div className="relative w-full bg-slate-100 rounded-[10px] px-6 py-3.5 flex items-center justify-center gap-2 group-hover:bg-white transition-colors">
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
                ) : (
                  <>
                    <span className="font-bold text-sm tracking-wide">ACESSAR DASHBOARD</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </div>
            </button>
          </form>
        </div>
        
        {/* Footer */}
        <p className="text-center text-xs text-slate-500 mt-8 font-medium">
          DaviCode Security &copy; {new Date().getFullYear()} • Acesso Restrito
        </p>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { X, CheckCircle2, AlertTriangle } from 'lucide-react';
import type { Cliente } from '../../pages/KanbanPage';

interface ModalGanhaProps {
  cliente: Cliente;
  onClose: () => void;
  onSubmit: (data: { valor_contrato: number; tempo_contrato_meses: number; data_vencimento: string }) => void;
}

export function ModalVendaGanha({ cliente, onClose, onSubmit }: ModalGanhaProps) {
  const [valor, setValor] = useState('');
  const [tempo, setTempo] = useState('');
  const [vencimento, setVencimento] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      valor_contrato: parseFloat(valor) || 0,
      tempo_contrato_meses: parseInt(tempo, 10) || 0,
      data_vencimento: vencimento || new Date().toISOString()
    });
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-md bg-[#0a0a0c] border border-emerald-500/30 rounded-2xl p-6 shadow-[0_0_40px_rgba(16,185,129,0.15)] animate-in fade-in zoom-in-95 duration-200">
        
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center mb-6 text-center">
          <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mb-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
          </div>
          <h2 className="text-xl font-bold text-white font-heading">Venda Fechada! 🎉</h2>
          <p className="text-sm text-slate-400 mt-1">
            Parabéns! Registre as informações do contrato para {cliente.nome}.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Valor do Contrato (R$)</label>
            <input
              type="number"
              step="0.01"
              required
              value={valor}
              onChange={e => setValor(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all placeholder:text-slate-600"
              placeholder="Ex: 5000.00"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Duração (Meses)</label>
              <input
                type="number"
                required
                min="0"
                value={tempo}
                onChange={e => setTempo(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all placeholder:text-slate-600"
                placeholder="Ex: 12"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">1º Vencimento</label>
              <input
                type="date"
                required
                value={vencimento}
                onChange={e => setVencimento(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all placeholder:text-slate-600 [color-scheme:dark]"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 mt-2 rounded-xl text-sm font-bold bg-emerald-500 hover:bg-emerald-400 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all flex items-center justify-center"
          >
            Salvar Contrato
          </button>
        </form>
      </div>
    </div>
  );
}

interface ModalPerdidaProps {
  cliente: Cliente;
  onClose: () => void;
  onSubmit: (data: { motivo_perda: string }) => void;
}

export function ModalVendaPerdida({ cliente, onClose, onSubmit }: ModalPerdidaProps) {
  const [motivo, setMotivo] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ motivo_perda: motivo });
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-md bg-[#0a0a0c] border border-rose-500/30 rounded-2xl p-6 shadow-[0_0_40px_rgba(244,63,94,0.15)] animate-in fade-in zoom-in-95 duration-200">
        
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center mb-6 text-center">
          <div className="w-12 h-12 bg-rose-500/20 rounded-full flex items-center justify-center mb-3">
            <AlertTriangle className="w-6 h-6 text-rose-400" />
          </div>
          <h2 className="text-xl font-bold text-white font-heading">Negociação Perdida</h2>
          <p className="text-sm text-slate-400 mt-1">
            Qual foi o motivo da perda do lead {cliente.nome}? A IA aprenderá com isso.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Motivo (Opcional)</label>
            <textarea
              rows={3}
              value={motivo}
              onChange={e => setMotivo(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-rose-500/50 outline-none transition-all placeholder:text-slate-600 resize-none"
              placeholder="Preço caro? Sem interesse? Concorrente?"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 mt-2 rounded-xl text-sm font-bold bg-rose-500 hover:bg-rose-600 text-white shadow-[0_0_20px_rgba(244,63,94,0.3)] transition-all flex items-center justify-center"
          >
            Confirmar Perda
          </button>
        </form>
      </div>
    </div>
  );
}

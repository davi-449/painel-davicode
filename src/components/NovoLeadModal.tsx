import { useState, useEffect } from 'react';
import api from '../lib/api';
import { UserPlus, Loader2, Phone, Mail, User, Tag, MessageSquare, X } from 'lucide-react';
import { toast } from '../hooks/useToast';

interface Plano {
  id: string;
  nome: string;
  valor_mensal: number;
  ativo: boolean;
}

interface NovoLeadModalProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export function NovoLeadModal({ onClose, onSuccess }: NovoLeadModalProps) {
  const [loading, setLoading] = useState(false);
  const [planos, setPlanos] = useState<Plano[]>([]);
  const [form, setForm] = useState({
    nome: '',
    telefone: '',
    email: '',
    plano_id: '',
    origem: 'MANUAL',
    observacoes: '',
  });

  useEffect(() => {
    const fetchPlanos = async () => {
      try {
        const { data } = await api.get('/planos');
        setPlanos(data.filter((p: Plano) => p.ativo));
      } catch (err) {
        console.error('Erro ao buscar planos', err);
      }
    };
    fetchPlanos();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nome || !form.telefone) return;
    setLoading(true);
    try {
      const payload = { ...form, plano_id: form.plano_id || null };
      await api.post('/clientes', payload);
      toast.success('Lead cadastrado com sucesso!');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Erro ao criar lead');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden animate-scale-in flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-800 bg-zinc-950/50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-green-500/10 rounded-xl flex items-center justify-center border border-green-500/20">
              <UserPlus className="text-green-400 h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold text-white">Novo Lead</h2>
          </div>
          <button onClick={onClose} className="p-2 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar">
          <form id="novo-lead-form" onSubmit={handleSubmit} className="space-y-5 flex-1">
            {/* Nome */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                <User className="h-4 w-4 text-zinc-500" /> Nome Completo *
              </label>
              <input
                name="nome"
                value={form.nome}
                onChange={handleChange}
                required
                placeholder="João da Silva"
                className="input-field"
              />
            </div>

            {/* Telefone & Email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                  <Phone className="h-4 w-4 text-zinc-500" /> WhatsApp *
                </label>
                <input
                  name="telefone"
                  value={form.telefone}
                  onChange={handleChange}
                  required
                  placeholder="(11) 99999-9999"
                  className="input-field"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                  <Mail className="h-4 w-4 text-zinc-500" /> Email
                </label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="joao@email.com"
                  className="input-field"
                />
              </div>
            </div>

            {/* Plano + Origem */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                  <Tag className="h-4 w-4 text-zinc-500" /> Plano de Interesse
                </label>
                <select
                  name="plano_id"
                  value={form.plano_id}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="">Nenhum</option>
                  {planos.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nome} — R$ {Number(p.valor_mensal).toFixed(2)}/mês
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-zinc-300">Origem</label>
                <select
                  name="origem"
                  value={form.origem}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="MANUAL">Manual</option>
                  <option value="WHATSAPP">WhatsApp</option>
                  <option value="INSTAGRAM">Instagram</option>
                  <option value="INDICACAO">Indicação</option>
                  <option value="SITE">Site</option>
                </select>
              </div>
            </div>

            {/* Observações */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-zinc-500" /> Observações
              </label>
              <textarea
                name="observacoes"
                value={form.observacoes}
                onChange={handleChange}
                rows={3}
                placeholder="Informações adicionais sobre o lead..."
                className="input-field resize-none"
              />
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-zinc-800 bg-zinc-950/50 flex justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-5 rounded-lg text-sm font-medium text-zinc-400 border border-zinc-700 hover:bg-zinc-800 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="novo-lead-form"
            disabled={loading}
            className="flex items-center gap-2 py-2.5 px-6 rounded-lg text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-zinc-900 transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin h-5 w-5" /> : <UserPlus className="h-5 w-5" />}
            Cadastrar Lead
          </button>
        </div>

      </div>
    </div>
  );
}

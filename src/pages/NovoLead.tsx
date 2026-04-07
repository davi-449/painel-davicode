import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Loader2, Phone, Mail, User, Tag, MessageSquare } from 'lucide-react';

interface Plano {
  id: string;
  nome: string;
  valor_mensal: number;
  ativo: boolean;
}

export function NovoLead() {
  const navigate = useNavigate();
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
        const { data, error } = await supabase.from('planos').select('*').eq('ativo', true);
        if (error) throw error;
        setPlanos(data as Plano[]);
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
      const payload = {
        nome: form.nome,
        telefone: form.telefone,
        email: form.email || null,
        plano_id: form.plano_id || null,
        origem: form.origem,
        observacoes: form.observacoes || null,
        status_funil: 'NOVO',
      };
      const { error } = await supabase.from('clientes_crm').insert(payload);
      if (error) throw error;
      navigate('/clientes');
    } catch (err: any) {
      console.error('Erro ao criar lead', err);
      alert(`Erro ao cadastrar lead: ${err?.message || 'Verifique os dados e tente novamente.'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="h-12 w-12 bg-green-500/10 rounded-xl flex items-center justify-center border border-green-500/20">
          <UserPlus className="text-green-400 h-6 w-6" />
        </div>
        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-400">
          Novo Lead
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-xl space-y-5">
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
            className="block w-full bg-zinc-950/50 border border-zinc-800 rounded-lg py-2.5 px-4 text-white placeholder-zinc-600 focus:ring-2 focus:ring-green-500 focus:border-green-500 sm:text-sm transition-colors"
          />
        </div>

        {/* Telefone */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
            <Phone className="h-4 w-4 text-zinc-500" /> Telefone (WhatsApp) *
          </label>
          <input
            name="telefone"
            value={form.telefone}
            onChange={handleChange}
            required
            placeholder="(11) 99999-9999"
            className="block w-full bg-zinc-950/50 border border-zinc-800 rounded-lg py-2.5 px-4 text-white placeholder-zinc-600 focus:ring-2 focus:ring-green-500 focus:border-green-500 sm:text-sm transition-colors"
          />
        </div>

        {/* Email */}
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
            className="block w-full bg-zinc-950/50 border border-zinc-800 rounded-lg py-2.5 px-4 text-white placeholder-zinc-600 focus:ring-2 focus:ring-green-500 focus:border-green-500 sm:text-sm transition-colors"
          />
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
              className="block w-full bg-zinc-950/50 border border-zinc-800 rounded-lg py-2.5 px-4 text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 sm:text-sm transition-colors"
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
              className="block w-full bg-zinc-950/50 border border-zinc-800 rounded-lg py-2.5 px-4 text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 sm:text-sm transition-colors"
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
            className="block w-full bg-zinc-950/50 border border-zinc-800 rounded-lg py-2.5 px-4 text-white placeholder-zinc-600 focus:ring-2 focus:ring-green-500 focus:border-green-500 sm:text-sm resize-y transition-colors"
          />
        </div>

        <div className="pt-4 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/clientes')}
            className="py-2.5 px-5 rounded-lg text-sm font-medium text-zinc-400 border border-zinc-700 hover:bg-zinc-800 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 py-2.5 px-6 rounded-lg text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-zinc-900 transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin h-5 w-5" /> : <UserPlus className="h-5 w-5" />}
            Cadastrar Lead
          </button>
        </div>
      </form>
    </div>
  );
}

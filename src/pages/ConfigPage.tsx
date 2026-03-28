import { useEffect, useState } from 'react';
import api from '../lib/api';
import { Settings, Save, Loader2, Bot, Link, Trash2, Plus, Package } from 'lucide-react';

interface Plano {
  id: string;
  nome: string;
  valor_mensal: number;
  valor_anual: number | null;
  ativo: boolean;
}

export function ConfigPage() {
  const [webhook, setWebhook] = useState('');
  const [prompt, setPrompt] = useState('');
  const [planos, setPlanos] = useState<Plano[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // New plano form
  const [newPlano, setNewPlano] = useState({ nome: '', valor_mensal: '', valor_anual: '' });
  const [addingPlano, setAddingPlano] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [configRes, planosRes] = await Promise.all([
          api.get('/config'),
          api.get('/planos'),
        ]);
        setWebhook(configRes.data.webhook_n8n || '');
        setPrompt(configRes.data.prompt_agente_ia || '');
        setPlanos(planosRes.data);
      } catch (error) {
        console.error('Erro ao buscar configurações', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ text: '', type: '' });
    try {
      await api.put('/config', { chave: 'webhook_n8n', valor: webhook });
      await api.put('/config', { chave: 'prompt_agente_ia', valor: prompt });
      setMessage({ text: 'Configurações salvas com sucesso!', type: 'success' });
    } catch {
      setMessage({ text: 'Erro ao salvar configurações.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleAddPlano = async () => {
    if (!newPlano.nome || !newPlano.valor_mensal) return;
    setAddingPlano(true);
    try {
      const { data } = await api.post('/planos', {
        nome: newPlano.nome,
        valor_mensal: parseFloat(newPlano.valor_mensal),
        valor_anual: newPlano.valor_anual ? parseFloat(newPlano.valor_anual) : null,
        ativo: true,
      });
      setPlanos([...planos, data]);
      setNewPlano({ nome: '', valor_mensal: '', valor_anual: '' });
    } catch {
      alert('Erro ao criar plano');
    } finally {
      setAddingPlano(false);
    }
  };

  const handleTogglePlano = async (id: string, ativo: boolean) => {
    try {
      await api.patch(`/planos/${id}`, { ativo: !ativo });
      setPlanos(planos.map((p) => (p.id === id ? { ...p, ativo: !ativo } : p)));
    } catch {
      alert('Erro ao atualizar plano');
    }
  };

  const handleDeletePlano = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este plano?')) return;
    try {
      await api.delete(`/planos/${id}`);
      setPlanos(planos.filter((p) => p.id !== id));
    } catch {
      alert('Erro ao excluir plano');
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin text-indigo-500 h-8 w-8" /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="h-12 w-12 bg-indigo-500/10 rounded-xl flex items-center justify-center border border-indigo-500/20 shadow-sm">
          <Settings className="text-indigo-400 h-6 w-6" />
        </div>
        <h2 className="text-3xl font-bold text-white bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
          Configurações do Sistema
        </h2>
      </div>

      {message.text && (
        <div className={`p-4 rounded-lg border backdrop-blur-sm ${message.type === 'success' ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
          {message.text}
        </div>
      )}

      {/* ── Integração n8n + Prompt IA ── */}
      <form onSubmit={handleSaveConfig} className="space-y-6 bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-xl">
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-zinc-100 flex items-center gap-2">
            <Link className="h-5 w-5 text-indigo-400" />
            Integração n8n
          </h3>
          <p className="text-sm text-zinc-400">URL do Webhook que receberá o lead e iniciará a automação do funil.</p>
          <div className="space-y-1">
            <label className="text-sm font-medium text-zinc-300">Webhook URL</label>
            <input
              type="url"
              value={webhook}
              onChange={(e) => setWebhook(e.target.value)}
              placeholder="https://sua-instancia-n8n.com/webhook/..."
              className="block w-full bg-zinc-950/50 border border-zinc-800 rounded-lg py-3 px-4 text-white placeholder-zinc-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm font-mono shadow-inner transition-colors"
            />
          </div>
        </div>

        <div className="w-full h-px bg-gradient-to-r from-transparent via-zinc-800 to-transparent my-4"></div>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-zinc-100 flex items-center gap-2">
            <Bot className="h-5 w-5 text-purple-400" />
            Agente Inteligente de Vendas
          </h3>
          <p className="text-sm text-zinc-400">Instruções iniciais (System Prompt) para treinar a IA responsável pelo atendimento via WhatsApp.</p>
          <div className="space-y-1">
            <label className="text-sm font-medium text-zinc-300">Prompt do Sistema</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={8}
              placeholder="Você é um Closer de vendas da agência..."
              className="block w-full bg-zinc-950/50 border border-zinc-800 rounded-lg py-3 px-4 text-white placeholder-zinc-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm font-mono resize-y shadow-inner transition-colors"
            />
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 py-2.5 px-6 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-zinc-900 transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 className="animate-spin h-5 w-5" /> : <Save className="h-5 w-5" />}
            Salvar Configurações
          </button>
        </div>
      </form>

      {/* ── Planos CRUD ── */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-xl space-y-4">
        <h3 className="text-xl font-semibold text-zinc-100 flex items-center gap-2">
          <Package className="h-5 w-5 text-green-400" />
          Planos de Assinatura
        </h3>
        <p className="text-sm text-zinc-400">Gerencie os planos oferecidos aos clientes.</p>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left py-3 px-2 text-zinc-400 font-medium">Nome</th>
                <th className="text-left py-3 px-2 text-zinc-400 font-medium">Mensal</th>
                <th className="text-left py-3 px-2 text-zinc-400 font-medium">Anual</th>
                <th className="text-left py-3 px-2 text-zinc-400 font-medium">Status</th>
                <th className="text-right py-3 px-2 text-zinc-400 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {planos.map((plano) => (
                <tr key={plano.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/20 transition-colors">
                  <td className="py-3 px-2 text-white font-medium">{plano.nome}</td>
                  <td className="py-3 px-2 text-zinc-300 font-mono">R$ {Number(plano.valor_mensal).toFixed(2)}</td>
                  <td className="py-3 px-2 text-zinc-300 font-mono">{plano.valor_anual ? `R$ ${Number(plano.valor_anual).toFixed(2)}` : '—'}</td>
                  <td className="py-3 px-2">
                    <button
                      onClick={() => handleTogglePlano(plano.id, plano.ativo)}
                      className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors ${
                        plano.ativo
                          ? 'bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20'
                          : 'bg-zinc-800 text-zinc-500 border border-zinc-700 hover:bg-zinc-700'
                      }`}
                    >
                      {plano.ativo ? 'Ativo' : 'Inativo'}
                    </button>
                  </td>
                  <td className="py-3 px-2 text-right">
                    <button
                      onClick={() => handleDeletePlano(plano.id)}
                      className="p-1.5 rounded-md text-zinc-500 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                      title="Excluir plano"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Add new plano */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <input
            value={newPlano.nome}
            onChange={(e) => setNewPlano({ ...newPlano, nome: e.target.value })}
            placeholder="Nome do plano"
            className="flex-1 bg-zinc-950/50 border border-zinc-800 rounded-lg py-2 px-3 text-white placeholder-zinc-600 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
          />
          <input
            value={newPlano.valor_mensal}
            onChange={(e) => setNewPlano({ ...newPlano, valor_mensal: e.target.value })}
            placeholder="R$ mensal"
            type="number"
            step="0.01"
            className="w-32 bg-zinc-950/50 border border-zinc-800 rounded-lg py-2 px-3 text-white placeholder-zinc-600 text-sm font-mono focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
          />
          <input
            value={newPlano.valor_anual}
            onChange={(e) => setNewPlano({ ...newPlano, valor_anual: e.target.value })}
            placeholder="R$ anual (opc.)"
            type="number"
            step="0.01"
            className="w-32 bg-zinc-950/50 border border-zinc-800 rounded-lg py-2 px-3 text-white placeholder-zinc-600 text-sm font-mono focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
          />
          <button
            onClick={handleAddPlano}
            disabled={addingPlano || !newPlano.nome || !newPlano.valor_mensal}
            className="flex items-center gap-2 py-2 px-4 rounded-lg text-sm font-medium text-white bg-green-600 hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {addingPlano ? <Loader2 className="animate-spin h-4 w-4" /> : <Plus className="h-4 w-4" />}
            Adicionar
          </button>
        </div>
      </div>
    </div>
  );
}

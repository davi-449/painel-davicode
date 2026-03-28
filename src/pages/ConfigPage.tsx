import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { Settings, Save, Loader2, Bot, Link } from 'lucide-react';

export function ConfigPage() {
  const { token } = useAuth();
  const [webhook, setWebhook] = useState('');
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const { data } = await axios.get('http://localhost:3001/api/config', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setWebhook(data.webhook_n8n || '');
        setPrompt(data.prompt_agente_ia || '');
      } catch (error) {
        console.error('Erro ao buscar configurações', error);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchConfig();
  }, [token]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ text: '', type: '' });

    try {
      await axios.put('http://localhost:3001/api/config', { chave: 'webhook_n8n', valor: webhook }, { headers: { Authorization: `Bearer ${token}` } });
      await axios.put('http://localhost:3001/api/config', { chave: 'prompt_agente_ia', valor: prompt }, { headers: { Authorization: `Bearer ${token}` } });
      setMessage({ text: 'Configurações salvas com sucesso!', type: 'success' });
    } catch (error) {
      setMessage({ text: 'Erro ao salvar configurações.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin text-indigo-500 h-8 w-8" /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
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

      <form onSubmit={handleSave} className="space-y-6 bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-xl">
        
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
    </div>
  );
}

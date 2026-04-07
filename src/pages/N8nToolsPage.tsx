import { useState } from 'react';
import { Bot, Copy, ExternalLink, Check, Network, TerminalSquare, RefreshCw } from 'lucide-react';
import { useToast } from '../hooks/useToast';

const N8N_TOOLS = [
  {
    id: 'create-lead',
    title: 'Criar Novo Lead',
    description: 'Permite à IA inserir um número novo na primeira etapa do funil (Triagem) pelo Supabase Node ou Webhook.',
    schema: {
      "name": "create_lead",
      "description": "Insere um novo lead no sistema de CRM (tabela clientes_crm). Use isso quando o cliente disser que quer iniciar conversa ou se cadastrar.",
      "parameters": {
        "type": "object",
        "properties": {
          "nome": { "type": "string", "description": "Nome do contato fornecido" },
          "telefone": { "type": "string", "description": "Telefone com DDI e DDD (ex: 5511999999999). É a chave principal." },
          "email": { "type": "string", "description": "E-mail se fornecido. Pode ser string vazia." }
        },
        "required": ["nome", "telefone"]
      }
    }
  },
  {
    id: 'update-status',
    title: 'Mover Status CRM',
    description: 'Dá poder à IA de arrastar o card para outras colunas baseado na conversa.',
    schema: {
      "name": "update_lead_status",
      "description": "Atualiza a etapa do funil de vendas (status_funil) do cliente. Use para marcar agenda, follow-up, etc.",
      "parameters": {
        "type": "object",
        "properties": {
          "telefone": { "type": "string", "description": "Número do contato no formato que está no banco (DDI+DDD+Numero)" },
          "novo_status": { 
            "type": "string", 
            "enum": ["TRIAGEM", "CONTATO_INICIAL", "AGENDOU_VISITA", "VISITA_REALIZADA", "PROPOSTA_ENVIADA", "FOLLOWUP", "AGUARDANDO_PAGAMENTO", "FECHADO", "PERDIDO"],
            "description": "A etapa exata pra qual quer mandar"
          }
        },
        "required": ["telefone", "novo_status"]
      }
    }
  },
  {
    id: 'find-client',
    title: 'Encontrar Contexto do Lead',
    description: 'Deixa a IA ler planos, origem, emails ou anotações atuais do cliente se ela precisar saber como abordá-lo.',
    schema: {
      "name": "find_lead_context",
      "description": "Retorna os dados cadastrados, plano e em qual etapa o cliente está agora.",
      "parameters": {
        "type": "object",
        "properties": {
          "telefone": { "type": "string", "description": "Número sem + e 0 pra busca" }
        },
        "required": ["telefone"]
      }
    }
  }
];

export function N8nToolsPage() {
  const { success } = useToast();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = (id: string, obj: object) => {
    navigator.clipboard.writeText(JSON.stringify(obj, null, 2));
    setCopiedId(id);
    success('JSON Copiado!', 'Cole na aba "Custom Tool" do node de AI Agent.');
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="h-full flex flex-col pt-4 animate-slide-in">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold font-heading text-gradient flex items-center gap-3">
            <Network className="w-8 h-8 text-rose-500" /> Ferramentas do Agente IA
          </h2>
          <p className="text-slate-400 mt-2 max-w-2xl">
            Nesta página você encontra o mapeamento nativo para plugar a **Inteligência Artificial (via N8N)** no seu CRM. 
            Use os Schemas (JSONs) abaixo dentro do Agent Node.
          </p>
        </div>
        <a href="https://docs.n8n.io/advanced-ai/agents/custom-tools/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm font-semibold text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 px-4 py-2 rounded-xl transition-colors border border-rose-500/20">
          Docs n8n <ExternalLink className="w-4 h-4" />
        </a>
      </header>

      <div className="grid lg:grid-cols-3 gap-6 pb-6 overflow-y-auto custom-scrollbar flex-1 items-start">
        {N8N_TOOLS.map((tool) => (
          <div key={tool.id} className="glass-card rounded-2xl flex flex-col overflow-hidden border border-white/[0.06] hover:border-rose-500/30 transition-all duration-300 group">
            <div className="p-5 border-b border-white/[0.06] bg-white/[0.01]">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/20 shadow-inner group-hover:scale-110 transition-transform">
                  {tool.id === 'create-lead' ? <TerminalSquare className="w-4 h-4" /> : tool.id === 'update-status' ? <RefreshCw className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
                <h3 className="text-lg font-bold text-white tracking-tight">{tool.title}</h3>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed min-h-[40px]">{tool.description}</p>
            </div>
            
            <div className="relative flex-1 bg-[#09090b] p-5">
              <div className="absolute top-4 right-4 z-10">
                <button
                  onClick={() => copyToClipboard(tool.id, tool.schema)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white/10 hover:bg-white/20 border border-white/10 text-xs font-semibold text-white transition-colors shadow-lg backdrop-blur-sm"
                >
                  {copiedId === tool.id ? (
                    <><Check className="w-3.5 h-3.5 text-emerald-400" /> <span className="text-emerald-400">Copiado</span></>
                  ) : (
                    <><Copy className="w-3.5 h-3.5 text-slate-300" /> Copiar Schema</>
                  )}
                </button>
              </div>

              <pre className="text-xs text-slate-300 font-mono overflow-x-auto custom-scrollbar pb-2">
                <code className="language-json block" dangerouslySetInnerHTML={{
                  __html: JSON.stringify(tool.schema, null, 2)
                    .replace(/"(.*?)":/g, '<span class="text-rose-300">"$1"</span>:')
                    .replace(/:\s"(.*?)"/g, ': <span class="text-emerald-300">"$1"</span>')
                }} />
              </pre>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

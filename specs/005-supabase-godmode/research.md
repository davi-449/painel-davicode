# 🔬 Research — Painel DaviCode: Migração Supabase + Arquitetura Inquebrável

## 1. Stack Atual (Neon + Express + Prisma)

### Frontend
- **Framework:** React 18 + Vite + TypeScript
- **Routing:** react-router-dom v6
- **HTTP Client:** axios com interceptors JWT
- **UI:** Tailwind CSS + Lucide React + @dnd-kit (kanban drag-drop)
- **Hosting:** Lovable (https://painel-davicode.lovable.app)

### Backend
- **Runtime:** Node.js + Express.js + tsx (dev) / dist (prod)
- **ORM:** Prisma Client (postgresql)
- **DB:** Neon PostgreSQL (sa-east-1)
- **Auth:** JWT com bcrypt (secret hardcoded como fallback)
- **Hosting:** Desconhecido (separado do frontend)

---

## 2. 🚨 BUGS CRÍTICOS IDENTIFICADOS NO CÓDIGO

### BUG #1 — Response shape mismatch (FATAL — quebra tudo)
O backend envelopa TODAS as respostas com `{ status, data: { entidade } }`:
```ts
// clienteController.ts
res.status(200).json({ status: 'success', data: { clientes } });
// dashboardController.ts
res.status(200).json({ status: 'success', data: { metrics } });
```
O frontend lê como se a resposta fosse o objeto/array direto:
```ts
// KanbanPage.tsx
const { data } = await api.get('/clientes');
setClientes(data); // ❌ data = { status:'success', data:{ clientes:[] } }

// Dashboard.tsx
setMetrics(metricsRes.data); // ❌ = { status:'success', data:{ metrics:{} } }
setClientes(clientesRes.data); // ❌ mesmo problema
```
**Consequência:** `clientes.filter(...)` e `metrics?.totalLeads` sempre undefined/erro.

### BUG #2 — Status do funil dessincronizado
Frontend (KanbanPage.tsx hardcoded):
```
NOVO | EM_ATENDIMENTO | FOLLOW_UP | PROPOSTA | FECHADO | PERDIDO
```
Enum no schema Prisma:
```
NOVO | EM_ATENDIMENTO | FOLLOWUP | PROPOSTA_ENVIADA | AGUARDANDO_PAGAMENTO | FECHADO | PERDIDO
```
N8N possivelmente usando valores diferentes ainda. Três fontes de verdade conflitantes.

### BUG #3 — JWT secret hardcoded
```ts
const SECRET_KEY = process.env.JWT_SECRET || 'davicode_secret_key_123';
```
Se `JWT_SECRET` não estiver no env de produção, qualquer pessoa pode forjar tokens.

### BUG #4 — Financas completamente mocado
```ts
const despesaTotal = 1500; // Mock
receita: { current: receitaTotal, trend: 15 }, // Mock trend
```
As tabelas `jarvis_ganhos` e `jarvis_gastos` existem no banco mas o service não as usa.

### BUG #5 — Editar cliente não implementado
```ts
onClick={() => alert('Editar cliente')} // literal alert()
```

### BUG #6 — search endpoint retorna wrapper incorreto
`ClienteController.search` retorna `{ status, data: { clientes } }` mas GlobalSearch component provavelmente espera array direto.

### BUG #7 — Sem token refresh
JWT expira em 12h, interceptor faz hard redirect para /login. Sem silent refresh.

### BUG #8 — Kanban sem realtime
Status dos leads so atualiza com refresh manual da página.

### BUG #9 — CORS aberto
```ts
app.use(cors({ origin: '*' }));
```
Qualquer origem pode fazer requests à API.

---

## 3. Schema do Banco (Neon → Supabase)

### Tabelas principais
| Tabela | Finalidade |
|--------|-----------|
| `clientes_crm` | CRM de leads com funil de vendas |
| `atividades` | Timeline de eventos por cliente |
| `planos` | Planos de serviço (mensal/anual) |
| `usuarios_painel` | Usuários do painel (login) |
| `configuracoes` | Key-value store (webhook N8N, prompt IA) |
| `jarvis_ganhos` | Lançamentos de receita (usado pelo N8N) |
| `jarvis_gastos` | Lançamentos de despesa (usado pelo N8N) |
| `n8n_fila_mensagens` | Fila de mensagens do WhatsApp |
| `n8n_historico_mensagens` | Histórico de conversas (session_id) |
| `n8n_status_atendimento` | Estado do atendimento por sessão |
| `solicitacoes_login` | Solicitações de onboarding via WhatsApp |
| `jarvis_controle_renda` | Controle mensal de ciclos de renda |

### Relações
- `clientes_crm` → `planos` (FK nullable)
- `clientes_crm` → `atividades` (1:N, cascade delete)
- `n8n_status_atendimento` ↔ `clientes_crm` via `session_id` = telefone

---

## 4. Fluxo N8N → Banco de Dados

### Como o N8N salva dados:
1. Recebe mensagem WhatsApp → busca/cria em `clientes_crm` por `telefone`
2. Salva histórico em `n8n_historico_mensagens` (session_id = telefone)
3. Atualiza status em `n8n_status_atendimento`
4. Enfileira em `n8n_fila_mensagens` se necessário
5. No fechamento: lança em `jarvis_ganhos`
6. Atualiza `status_funil` de `clientes_crm`

### Como o Painel dispara o N8N:
```ts
// dispatchService.ts
const payload = {
  cliente: { id, nome, telefone, email, plano, origem },
  prompt_ia: configuracoes['prompt_agente_ia'],
  action: 'DISPARO_MANUAL_PAINEL'
};
await axios.post(webhookUrl, payload);
await atividades.create({ tipo: 'DISPARO_N8N', ... });
```

### Problema de coerência:
O N8N escreve `session_id = telefone` mas na tabela `clientes_crm` o campo é `telefone`. Não há FK entre `n8n_status_atendimento.session_id` e `clientes_crm.telefone`. Se o telefone format mudar, o vínculo quebra.

---

## 5. Arquitetura Proposta: Full Supabase

### Por que abandonar Prisma + Express custom auth:
1. Prisma + Neon tem cold starts problemáticos em free tier
2. JWT manual tem falhas de segurança (secret hardcoded, sem refresh)
3. Supabase Auth é Battle-tested, tem refresh token automático
4. Supabase Realtime resolve o BUG #8 (kanban sem RT)
5. RLS policies substituem o middleware de autenticação Express
6. Edge Functions substituem o Express dispatch endpoint
7. `@supabase/supabase-js` substitui Prisma — sem ORM overhead

### Novo Stack
```
Frontend (Lovable/Netlify)
    ↕ supabase-js (auth + realtime + storage)
Supabase (hcarwjemzpwcodhboxvz)
    ├── PostgreSQL (mesmas tabelas migradas)
    ├── Auth (substitui usuarios_painel + JWT custom)
    ├── Realtime (subscriptions para clientes_crm)
    └── Edge Functions (dispatch N8N, ações sensíveis)
N8N (tork.services)
    ↕ postgres direto no Supabase
```

---

## 6. Supabase Project

- **Project ID:** `hcarwjemzpwcodhboxvz`  
- **Key:** `sbp_7865c9b652b10c74bc4b6316d918f40404a1596a`
- **Região:** A definir (recomendado: sa-east-1 para Brasil)
- **Status:** Projeto existe mas pode ser necessário criar via console

> ⚠️ O MCP Supabase retornou erro 403 ao tentar acessar — pode ser que o token seja de outra conta Supabase. Verificar no console.

---

## 7. Benchmarking

| Ferramenta | Painel similar | O que podemos copiar |
|-----------|---------------|----------------------|
| HubSpot | Kanban pipeline | Drag & drop com score por stage |
| Pipedrive | Lead detail sheet | Activity timeline com tipos visuais |
| Notion | Config page | Key-value edit in-line |
| Linear | Realtime updates | Toast "X editou Y agora" |

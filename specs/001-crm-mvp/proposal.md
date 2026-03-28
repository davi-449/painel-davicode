# Proposal: Painel Admin CRM DaviCode — Spec 001-MVP

## 1. Contexto & Objetivo

O Davi vende mensalidades de landing pages premium. A operação de vendas e atendimento já roda com **Chatwoot + Evolution API + n8n + NeonDB**. Este projeto cria um **Painel Administrativo (CRM)** para centralizar o gerenciamento de leads, clientes, funil de vendas e disparos ativos — conectado ao n8n/NeonDB existentes.

**Domínio:** `painel.davicode.me`

---

## 2. Decisões Confirmadas

| Decisão | Escolha | Motivo |
|---|---|---|
| Banco de dados | **NeonDB** (manter atual) | IPv4 grátis, n8n já conectado, dados existentes |
| Backend | **Express + Prisma** | API intermediária simples, conecta no NeonDB |
| Frontend | **Vite + React + TS** | Consistência com portfolio, na mão (não Stitch) |
| Auth | **bcrypt + JWT** | Só 1-2 users, não precisa de serviço externo |
| Hosting frontend | **Vercel** | Já usado no portfolio |
| Hosting backend | **Render / Railway** (free tier) | Express precisa de servidor |
| Inbox/Chatwoot | ❌ Fora do MVP | Será fase futura |
| Asaas | 🔄 Fica no n8n | Cobrança disparada via webhook |
| Estilização | **Tailwind CSS + Shadcn UI** | Componentes prontos, visual premium |

### Planos Comerciais

| Plano | Valor | Descrição |
|---|---|---|
| Mensal | R$ 150,00/mês | Pagamento mês a mês |
| Anual | R$ 99,00/mês (R$ 1.188/ano) | 12x com desconto |

---

## 3. Estado Atual do Banco (NeonDB)

Projeto: `iptv` (`soft-band-46139434`) — Região: `sa-east-1`

### Tabelas Existentes (8 + 1 view)

| Tabela | Uso | Alterar? |
|---|---|---|
| `clientes_crm` | CRM principal (15 cols) | ✅ Evoluir com migrations |
| `n8n_status_atendimento` | Lock de conversa / followup | ❌ N8n usa, não mexer |
| `n8n_historico_mensagens` | Short memory do agente IA | ❌ N8n usa, não mexer |
| `n8n_fila_mensagens` | Queue de msgs pendentes | ❌ N8n usa, não mexer |
| `jarvis_controle_renda` | Controle financeiro pessoal | ❌ Sistema separado |
| `jarvis_ganhos` | Ganhos pessoais | ❌ Sistema separado |
| `jarvis_gastos` | Gastos pessoais | ❌ Sistema separado |
| `solicitacoes_login` | IPTV (outro sistema) | ❌ Outro projeto |
| `v_pendentes` (view) | View do IPTV | ❌ Outro projeto |

### Schema Atual `clientes_crm`

```
id              UUID PK (gen_random_uuid)
telefone        VARCHAR NOT NULL UNIQUE
nome            VARCHAR NULL
email           VARCHAR NULL
cpf_cnpj        VARCHAR NULL
plano           VARCHAR NULL
status_funil    VARCHAR NULL
data_hora_followup VARCHAR NULL  ← ⚠️ deveria ser TIMESTAMP
resumo_lead     TEXT NULL
link_asaas      TEXT NULL
status_pagamento VARCHAR NULL
created_at      TIMESTAMP DEFAULT now()
updated_at      TIMESTAMP DEFAULT now()
id_conversa_chatwoot INT NULL
link_site       TEXT NULL
```

---

## 4. Migrations Planejadas (Evolução do Banco)

> [!IMPORTANT]
> Todas as migrations serão **aditivas** — ZERO breaking changes nas tabelas existentes que o n8n usa.

### Migration 1: Novos tipos ENUM
```sql
CREATE TYPE status_funil_enum AS ENUM (
  'NOVO', 'EM_ATENDIMENTO', 'FOLLOWUP', 
  'PROPOSTA_ENVIADA', 'AGUARDANDO_PAGAMENTO', 
  'FECHADO', 'PERDIDO'
);

CREATE TYPE status_pagamento_enum AS ENUM (
  'PENDENTE', 'CONFIRMADO', 'ATRASADO', 'CANCELADO'
);

CREATE TYPE tipo_plano AS ENUM ('MENSAL', 'ANUAL');
```

### Migration 2: Tabela `planos`
```sql
CREATE TABLE planos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  tipo tipo_plano NOT NULL,
  valor_mensal DECIMAL(10,2) NOT NULL,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO planos (nome, tipo, valor_mensal) VALUES
  ('Landing Page Mensal', 'MENSAL', 150.00),
  ('Landing Page Anual', 'ANUAL', 99.00);
```

### Migration 3: Tabela `usuarios_painel`
```sql
CREATE TABLE usuarios_painel (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  senha_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'ADMIN',
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### Migration 4: Tabela `atividades` (audit trail)
```sql
CREATE TABLE atividades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID REFERENCES clientes_crm(id) ON DELETE CASCADE,
  tipo VARCHAR(50) NOT NULL,
  descricao TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_atividades_cliente ON atividades(cliente_id);
```

### Migration 5: Tabela `configuracoes` (prompt da IA)
```sql
CREATE TABLE configuracoes (
  chave VARCHAR(100) PRIMARY KEY,
  valor TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO configuracoes (chave, valor) VALUES
  ('prompt_agente_ia', 'Você é a secretária virtual da DaviCode...');
```

### Migration 6: Ajustes na `clientes_crm` (sem breaking changes)
```sql
-- Adicionar coluna de plano tipado (mantém a antiga pra n8n não quebrar)
ALTER TABLE clientes_crm ADD COLUMN plano_id UUID REFERENCES planos(id);

-- Corrigir tipo do followup (manter antigo, adicionar novo)
ALTER TABLE clientes_crm ADD COLUMN proximo_followup TIMESTAMPTZ;

-- Adicionar origem do lead
ALTER TABLE clientes_crm ADD COLUMN origem VARCHAR(50) DEFAULT 'WHATSAPP_DIRETO';
```

---

## 5. Arquitetura do Sistema

```
┌──────────────────────────────────────────────┐
│     FRONTEND (Vite + React + Tailwind)       │
│         painel.davicode.me (Vercel)          │
│  ┌──────────┬──────────┬────────────────┐    │
│  │Dashboard │   CRM    │   Settings     │    │
│  │(Gráficos)│ (Kanban) │ (Prompt IA)    │    │
│  └────┬─────┴─────┬────┴───────┬────────┘    │
└───────┼───────────┼────────────┼─────────────┘
        │ API calls │            │
┌───────▼───────────▼────────────▼─────────────┐
│   BACKEND (Express + Prisma + JWT)           │
│   Hospedado no Render/Railway (free)         │
│   • /api/auth     → login, verify token      │
│   • /api/clientes → CRUD + kanban            │
│   • /api/dashboard → queries agregadas       │
│   • /api/config   → prompt da IA             │
│   • /api/dispatch → webhooks pro n8n         │
└───────────────────┬──────────────────────────┘
                    │ PostgreSQL
        ┌───────────▼──────────────┐
        │   NeonDB (sa-east-1)     │
        │   Projeto: iptv          │
        │   • clientes_crm  ←──→  n8n lê/escreve aqui
        │   • planos (nova)        │
        │   • atividades (nova)    │
        │   • usuarios_painel      │
        │   • configuracoes        │
        │   • n8n_* (intocado)     │
        └──────────────────────────┘
                    ↕ Webhooks
        ┌───────────────────────┐
        │     n8n (existente)   │
        │  • Agente IA Gemini   │
        │  • Chatwoot / Evo API │
        │  • Asaas (cobrança)   │
        │  • ElevenLabs (TTS)   │
        └───────────────────────┘
```

---

## 6. Estrutura de Pastas

### Backend (`/backend`)
```
/backend
  /prisma
    schema.prisma
  /src
    /controllers
      AuthController.ts
      ClienteController.ts
      DashboardController.ts
      ConfigController.ts
    /routes
      auth.routes.ts
      clientes.routes.ts
      dashboard.routes.ts
      config.routes.ts
      dispatch.routes.ts
    /middlewares
      authMiddleware.ts
    /services
      N8nDispatcher.ts
    server.ts
  .env
  package.json
  tsconfig.json
```

### Frontend (`/frontend`)
```
/frontend (painel-davicode/)
  /src
    /components
      /ui          → Shadcn (Button, Card, Sheet, Input, etc.)
      /layout      → Sidebar, TopBar, ProtectedRoute
      /kanban      → KanbanBoard, KanbanColumn, KanbanCard
      /dashboard   → KPICard, ChartMRR, ChartFunil
      /clientes    → FichaCliente, TimelineAtividades
    /pages
      LoginPage.tsx
      DashboardPage.tsx
      CrmPage.tsx
      SettingsPage.tsx
    /services
      api.ts        → instância axios com interceptor JWT
      auth.ts       → login, logout, getUser
      clientes.ts   → CRUD
      dashboard.ts  → queries
    /context
      AuthContext.tsx
    /hooks
      useAuth.ts
      useClientes.ts
    App.tsx
    main.tsx
  /public
    favicon.svg
  .env
  tailwind.config.js
  vite.config.ts
  package.json
```

---

## 7. Telas do Painel

### 7.1 Login (`/login`)
- Email + Senha → POST `/api/auth/login` → JWT token
- Dark mode, logo DaviCode centralizado
- Redirect → `/dashboard`

### 7.2 Dashboard (`/dashboard`)
- **4 KPI Cards:**
  - 💰 MRR (Monthly Recurring Revenue): soma de `planos.valor_mensal` onde `status_funil = 'FECHADO'`
  - 👥 Total Leads: count de `clientes_crm`
  - 📈 Taxa de Conversão: `FECHADO / total * 100`
  - 🆕 Leads Novos (7d): count `WHERE created_at > now() - interval '7 days'`
- **Gráfico de barras:** Leads por mês (últimos 6 meses)
- **Gráfico de pizza:** Distribuição por `status_funil`
- **Lista:** Últimas 5 atividades do sistema

### 7.3 CRM Kanban (`/crm`)
- **6 colunas** drag-and-drop:
  - Novo → Em Atendimento → Follow-up → Proposta Enviada → Aguardando Pagamento → Fechado
- **Card:** Nome, telefone, plano, badge de status, próximo follow-up
- **Click no card → Sheet lateral** com ficha completa:
  - Dados pessoais
  - Resumo da IA (long memory)
  - Status dropdown (muda inline)
  - Plano (dropdown dos planos cadastrados)
  - Botão "Disparar no n8n" → POST `/api/dispatch` com `{ action, cliente_id }`
  - Timeline de atividades

### 7.4 Settings (`/settings`)
- **Prompt da IA:** Textarea grande + botão salvar → `PUT /api/config/prompt_agente_ia`
  - O n8n lê essa tabela `configuracoes` no início de cada conversa
- **Gestão de Planos:** Tabela editável com nome, tipo, valor + botão novo plano

---

## 8. User Stories (MVP)

| # | Como... | Quero... | Para... |
|---|---|---|---|
| US-01 | Admin | fazer login com email/senha | acessar o painel protegido |
| US-02 | Admin | ver KPIs no Dashboard | tomar decisões rápidas sobre vendas |
| US-03 | Admin | visualizar leads no Kanban | enxergar o funil completo |
| US-04 | Admin | arrastar cards entre colunas | mudar status do funil visualmente |
| US-05 | Admin | clicar num card e ver ficha completa | ter contexto total do lead |
| US-06 | Admin | disparar ação via botão (→ n8n) | enviar cobrança sem abrir n8n |
| US-07 | Admin | editar o prompt do agente IA | iterar o atendimento sem acessar n8n |
| US-08 | Admin | gerenciar planos (CRUD) | flexibilidade comercial |
| US-09 | Admin | ver timeline de atividades | auditoria do que aconteceu com o lead |

---

## 9. Sobre Stitch vs Código Manual

**Recomendação: Fazer na mão.** Motivos:
- Painel admin tem lógica de negócio complexa (drag-and-drop, queries agregadas JWT, webhooks)
- Stitch é ideal para marketing pages / landing pages, não para dashboards interativos
- Precisamos controlar cada request para o backend Express
- Shadcn UI já entrega componentes prontos bonitos sem precisar gerar no Stitch

---

## 10. Critérios de Aceite (MVP)

1. ✅ Login funcional com JWT
2. ✅ Dashboard com 4 KPIs + 2 gráficos
3. ✅ Kanban funcional com drag-and-drop persistindo no NeonDB
4. ✅ Ficha do cliente com dados + resumo IA + timeline
5. ✅ Botão de disparo que manda webhook pro n8n
6. ✅ Settings: editor de prompt + CRUD planos
7. ✅ Deploy no Vercel (front) + Render (back)
8. ✅ Domínio `painel.davicode.me` configurado

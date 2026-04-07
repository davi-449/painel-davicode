# 📋 Proposal — Painel DaviCode: Arquitetura Inquebrável com Supabase (005-supabase-godmode)

## Visão Geral

Migrar o Painel DaviCode de uma arquitetura Neon + Express + Prisma (repleta de bugs) para **Supabase nativo**, eliminando 9 bugs críticos identificados, tornando o sistema coerente com o N8N e entregando um CRM verdadeiramente utilizável. O objetivo é que painel, N8N e banco conversem como **um único organismo**.

---

## Problemas a Resolver (prioridade decrescente)

| # | Bug | Impacto | Causa |
|---|-----|---------|-------|
| 1 | Response shape mismatch | **FATAL** | Backend retorna `{status, data:{entidade}}`, frontend lê `res.data` direto |
| 2 | Status funil dessincronizado | **ALTO** | 3 fontes de verdade: frontend, Prisma enum, N8N |
| 3 | JWT secret hardcoded | **ALTO** | Fallback `'davicode_secret_key_123'` em produção |
| 4 | Financas totalmente mockado | **MÉDIO** | `despesaTotal = 1500` hardcoded, `jarvis_ganhos/gastos` ignorados |
| 5 | Editar cliente inexistente | **MÉDIO** | `alert('Editar cliente')` no código |
| 6 | Kanban sem realtime | **MÉDIO** | Sem subscription, requer refresh manual |
| 7 | Sem token refresh | **MÉDIO** | Hard redirect a cada 12h |
| 8 | CORS aberto (`*`) | **BAIXO** | Qualquer origem pode acessar a API |
| 9 | N8N ↔ Banco sem FK | **BAIXO** | `session_id` sem FK para `clientes_crm.telefone` |

---

## Requisitos Funcionais

### RF-01: Autenticação via Supabase Auth
- Login com email + senha via `supabase.auth.signInWithPassword()`
- Refresh token automático (sem hard redirect a cada 12h)
- `onAuthStateChange` listener substituindo interceptor Axios 401

### RF-02: CRM de Leads (Kanban) — Dados Reais
- Buscar `clientes_crm` via Supabase JS client com `select('*, planos(*)')`
- Drag-and-drop atualiza `status_funil` em tempo real via `update()`
- **Definição ÚNICA e canônica** dos status: `NOVO | EM_ATENDIMENTO | FOLLOW_UP | PROPOSTA | FECHADO | PERDIDO`
- Atividade criada automaticamente na mudança de status (trigger PostgreSQL ou função)

### RF-03: Realtime Kanban
- Subscription em `clientes_crm` para `INSERT`, `UPDATE`, `DELETE`
- Quando N8N atualiza um lead, painel reflete instantaneamente sem refresh
- Toast "Lead X movido para FOLLOW_UP" quando atualizado externamente

### RF-04: Editar Cliente (modal completo)
- Formulário com: nome, telefone, email, plano, origem, status_funil, resumo_lead
- Validação com Zod
- Salvar via `supabase.from('clientes_crm').update()`

### RF-05: Dashboard com Dados Reais
- KPIs: Total Leads, Vendas (FECHADO), Receita (soma planos fechados), Atividades hoje
- Funil: `.select('status_funil').eq(...)` por status
- Sem mocks de nenhum tipo

### RF-06: Finanças com Dados Reais (Jarvis)
- Receita: `jarvis_ganhos` filtrado por mês
- Despesas: `jarvis_gastos` filtrado por mês
- Controle de renda: `jarvis_controle_renda`
- Gráfico histórico mensal real (não mockado)

### RF-07: Dispatch N8N via Edge Function
- Edge Function `dispatch-n8n` recebe `cliente_id`
- Lê `configuracoes` (webhook_n8n, prompt_agente_ia)
- Faz POST para N8N com payload padronizado
- Registra atividade `DISPARO_N8N`
- Não expõe o URL do webhook ao frontend

### RF-08: Configurações
- CRUD de `configuracoes` (chave/valor) pelo painel
- Campos específicos: webhook_n8n, prompt_agente_ia
- Gestão de Planos (nome, tipo, valor, ativo)

### RF-09: Coerência N8N ↔ Painel
- Status funil padronizado em arquivo `constants.ts` compartilhado
- Edge Function de normalização de telefone (remove formatação)
- N8N deve usar exatamente os mesmos valores de `status_funil` que o painel

---

## Requisitos Não Funcionais

- **RNF-01:** Supabase como única fonte de dados (sem Prisma, sem Neon)
- **RNF-02:** Frontend sem backend Express separado (exceto Edge Functions)
- **RNF-03:** RLS (Row Level Security) para todas as tabelas sensíveis
- **RNF-04:** Todas as operações devem funcionar no Lovable (client-side supabase-js)
- **RNF-05:** N8N acessa Supabase via connection string Postgres direta (mantido)

---

## User Stories

### US-01: Login seguro
> **Como** administrador do painel,  
> **Quero** fazer login com email e senha com sessão que se renova automaticamente,  
> **Para** não ser deslogado no meio do trabalho.

### US-02: Kanban em tempo real
> **Como** vendedor acompanhando leads,  
> **Quero** ver o kanban atualizar automaticamente quando o N8N mover um lead,  
> **Para** ter visibilidade do pipeline sem precisar recarregar a página.

### US-03: Editar lead completo
> **Como** usuário do painel,  
> **Quero** editar todas as informações de um lead em um modal,  
> **Para** manter os dados atualizados sem precisar acessar o banco.

### US-04: Financial real
> **Como** dono do negócio,  
> **Quero** ver receitas e despesas reais da empresa no painel,  
> **Para** acompanhar a saúde financeira com dados do N8N.

### US-05: Disparar N8N com segurança
> **Como** vendedor,  
> **Quero** disparar o fluxo N8N para um lead específico com um clique,  
> **Para** iniciar o atendimento automatizado sem expor credenciais.

---

## BDD Scenarios

### Cenário: Login e renovação de sessão
- **Given:** O usuário está na tela de login
- **When:** Digita `admin@davicode.me` / `admin` e clica em entrar
- **Then:** É redirecionado para `/dashboard` em < 2s, token é salvo e renovado automaticamente após 1h

### Cenário: Kanban atualiza via N8N
- **Given:** O painel está aberto no Kanban com lead "João" em `NOVO`
- **When:** O N8N processa uma mensagem de João e muda seu status para `EM_ATENDIMENTO`
- **Then:** Em < 3s (sem reload), o card de João aparece na coluna "Em Atendimento" com toast de notificação

### Cenário: Editar e salvar lead
- **Given:** O usuário abre o sheet de detalhes de um lead
- **When:** Clica em "Editar", altera o nome e clica em "Salvar"
- **Then:** O card no Kanban atualiza imediatamente, atividade "EDICAO" é registrada

### Cenário: Dashboard com dados reais
- **Given:** Existem 3 leads com status FECHADO e planos de R$500, R$800 e R$1200
- **When:** O usuário acessa `/dashboard`
- **Then:** KPI "Vendas" mostra 3, "Receita" mostra R$2.500,00, sem valores mockados

### Cenário: Financas reais por mês
- **Given:** O N8N registrou R$5.000 em `jarvis_ganhos` em Março
- **When:** O usuário acessa `/financas` e seleciona Março
- **Then:** O gráfico mostra R$5.000 de receita, não o mock hardcoded de R$8.000

### Cenário: Dispatch N8N seguro
- **Given:** O webhook N8N está configurado em `configuracoes`
- **When:** Usuário clica em "Disparar" em um lead
- **Then:** Edge Function chama o N8N, atividade DISPARO_N8N é criada, URL do webhook nunca exposta ao client

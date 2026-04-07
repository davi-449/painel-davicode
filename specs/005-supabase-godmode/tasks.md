# ✅ Tasks — Painel DaviCode: Supabase Godmode (005-supabase-godmode)

## Fase 0: Pré-requisitos e Setup

- [ ] **0.1** Verificar/criar projeto Supabase `hcarwjemzpwcodhboxvz` no console em https://app.supabase.com
- [ ] **0.2** Obter `SUPABASE_URL`, `ANON_KEY` e `SERVICE_ROLE_KEY` do projeto
- [ ] **0.3** Instalar dependências no frontend:
  ```bash
  npm install @supabase/supabase-js
  npm uninstall axios  # substituído por supabase-js
  ```
- [ ] **0.4** Criar `.env.local` no raiz do frontend com:
  ```
  VITE_SUPABASE_URL=https://hcarwjemzpwcodhboxvz.supabase.co
  VITE_SUPABASE_ANON_KEY=<anon_key>
  ```
- [ ] **0.5** Instalar Supabase CLI para Edge Functions:
  ```bash
  npm install -g supabase
  supabase login
  supabase link --project-ref hcarwjemzpwcodhboxvz
  ```

---

## Fase 1: Migração do Banco de Dados (Neon → Supabase)

- [ ] **1.1** Executar o SQL de criação de todas as tabelas no Supabase SQL Editor (conforme `design.md` seção 1.1)
- [ ] **1.2** Executar criação dos índices de performance
- [ ] **1.3** Executar criação do trigger `set_clientes_updated_at`
- [ ] **1.4** Habilitar RLS em todas as tabelas sensíveis (conforme `design.md` seção 1.2)
- [ ] **1.5** Criar policies RLS para usuários autenticados
- [ ] **1.6** Habilitar Realtime para `clientes_crm` e `atividades` no Supabase Dashboard → Database → Replication
- [ ] **1.7** Exportar dados do Neon via `pg_dump` e importar no Supabase via `psql` ou Supabase Dashboard
- [ ] **1.8** Inserir usuário admin via Supabase Auth → Authentication → Users:
  - Email: `admin@davicode.me` | Senha: `admin`
- [ ] **1.9** Inserir configurações iniciais:
  ```sql
  INSERT INTO configuracoes (chave, valor) VALUES
    ('webhook_n8n', '<url_do_webhook_n8n>'),
    ('prompt_agente_ia', '<prompt_do_agente>');
  ```
- [ ] **1.10** Validar todos os dados migraram corretamente com `SELECT count(*) FROM clientes_crm;`

---

## Fase 2: Constants — Source of Truth do Funil

- [ ] **2.1** Criar `src/constants/funil.ts` com `FUNIL_STAGES` e tipo `FunilStatus`
- [ ] **2.2** Atualizar `KanbanPage.tsx` para importar `FUNIL_STAGES` de `constants/funil.ts` (remover hardcode local)
- [ ] **2.3** Atualizar `Dashboard.tsx` para usar `FUNIL_STAGES` (remover `FUNNEL_COLORS` e `FUNNEL_LABELS` duplicados)
- [ ] **2.4** Verificar e documentar para o N8N: os IDs exatos dos status que deve usar

---

## Fase 3: Supabase Client + AuthContext

- [ ] **3.1** Criar `src/lib/supabase.ts` com cliente Supabase configurado (conforme `design.md` seção 4)
- [ ] **3.2** Deletar `src/lib/api.ts` (axios client)
- [ ] **3.3** Refatorar `src/contexts/AuthContext.tsx`:
  - Substituir `useState` de token JWT por `supabase.auth.getSession()`
  - Adicionar `supabase.auth.onAuthStateChange()` listener
  - `login()` → `supabase.auth.signInWithPassword()`
  - `logout()` → `supabase.auth.signOut()`
- [ ] **3.4** Refatorar `src/pages/Login.tsx`:
  - Remover chamada `api.post('/auth/login')`
  - Usar `useAuth().login(email, senha)`
- [ ] **3.5** Refatorar `src/components/ProtectedRoute.tsx`:
  - Verificar `supabase.auth.getUser()` ou `user` do AuthContext
  - Mostrar skeleton enquanto `loading === true`

---

## Fase 4: Hook useClientes (Realtime)

- [ ] **4.1** Criar `src/hooks/useClientes.ts` com:
  - Fetch inicial com `supabase.from('clientes_crm').select('*, planos(*)')`
  - Subscription realtime para INSERT/UPDATE/DELETE
  - Função `updateStatus(clienteId, newStatus)` via supabase update
  - Função `createCliente(data)` via supabase insert
  - Função `updateCliente(id, data)` via supabase update
  - Função `getAtividades(clienteId)` via supabase select
- [ ] **4.2** Refatorar `src/pages/KanbanPage.tsx`:
  - Remover `import api from '../lib/api'`
  - Usar `useClientes()` hook
  - `handleDragEnd` → usar `updateStatus()` do hook
  - Remover `fetchClientes` manual
- [ ] **4.3** Adicionar indicador visual de conexão realtime no header do Kanban:
  - ● verde pulsante = conectado
  - ● cinza = reconectando

---

## Fase 5: EditClienteModal

- [ ] **5.1** Criar `src/components/ui/EditClienteModal.tsx`:
  - Drawer lateral (mesmo padrão visual do `ClienteSheet`)
  - Campos: nome, telefone, email, plano_id (select dos planos), origem, status_funil, resumo_lead
  - Validação com Zod
  - Submit via `useClientes().updateCliente()`
  - Registrar atividade `EDICAO` após salvar (via supabase insert em `atividades`)
- [ ] **5.2** Integrar `EditClienteModal` no `ClienteSheet`:
  - Substituir `alert('Editar cliente')` pelo modal
  - Passar `cliente` e callback `onUpdated`

---

## Fase 6: Dashboard com Dados Reais

- [ ] **6.1** Criar `src/hooks/useMetrics.ts`:
  - `totalLeads`: `supabase.from('clientes_crm').select('*', { count: 'exact', head: true })`
  - `vendas`: count onde `status_funil = 'FECHADO'`
  - `receita`: sum de `planos.valor_mensal` onde status = FECHADO
  - `atividadesHoje`: count de `atividades` com `created_at >= today`
- [ ] **6.2** Refatorar `src/pages/Dashboard.tsx`:
  - Usar `useMetrics()` e `useClientes()`
  - Remover `import api from '../lib/api'`
  - KPIs mostram dados reais

---

## Fase 7: Finanças com Dados Reais

- [ ] **7.1** Criar `src/hooks/useFinancas.ts`:
  - `getGanhos(mes)` → `supabase.from('jarvis_ganhos').select('*').gte('data', startOfMonth).lte('data', endOfMonth)`
  - `getGastos(mes)` → idem para `jarvis_gastos`
  - Calcular receita, despesa, saldo por mês
  - Histórico: últimos 6 meses
- [ ] **7.2** Refatorar `src/pages/FinancasPage.tsx`:
  - Usar `useFinancas()`
  - Remover mock `despesaTotal = 1500`
  - Adicionar seletor de mês
  - Gráfico histórico com dados reais

---

## Fase 8: Edge Function — Dispatch N8N

- [ ] **8.1** Criar estrutura `supabase/functions/dispatch-n8n/index.ts` (conforme `design.md` seção 7)
- [ ] **8.2** Deploy da Edge Function:
  ```bash
  supabase functions deploy dispatch-n8n --no-verify-jwt
  ```
  > Nota: `--no-verify-jwt` para aceitar chamadas autenticadas via ANON key com RLS ativo
- [ ] **8.3** Refatorar `KanbanPage.tsx` `handleDispatch`:
  - Remover `api.post('/dispatch', { cliente_id })`
  - Substituir por `supabase.functions.invoke('dispatch-n8n', { body: { cliente_id } })`
- [ ] **8.4** Testar dispatch ponta a ponta: Painel → Edge Function → N8N → atividade criada

---

## Fase 9: Configurações e Planos

- [ ] **9.1** Refatorar `src/pages/ConfigPage.tsx`:
  - `supabase.from('configuracoes').select('*')` para listar
  - `supabase.from('configuracoes').upsert()` para salvar
- [ ] **9.2** Refatorar gestão de planos:
  - `supabase.from('planos').select('*').eq('ativo', true)` para listar
  - Create/Update/Delete via supabase

---

## Fase 10: Limpeza e Remoção do Backend Express

- [ ] **10.1** Confirmar que TODAS as chamadas `api.get/post/patch` foram removidas do frontend
- [ ] **10.2** Deletar `src/lib/api.ts`
- [ ] **10.3** Verificar que `axios` não está mais sendo importado em nenhum arquivo
- [ ] **10.4** Atualizar `package.json` — remover `axios` das dependencies
- [ ] **10.5** (Opcional) Arquivar a pasta `backend/` — não deletar ainda, mas marcar como deprecated
- [ ] **10.6** Remover variáveis de ambiente do Lovable que apontem para `VITE_API_URL`
- [ ] **10.7** Adicionar `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` nas env vars do Lovable

---

## Fase 11: Coerência N8N

- [ ] **11.1** Atualizar string de conexão do N8N para apontar para o Supabase PostgreSQL
- [ ] **11.2** Verificar/corrigir nos workflows do N8N: todos os valores de `status_funil` usam os IDs canônicos (`NOVO`, `EM_ATENDIMENTO`, `FOLLOW_UP`, `PROPOSTA`, `FECHADO`, `PERDIDO`)
- [ ] **11.3** Testar ciclo completo: mensagem WhatsApp → N8N → Supabase → Painel reflete em realtime

---

## Fase 12: Validação BDD

- [ ] **12.1** `[BDD-1]` Login → dashboard em < 2s, token renova automaticamente
- [ ] **12.2** `[BDD-2]` N8N muda status → Kanban reflete em < 3s sem reload
- [ ] **12.3** `[BDD-3]` Editar lead → card atualiza + atividade criada
- [ ] **12.4** `[BDD-4]` Dashboard mostra totalLeads, vendas, receita real (sem mock)
- [ ] **12.5** `[BDD-5]` Financas mostra ganhos reais do `jarvis_ganhos`
- [ ] **12.6** `[BDD-6]` Dispatch: Edge Function chama N8N + atividade DISPARO_N8N registrada

---

## Fase 13: Git e Deploy

- [ ] **13.1** Commit: `feat: 005-supabase-godmode specs`
- [ ] **13.2** Commit: `feat: migrate from neon+express to supabase-js (all phases)`
- [ ] **13.3** Push para `https://github.com/davi-449/painel`
- [ ] **13.4** Lovable detecta push e faz re-deploy automático
- [ ] **13.5** Testar em https://painel-davicode.lovable.app com credenciais reais

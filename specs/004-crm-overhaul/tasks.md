# Tasks 004 — DaviCode CRM Overhaul

## Fase 1 — Fundação (Backend + Utils)
- [ ] **1.1** Criar `src/utils/status.ts` com `normalizeStatus()` (extrair de Kanban/Dashboard)
- [ ] **1.2** Criar `src/hooks/useToast.ts` com toast simples (ou instalar `react-hot-toast`)
- [ ] **1.3** Backend: adicionar `DELETE /clientes/:id` em `ClienteController.ts` + `clienteRoutes.ts`

## Fase 2 — Componentes Reutilizáveis
- [ ] **2.1** Criar `src/components/LeadDrawer.tsx` com tabs: Dados / Atividades / Follow-up
  - Campos editáveis em linha com botão Salvar
  - Feed de atividades com timestamp
  - DateTime picker para próximo follow-up
- [ ] **2.2** Criar `src/components/ConfirmModal.tsx` — modal de confirmação de deleção
- [ ] **2.3** Criar `src/components/NovoLeadModal.tsx` — formulário de Novo Lead em overlay
  - Aproveitar lógica de `NovoLead.tsx` existente

## Fase 3 — Upgrade de Páginas
- [ ] **3.1** Refatorar `ClientesList.tsx`: remover `ClienteSheet` inline, usar `LeadDrawer`
  - Adicionar coluna "Próximo Follow-up" na tabela
  - Adicionar ordenação por data/status via estado local
  - Adicionar botão deletar via `ConfirmModal`
- [ ] **3.2** Refatorar `KanbanPage.tsx`: substituir `ClienteSheet` por `LeadDrawer`  
  - Confirmar que drag-and-drop envia PATCH e usa feedback otimista
- [ ] **3.3** Upgrade `Dashboard.tsx`:
  - Funil horizontal com barras de progresso tipo `div` em vez de só recharts  
  - Atividades recentes clicáveis (abre `LeadDrawer`)
- [ ] **3.4** Upgrade `DashboardLayout.tsx`:
  - Logo com gradiente indigo/purple
  - Separador visual entre grupos de nav
  - Badge de count em "Todos os Leads"

## Fase 4 — Integração & Limpeza
- [ ] **4.1** Remover rota `/clientes/novo` do `App.tsx` (substituída por modal)
- [ ] **4.2** Substituir todos os `alert()` por toasts do `useToast`
- [ ] **4.3** Adicionar `<Toaster />` no `App.tsx`
- [ ] **4.4** `tsc --noEmit` deve passar sem erros
- [ ] **4.5** `git commit` + `git push origin main`

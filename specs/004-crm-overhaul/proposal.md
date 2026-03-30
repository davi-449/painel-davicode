# Spec 004 — DaviCode CRM Full Overhaul

## Objetivo
Transformar o painel de um MVP básico em um CRM funcional, bonito e produtivo para gerenciar leads, funil, histórico de atividades, follow-ups e métricas — tudo em uma única interface dark e moderna.

---

## O que JÁ EXISTE e será REUTILIZADO

| Item | Arquivo | Status |
|------|---------|--------|
| Auth JWT + AuthContext | `AuthController.ts`, `contexts/AuthContext.tsx` | ✅ Reutilizado |
| CRUD de Clientes | `ClienteController.ts`, `clienteRoutes.ts` | ✅ Reutilizado (extender) |
| Kanban Board | `KanbanPage.tsx` | ✅ Reutilizado (visual upgrade) |
| Lista de Clientes | `ClientesList.tsx` | ✅ Reutilizado (upgrade + ações) |
| Dashboard KPIs | `Dashboard.tsx` | ✅ Reutilizado (upgrade) |
| Config + Planos | `ConfigPage.tsx`, `PlanoController.ts` | ✅ Reutilizado |
| Normalização de status | `normalizeStatus()` em Kanban/Dashboard | ✅ Extrair para utils |
| Schema Prisma | `schema.prisma` (clientes_crm, atividades, planos, configuracoes) | ✅ Reutilizado |

## O que PRECISA SER CRIADO

| Item | Justificativa |
|------|---------------|
| **Design System Global** (`index.css`) | Tipografia unificada (Inter), tokens de cor, animações |
| **Sidebar redesenhada** | Logo, agrupamentos de nav, avatar no rodapé |
| **LeadDrawer unificado** | Gaveta lateral com tabs (Dados, Atividades, Follow-up) |
| **Atividades feed** dentro do drawer | Carregar `GET /clientes/:id` que já retorna `atividades[]` |
| **Ação: Editar lead** in-place no drawer | PUT `/clientes/:id` já existe no backend |
| **Ação: Deletar lead** | DELETE `/clientes/:id` — endpoint novo no backend |
| **Dashboard Upgrade** | KPIs com sparkline, funil horizontal visual, atividades clicáveis |
| **Novo Lead UX** | Inline no drawer/modal em vez de página separada |
| **Toast notifications** | Substituir `alert()` por toasts não-bloqueantes |
| **EditClienteModal / drawer tabs** | Interface visual para editar status + dados + agendar follow-up |

---

## User Stories

1. **Como operador**, quero ver todos os leads em tabela com busca, ordenação por status e data, e abrir detalhes em gaveta lateral sem sair da página.
2. **Como operador**, quero editar nome, email, telefone, plano e status de um lead diretamente no drawer (com feedback visual de salvo/erro).
3. **Como operador**, quero ver o histórico completo de atividades do lead (com data e descrição) dentro do mesmo drawer.
4. **Como operador**, quero agendar um próximo follow-up com data/hora pelo drawer, que será salvo em `proximo_followup`.
5. **Como operador**, quero que o Dashboard mostre KPIs reais com mini gráfico de evolução, e que o funil seja visualmente distribuído.
6. **Como operador**, quero arrastar cards do Kanban e a mudança refletir em tempo real (feedback otimista).
7. **Como admin**, quero deletar um lead com confirmação visual (modal de confirmar, não `window.confirm`).
8. **Como usuário**, quero ver toasts de sucesso/erro em vez de `alert()` nativos.

---

## Critérios de Aceite

- [ ] Sidebar: novo visual com ícones em grupos, responsivo
- [ ] LeadDrawer com 3 tabs: Dados | Atividades | Follow-up
- [ ] Editar lead via PUT sem recarregar a página
- [ ] Deletar lead via DELETE com modal de confirmação
- [ ] Feed de atividades carregado via `GET /clientes/:id`
- [ ] Follow-up salva `proximo_followup` via PATCH
- [ ] Dashboard com sparklines e funil horizontal
- [ ] Toasts substituem todos os `alert()` e `console.error` expostos
- [ ] Novo Lead convertido para modal/drawer em vez de página separada
- [ ] Kanban: drag-and-drop envia PATCH `/clientes/:id` e atualiza coluna com feedback otimista
- [ ] Rota DELETE `/clientes/:id` no backend (nova)
- [ ] TypeScript compila sem erros (`tsc --noEmit`)

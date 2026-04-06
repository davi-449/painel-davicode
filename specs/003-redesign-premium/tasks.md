# Tasks — 003: Redesign Premium do Painel DaviCode

## Fase 0 — Foundation (Design System)
- [x] 0.1 Reescrever `src/index.css` com todos os design tokens (cores, fontes, Liquid Glass, skeleton shimmer, motion)
- [x] 0.2 Adicionar imports do Google Fonts (Plus Jakarta Sans, Inter, JetBrains Mono) no `index.html`
- [x] 0.3 Criar arquivo `src/lib/cn.ts` com utility `cn()` (se não existir)
- [x] 0.4 Criar `src/contexts/ToastContext.tsx` com provider global
- [x] 0.5 Criar `src/hooks/useToast.ts`
- [ ] **QA Gate 0:** Hot reload funcionando, fontes carregando, sem erros de console

## Fase 1 — Componentes UI Base
- [x] 1.1 Criar `src/components/ui/StatusBadge.tsx` — badge semântico por status do funil com variantes de cor
- [x] 1.2 Criar `src/components/ui/SkeletonCard.tsx` — skeleton shimmer para KPI cards
- [x] 1.3 Criar `src/components/ui/SkeletonKanban.tsx` — skeleton para colunas, 3 cards por coluna
- [x] 1.4 Criar `src/components/ui/Toast.tsx` — componente de toast com 4 tipos (success, error, info, warning)
- [x] 1.5 Criar `src/components/ui/ActivityTimeline.tsx` — lista de atividades cronológica com ícone por tipo
- [x] 1.6 Criar `src/components/ui/GlobalSearch.tsx` — modal Ctrl+K com input, debounce 300ms, lista de resultados
- [x] 1.7 Criar `src/components/ui/FinanceKPI.tsx` — card KPI com valor, label, trend (+X% vs mês anterior)
- [ ] **QA Gate 1:** Todos os componentes renderizam sem erros no Storybook ou na página de testes

## Fase 2 — Layout Global
- [x] 2.1 Reescrever `src/layouts/AppLayout.tsx` — estrutura sidebar + main com Liquid Glass
- [x] 2.2 Reescrever `src/components/layout/Sidebar.tsx`:
  - Logo DaviCode
  - Avatar do usuário logado (iniciais em gradient pill)
  - Nav items com ícone Lucide + label + estado active
  - Botão logout no rodapé
  - Glass surface: `bg-white/[0.03] backdrop-blur-xl border-r border-white/[0.08]`
- [x] 2.3 Criar `src/components/layout/TopBar.tsx`:
  - Pesquisa global (clique abre GlobalSearch modal)
  - Botão Ctrl+K visual hint
  - Data/hora atual
- [x] 2.4 Envolver `App.tsx` com `ToastProvider`
- [ ] **QA Gate 2:** Sidebar aparece em todas as páginas, TopBar visível, hover/active states corretos

## Fase 3 — Redesign Dashboard
- [x] 3.1 Substituir spinner de loading por `SkeletonCard` (4x) + placeholders de gráficos
- [x] 3.2 Redesenhar KPI cards com `glass-card`, valor em `text-5xl`, glow no hover
- [x] 3.3 Extrair `FunnelBarChart.tsx` — barras com gradiente indigo→violet, tooltip dark custom
- [x] 3.4 Redesenhar PieChart — donut maior, legenda em grid, cores semânticas por status
- [x] 3.5 Redesenhar "Atividades Recentes" — avatar inicial, nome, `StatusBadge`, timestamp relativo
- [ ] **QA Gate 3:** Dashboard carrega skeleton → dados em < 2s, sem layout shift, visual premium

## Fase 4 — Redesign Kanban
- [x] 4.1 Redesenhar `KanbanColumn` — background `bg-white/[0.02]`, header com dot indicator e badge count colorido
- [x] 4.2 Redesenhar `KanbanCard` — glass-card, mostrar plano, origem, timestamp relativo; hover lift
- [x] 4.3 Redesenhar `DragOverlay` — card rotacionado com ring-indigo e shadow dramática
- [x] 4.4 Reescrever `ClienteSheet` (drawer):
  - Header: avatar 60px gradient, nome h2, email, StatusBadge
  - Seção info grid
  - Stepper de jornada existente (manter)
  - **NOVO:** Seção "Atividades" usando `ActivityTimeline.tsx` (fetch `/api/clientes/:id/atividades`)
  - Footer fixo: WhatsApp | Disparar | Editar
- [x] 4.5 Substituir `alert()` por `useToast()` no handleDispatch e handleDragEnd
- [x] 4.6 Adicionar skeleton do Kanban (`SkeletonKanban`) enquanto carrega
- [ ] **QA Gate 4:** Kanban renderiza colunas, drag-and-drop funciona, drawer abre com animação, toast aparece ao mover

## Fase 5 — Nova Página de Finanças
- [ ] 5.1 Criar endpoint backend `GET /api/financas/resumo`:
  - Agrega `jarvis_ganhos` e `jarvis_gastos` por mês
  - Retorna: `{ mesAtual: { ganhos, gastos, saldo }, historico: [{ mes, ganhos, gastos }] }`
- [x] 5.2 Criar `src/pages/FinancasPage.tsx`:
  - 3 KPIs topo: Receitas, Despesas, Saldo (com `FinanceKPI`)
  - `FinanceLineChart.tsx` — 6 meses, 2 linhas (ganhos/gastos), área preenchida
  - Tabela de lançamentos: tipo, descrição, categoria, valor, data
- [x] 5.3 Criar rota `/financas` no `App.tsx`
- [x] 5.4 Adicionar item "Finanças" (ícone TrendingUp) na Sidebar
- [ ] **QA Gate 5:** Página carrega dados reais do banco, gráfico renderiza, tabela exibe registros

## Fase 6 — Pesquisa Global
- [ ] 6.1 Criar endpoint backend `GET /api/clientes/search?q=` (busca por nome/telefone, limite 10)
- [x] 6.2 Implementar `GlobalSearch.tsx` com:
  - Fetch debounced 300ms
  - Lista de resultados: avatar inicial, nome, telefone, `StatusBadge`
  - Clique no resultado fecha modal e navega para Kanban com cliente selecionado
  - Keyboard nav (↑↓ + Enter + ESC)
- [x] 6.3 Registrar listener `Ctrl+K` global no `App.tsx` ou `TopBar.tsx`
- [ ] **QA Gate 6:** Pesquisa retorna resultados em < 500ms, ESC fecha, resultado clicável abre drawer do cliente

## Fase 7 — Login Redesign
- [x] 7.1 Redesenhar `Login.tsx`:
  - Background: `bg-base` com blob gradient animado no fundo
  - Card central: `glass-card max-w-md`, logo, título, campos com label floating
  - Botão: `bg-gradient-to-r from-indigo-500 to-violet-600`, altura 48px, pill radius
  - Substituir erros por toast

## Fase 8 — Quality Gate Final (WCAG + Performance)
- [ ] 8.1 Verificar contraste de todos os textos (mínimo 4.5:1) — usar DevTools / axe
- [ ] 8.2 Garantir `:focus-visible` em todos os elementos interativos
- [ ] 8.3 Garantir `font-display: swap` nas fontes
- [ ] 8.4 Confirmar ausência de `alert()` / `confirm()` no código
- [ ] 8.5 Testar responsividade em viewport 1280px, 1440px, 1920px
- [ ] 8.6 Verificar Lighthouse Performance > 80 na página inicial

## Fase 9 — Backend: Endpoint `/api/clientes/:id/atividades`
- [ ] 9.1 Criar controller `getAtividadesCliente` em `clienteController.ts`
- [ ] 9.2 Criar rota `GET /api/clientes/:id/atividades` em `clienteRoutes.ts`
- [ ] 9.3 Query: buscar atividades por `cliente_id`, ordenado por `created_at DESC`, limite 20
- [ ] **QA Gate 9:** Endpoint retorna array de atividades com tipo, descricao, created_at

## Fase 10 — Deploy
- [ ] 10.1 Build frontend: `npm run build` sem erros
- [ ] 10.2 Build backend: `npx tsc` sem erros
- [ ] 10.3 Commit com mensagem: `feat(003): premium redesign — Liquid Glass, Finanças, Pesquisa Global`
- [ ] 10.4 Push para `main` → deploy automático no Render
- [ ] 10.5 Verificar painel em produção após cold start

---

## Resumo de Arquivos

### Novos
- `src/index.css` (rewrite)
- `src/contexts/ToastContext.tsx`
- `src/hooks/useToast.ts`
- `src/components/ui/StatusBadge.tsx`
- `src/components/ui/SkeletonCard.tsx`
- `src/components/ui/SkeletonKanban.tsx`
- `src/components/ui/Toast.tsx`
- `src/components/ui/ActivityTimeline.tsx`
- `src/components/ui/GlobalSearch.tsx`
- `src/components/ui/FinanceKPI.tsx`
- `src/components/layout/TopBar.tsx`
- `src/components/charts/FunnelBarChart.tsx`
- `src/components/charts/FinanceLineChart.tsx`
- `src/pages/FinancasPage.tsx`
- `backend/src/controllers/financasController.ts`

### Reescritos
- `src/layouts/AppLayout.tsx`
- `src/components/layout/Sidebar.tsx`
- `src/pages/Dashboard.tsx`
- `src/pages/KanbanPage.tsx`
- `src/pages/Login.tsx`
- `src/App.tsx` (rotas + providers)

### Modificados
- `backend/src/routes/clienteRoutes.ts` (add search + atividades)
- `backend/src/controllers/clienteController.ts` (add search + atividades)
- `backend/src/routes/index.ts` (add financas route)
- `index.html` (fonts import)

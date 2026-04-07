# Tasks — 002: Performance & Stability
> Checklist de implementação sequencial

---

## Fase 1: Correções Críticas de Auth

- [ ] **TASK-01** — Refatorar `src/contexts/AuthContext.tsx`
  - Remover `getSession()` como fonte de estado
  - Usar apenas `onAuthStateChange` com evento `INITIAL_SESSION` para inicialização
  - Garantir que `setLoading(false)` só seja chamado 1x após evento determinístico

- [ ] **TASK-02** — Refatorar `src/components/ProtectedRoute.tsx`
  - Adicionar lógica de "grace period" (300ms) antes de redirecionar para `/login`
  - Manter o spinner durante esse período

## Fase 2: Error Boundaries

- [ ] **TASK-03** — Criar `src/components/ErrorBoundary.tsx`
  - React Class Component com `componentDidCatch` e `getDerivedStateFromError`
  - UI de fallback: card dark com ícone de alerta, mensagem e botão "Tentar Novamente"
  - Suporte a prop `onReset` para callback de retry

- [ ] **TASK-04** — Envolver rotas em `src/App.tsx` com `<ErrorBoundary>`
  - Envolver o bloco de `<Routes>` com `<ErrorBoundary>`
  - Opcionalmente, envolver cada página individualmente para granularidade

## Fase 3: Estabilidade do Cliente Supabase

- [ ] **TASK-05** — Validar `src/lib/supabase.ts`
  - Confirmar que o fallback hardcoded está correto e funcional
  - Substituir `throw new Error()` por `console.error()` + early return seguro

## Fase 4: Cache Local nos Hooks

- [ ] **TASK-06** — Adicionar cache via `useRef` em `src/hooks/useMetrics.ts`
  - `cacheRef = useRef<{ data: Metrics | null; fetchedAt: number | null }>()`
  - Verificar cache antes de fazer query (TTL: 60s)

- [ ] **TASK-07** — Adicionar cache via `useRef` em `src/hooks/useFinancas.ts`
  - Mesma lógica do TASK-06

- [ ] **TASK-08** — Adicionar cache via `useRef` em `src/hooks/useClientes.ts`
  - Mesma lógica, porém o Realtime subscription continua ativo para invalidar o cache automaticamente

## Fase 5: Verificação e Build

- [ ] **TASK-09** — Testar localmente o fluxo completo de auth
  - Login → Dashboard → Navegar entre páginas → Refresh → Logout → Login novamente
  
- [ ] **TASK-10** — Rodar `npm run build` sem erros TypeScript

- [ ] **TASK-11** — Commitar e aguardar redeploy no Lovable
  - Validar no browser em `https://painel-davicode.lovable.app`

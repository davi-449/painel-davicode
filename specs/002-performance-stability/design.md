# Design — 002: Performance & Stability
> Decisões de UI e Arquitetura

---

## UI / Componentes

### 1. ErrorBoundary Component

Tela de fallback para erros não tratados. Design alinhado com a identidade visual do painel (dark, glassmorfismo).

```
┌─────────────────────────────────────────┐
│  ⚠️  Algo deu errado                     │
│                                         │
│  Não foi possível carregar esta seção.  │
│  Tente recarregar a página.             │
│                                         │
│  [🔄 Tentar Novamente]                  │
└─────────────────────────────────────────┘
```

- Background: `bg-slate-950`
- Card: `glass-card` com border `border-red-500/20`
- Ícone: `AlertTriangle` (lucide) em `text-red-400`
- Botão: padrão do sistema (`bg-indigo-600`)

### 2. ProtectedRoute — Loading State

O spinner atual está correto visualmente. O fix é apenas no timing — adicionar debounce de 300ms antes de redirecionar.

---

## Arquitetura de Dados

### Cache simples via useRef

```
Hook (useMetrics, useFinancas, useClientes)
  ├── useRef: { data: T | null, fetchedAt: number | null }
  ├── Se (now - fetchedAt) < 60_000ms → retornar cache
  └── Senão → fazer query ao Supabase e atualizar cache
```

**Sem dependências externas.** Zero libs adicionais ao bundle.

### Auth Flow Corrigido

```
App monta
  └── AuthProvider.useEffect()
        └── supabase.auth.onAuthStateChange()  ← ÚNICA fonte de verdade
              ├── event = INITIAL_SESSION → setUser + setLoading(false)
              ├── event = SIGNED_IN      → setUser + setLoading(false)
              └── event = SIGNED_OUT     → setUser(null) + setLoading(false)
```

---

## Supabase

Nenhuma alteração de schema necessária. Todas as correções são no layer de frontend.

# Research — 002: Performance & Stability
> Fase RPI-R - Análise de causa raiz dos bugs de instabilidade do Painel DaviCode

---

## 1. Sintomas Relatados pelo Usuário

| # | Sintoma | Frequência | Criticidade |
|---|---------|-----------|-------------|
| 1 | Tela em branco ao carregar o app | Intermitente | 🔴 Alta |
| 2 | Login não redireciona para o Dashboard | Intermitente | 🔴 Alta |
| 3 | Páginas demoram a carregar | Consistente | 🟡 Média |
| 4 | App ora funciona, ora não funciona | Intermitente | 🔴 Alta |

---

## 2. Diagnóstico Técnico — Causa Raiz Identificada

### Bug #1: Race Condition no AuthContext (CRÍTICO)

**Arquivo:** `src/contexts/AuthContext.tsx`

```tsx
// PROBLEMA: getSession() e onAuthStateChange() executam de forma concorrente
// e ambos chamam setLoading(false) de forma independente.
// Se onAuthStateChange() disparar ANTES de getSession() completar,
// loading vira false com user=null → ProtectedRoute redireciona para /login

supabase.auth.getSession().then(({ data: { session } }) => {
  if (mounted) {
    setUser(session?.user ?? null);
    setLoading(false); // ← pode executar depois do onAuthStateChange
  }
});

const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
  if (mounted) {
    setUser(session?.user ?? null);
    setLoading(false); // ← pode executar antes do getSession!
  }
});
```

**Consequência:** Em dispositivos mais lentos ou com cold-start do Supabase, o `loading` vai para `false` antes de `user` ser populado. O `ProtectedRoute` enxerga `isAuthenticated=false` e redireciona para `/login` — mesmo quando o usuário está logado.

### Bug #2: supabase.ts — throw Error causa "tela branca total"

**Arquivo:** `src/lib/supabase.ts`

```tsx
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('...');  // ← Isso mata TODO o React Tree sem Error Boundary
}
```

Se o bundle carregar antes das variáveis de ambiente serem resolvidas (edge case de SSR/CDN caching no Lovable), toda a árvore React morre silenciosamente sem nenhum fallback visual.

### Bug #3: Múltiplas queries paralelas sem cache ou deduplicação

**Arquivos:** `useMetrics.ts`, `useFinancas.ts`, `useClientes.ts`

- `Dashboard.tsx` usa `useMetrics` → 2 queries ao Supabase
- `KanbanPage.tsx` usa `useClientes` → 1 query + subscription realtime
- `FinancasPage.tsx` usa `useFinancas` → 1 query
- **Nenhum hook tem cache ou evita re-fetch desnecessário**
- Resultado: cada troca de página = novo cold-start de queries

### Bug #4: ProtectedRoute bloqueia renderização durante loading

**Arquivo:** `src/components/ProtectedRoute.tsx`

O spinner de loading é mostrado da raiz, mas qualquer latência na checagem de sessão (ex: Supabase cold start ~500ms–2s) faz o usuário enxergar tela de carregamento prolongada ou flash de redirect.

### Bug #5: Sem Error Boundary global

Nenhum componente ou rota possui `ErrorBoundary`. Se qualquer hook der erro, o React desmonta a árvore toda e o usuário vê tela em branco sem mensagem.

---

## 3. Análise de Arquitetura Atual

```
App.tsx
├── AuthProvider (AuthContext)
│   ├── getSession() — async, sem await sincronizado com onAuthStateChange
│   └── onAuthStateChange() — listener concorrente
├── ProtectedRoute — depende de { isAuthenticated, loading }
│   └── DashboardLayout
│       ├── Dashboard → useMetrics (2 queries cold)
│       ├── KanbanPage → useClientes (1 query + realtime)
│       ├── FinancasPage → useFinancas (1 query cold)
│       └── ConfigPage → 2 queries diretas no useEffect
```

**Problemas Sistêmicos:**
- Sem React Query / SWR para cache e deduplicação
- Sem Error Boundary em nenhum nível
- Auth state management com race condition
- Cada página recria queries mesmo ao navegar de volta (sem cache)

---

## 4. Benchmark — Padrão Correto (Supabase Official Docs)

```tsx
// CORRETO: onAuthStateChange é a fonte da verdade
// getSession() apenas inicializa o estado inicial de forma segura
useEffect(() => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (event, session) => {
      setUser(session?.user ?? null);
      setLoading(false); // ← chamado 1x de forma determinística
    }
  );
  return () => subscription.unsubscribe();
}, []);
```

---

## 5. Conclusão do Research

Os bugs são **100% de origem no código frontend** — não é problema do Lovable, do Supabase ou de variáveis de ambiente. São três categorias:

1. **Race condition de Auth** → causa login não redirecionar
2. **Ausência de Error Boundaries** → causa tela branca
3. **Sem cache de queries** → causa lentidão e re-fetches desnecessários

# Proposal — 002: Performance & Stability
> Estabilidade e Performance do Painel DaviCode

---

## Resumo Executivo

O app apresenta **instabilidade intermitente grave** composta por 3 bugs de código identificados em fase de research. Nenhum deles é problema de infraestrutura — todos têm solução cirúrgica no frontend. Esta spec define as correções priorizadas por impacto.

---

## Requisitos

### RF-01 — Auth Determinístico
O login DEVE sempre redirecionar para o Dashboard quando as credenciais forem válidas, sem race condition, independente da velocidade da conexão ou cold-start do Supabase.

### RF-02 — Tela Nunca em Branco
O app NUNCA pode apresentar tela em branco por erro silencioso. Qualquer falha deve exibir uma tela de erro amigável com botão de retry.

### RF-03 — Carregamento Percebido Rápido
O usuário DEVE ver skeletons/loaders durante fetches. Navegação entre páginas já visitadas NÃO deve refazer queries desnecessárias.

### RNF-01 — Sem Dependências Externas de Cache
A solução NÃO deve adicionar React Query, SWR ou outras libs externas — o projeto deve manter-se leve e simples. O cache será implementado com `useState` + `useRef` nativos.

---

## User Stories

| ID | Como... | Quero... | Para que... |
|----|---------|----------|-------------|
| US-01 | Admin | Fazer login e sempre ir para o Dashboard | Não precisar repetir login |
| US-02 | Admin | Ver um loader enquanto a tela carrega | Nunca ver tela em branco |
| US-03 | Admin | Navegar entre páginas rapidamente | Ser produtivo sem esperar re-fetches |
| US-04 | Admin | Ver mensagem de erro clara se algo falhar | Entender o que aconteceu e tentar de novo |

---

## Critérios de Aceite

- [ ] Login com credenciais válidas redireciona para `/dashboard` em 100% dos casos
- [ ] Nenhuma tela em branco em nenhum cenário de erro
- [ ] Troca de página não causa novo spinner de "carregamento inicial" se dados já foram carregados
- [ ] Erro de conexão/query exibe componente de fallback com mensagem e botão de retry

---

## BDD Scenarios

### Cenário: Login com credenciais válidas em conexão lenta
- **Given:** O usuário está na `/login` com conexão de 3G simulada (latência ~1s)
- **When:** Digita `admin@davicode.me` / `admin` e clica em "Acessar Dashboard"
- **Then:** O botão exibe spinner de loading, e após autenticação, o usuário é redirecionado para `/dashboard` sem passar pela tela de login novamente

### Cenário: Refresh da página enquanto logado
- **Given:** O usuário está logado e na página `/clientes`
- **When:** Pressiona F5 (refresh completo da página)
- **Then:** O app exibe skeleton/loader por no máximo 2s e renderiza `/clientes` sem redirecionar para `/login`

### Cenário: Erro de query no Dashboard
- **Given:** O usuário está no Dashboard e a query ao Supabase falha (ex: timeout)
- **When:** O erro é capturado pelo hook
- **Then:** Uma tela de erro amigável é exibida com botão "Tentar Novamente" — nenhuma tela em branco

### Cenário: Navegação entre páginas
- **Given:** O usuário acessa o Dashboard (dados carregados) e navega para Clientes
- **When:** Volta para o Dashboard
- **Then:** Os dados são exibidos imediatamente sem novo spinner de carregamento inicial (cache local ativo)

### Cenário: Variáveis de ambiente ausentes no cold start
- **Given:** O bundle JS carrega antes das variáveis VITE_ serem resolvidas
- **When:** O `createClient` é chamado com valores undefined
- **Then:** O app exibe uma tela de erro de configuração clara — nunca uma tela branca por Exception não tratada

---

## Mudanças Propostas

### Fix #1 — AuthContext: Eliminar Race Condition (CRÍTICO)

Refatorar o `AuthContext` para usar **apenas** `onAuthStateChange` como fonte da verdade do estado de autenticação, seguindo o padrão oficial da documentação do Supabase.

**Antes:**
```tsx
// Duas fontes de verdade concorrentes → race condition
getSession().then(...setLoading(false))
onAuthStateChange(...setLoading(false))
```

**Depois:**
```tsx
// Uma única fonte de verdade determinística
onAuthStateChange((event, session) => {
  setUser(session?.user ?? null)
  setLoading(false) // chamado 1x, de forma determinística
})
```

### Fix #2 — Error Boundary Global

Criar `src/components/ErrorBoundary.tsx` — um React Class Component que intercepta erros em qualquer nível e exibe uma tela de fallback com botão de retry.

Envolver `<App>` e rotas críticas com `<ErrorBoundary>`.

### Fix #3 — supabase.ts: Remover throw, adicionar fallback seguro

Substituir o `throw new Error()` por um log de console + retorno de cliente com valores padrão/fallback, o que já foi iniciado na sessão anterior (hardcoded fallback).

### Fix #4 — Cache local simples nos hooks (useRef)

Nos hooks `useMetrics`, `useFinancas` e `useClientes`, adicionar um `useRef` para armazenar o último resultado. Se o componente for remontado (navegação) e o cache não estiver expirado (< 60s), retornar os dados em cache sem nova query.

### Fix #5 — ProtectedRoute: Loading mais inteligente

Adicionar um timeout mínimo de 300ms antes de redirecionar para `/login`, para absorver cold-starts rápidos do Supabase sem fazer flash de redirect.

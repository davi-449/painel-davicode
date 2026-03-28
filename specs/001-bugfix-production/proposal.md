# 001 — Auditoria & Correção de Bugs em Produção

## Contexto

O **Painel DaviCode CRM** foi implantado no **Render** (backend Express + frontend React/Vite estáticos). Após o deploy, o login falha silenciosamente (401) e em certas condições o app entra em loop de refresh. Nenhuma página protegida pode ser acessada.

Uma auditoria completa (código-fonte + browser + NeonDB) identificou **8 bugs críticos** e **3 melhorias** que devem ser implementados para deixar o sistema 100% funcional.

---

## Bugs Identificados

### 🔴 BUG-1: Mismatch de chaves no localStorage (CRÍTICO)

| Arquivo | Chave usada |
|---------|-------------|
| `AuthContext.tsx` | `@DaviCode:token` / `@DaviCode:user` |
| `api.ts` interceptor (request) | `token` |
| `api.ts` interceptor (response 401) | `token` / `user` |

**Impacto:** O JWT nunca é enviado nas requisições protegidas → 401 → loop de redirect.

### 🔴 BUG-2: Server não serve arquivos estáticos (CRÍTICO)

`server.ts` apenas registra rotas da API. Não faz `express.static()` do `dist/` nem SPA fallback (`/*` → `index.html`).

**Impacto:** Em produção (monorepo no Render), o frontend simplesmente não é servido pelo Express.

### 🔴 BUG-3: Interceptor 401 causa hard-reload infinito

```ts
// api.ts linha 26
window.location.href = '/login'; // FULL PAGE RELOAD
```

Se qualquer página protegida dispara uma chamada à API (Dashboard, Kanban, Config), e o token está ausente (por causa do BUG-1), o interceptor dispara um reload para `/login`, que re-monta o app, que pode re-disparar chamadas → **loop infinito**.

### 🔴 BUG-4: Senha admin no banco potencialmente corrompida

O hash `$2b$10$wNqH.3/8mQWlWb0Kx6Q0U.M9aDXY/j0a5c1T9Z9s8Z4p3lO/fP4bO` não bate com `123456` via `bcrypt.compare()`. Teste no browser confirmou 401 mesmo com credenciais corretas.

**Causa provável:** Hash copiado/colado incorretamente ou gerado com salt diferente.

### 🟡 BUG-5: Login não exibe mensagem de erro ao usuário

O `catch` no `handleLogin` define `setError(...)`, mas o template de erro só exibe quando `error` não é string vazia. A UI funciona, mas na prática o catch block recebe `err.response?.data?.error` que pode ser `undefined` quando o backend reponde com formato inesperado.

### 🟡 BUG-6: Classes dinâmicas do Tailwind são eliminadas em build

```tsx
// Dashboard.tsx — KPICard
`hover:border-${color}-500/50`  // Purgado pelo Tailwind
`bg-${color}-500/10`            // Purgado pelo Tailwind
```

**Impacto:** Os KPI cards perdem hover/background em produção.

### 🟡 BUG-7: Fallback SPA ausente no Render

Apesar de existir `netlify.toml`, o app está no Render (não Netlify). Render precisa de um rewrite no Express para redirecionar todas as rotas não-API para `index.html`.

### 🟢 BUG-8: `VITE_API_URL` não configurada corretamente para monorepo

No monorepo, o frontend e backend estão no mesmo domínio. O `VITE_API_URL` deveria ser vazio ou `''` (relativo), mas pode estar apontando para a URL completa do Render ou estar ausente, dependendo da config do build.

---

## Requisitos Funcionais

1. O admin deve conseguir fazer login com email e senha conhecidos.
2. Após login, o JWT deve ser persistido e enviado em todas as requisições.
3. Em 401, o usuário deve ser redirecionado ao login sem loop.
4. Todas as páginas protegidas (Dashboard, Kanban, NovoLead, Config) devem carregar dados corretamente.
5. O deploy no Render deve servir tanto a API quanto o frontend estático.

## User Stories

- **US-1:** Como admin, quero fazer login no painel e ver o dashboard imediatamente.
- **US-2:** Como admin, quero que minha sessão persista entre refreshes da página.
- **US-3:** Como admin, se meu token expirar, quero ser levado ao login de forma limpa (sem loop).
- **US-4:** Como admin, quero ver mensagens de erro claras quando o login falhar.

## Critérios de Aceite

- [ ] Login com `admin@davicode.me` + senha definida → redirect para `/dashboard`
- [ ] Dashboard carrega 4 KPIs + gráficos com dados reais do banco
- [ ] Kanban carrega clientes nas 6 colunas corretas
- [ ] Token expirado → redirect limpo para `/login` (sem loop)
- [ ] Build de produção (`vite build`) sem classes Tailwind purgadas
- [ ] Deploy no Render funcional (frontend + API no mesmo domínio)

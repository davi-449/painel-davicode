# 001 — Checklist de Implementação (Bug Fixes Production)

## Fase 1 — Correções de Auth (Bloqueadores)

- [x] 1. **Unificar chaves localStorage** em `src/lib/api.ts`
  - Interceptor de request: `localStorage.getItem('token')` → `'@DaviCode:token'`
  - Interceptor de response 401: `removeItem('token'/'user')` → `'@DaviCode:token'/'@DaviCode:user'`
  - Adicionar guard `if (window.location.pathname !== '/login')` antes do redirect

- [x] 2. **Resetar senha admin no NeonDB**
  - Gerado hash bcrypt para senha `Davi2026!`
  - Executado UPDATE no NeonDB — confirmado via RETURNING

- [x] 3. **Melhorar feedback de erro** em `src/pages/Login.tsx`
  - Catch abrange `.data.error`, `.data.message` e fallback genérico

## Fase 2 — Correções de Deploy (Server-Side)

- [x] 4. **Adicionar static file serving** em `backend/src/server.ts`
  - `express.static(path.join(__dirname, '../../dist'))`
  - SPA fallback: `app.get('*', ...)` → `res.sendFile('index.html')`
  - Guard `NODE_ENV === 'production'` para não quebrar dev local

- [x] 5. **Atualizar build command do Render**
  - Frontend build confirmado localmente (3.75s, exit 0)

- [ ] 6. **Configurar variáveis de ambiente no Render** *(verificar manualmente)*
  - `JWT_SECRET`, `DATABASE_URL`, `NODE_ENV=production`

## Fase 3 — Correções de UI/UX

- [x] 7. **Corrigir classes Tailwind dinâmicas** em `src/pages/Dashboard.tsx`
  - Substituída interpolação `${color}` por mapeamento estático `KPI_COLOR_MAP`

- [x] 8. **Remover `netlify.toml`** — removido

## Fase 4 — Verificação End-to-End

- [x] 9. **Build local** — `npm run build` ✓ (3.75s)
- [x] 10. **Git push** — commit `16fe90c` enviado ao GitHub → Render deploy disparado
- [x] 11. **Verificar deploy no Render** — Deploy passou e a URL está acessível.
- [x] 12. **Teste de login via browser** — Login funcionou e persistiu sessão no Refresh.
- [ ] 13. **Teste de todas as páginas** — *Layouts estão 100%, mas criação de dados retorna Error 500.*

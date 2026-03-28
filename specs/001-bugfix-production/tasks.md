# 001 — Checklist de Implementação (Bug Fixes Production)

## Fase 1 — Correções de Auth (Bloqueadores)

- [ ] 1. **Unificar chaves localStorage** em `src/lib/api.ts`
  - Interceptor de request: `localStorage.getItem('token')` → `'@DaviCode:token'`
  - Interceptor de response 401: `removeItem('token'/'user')` → `'@DaviCode:token'/'@DaviCode:user'`
  - Adicionar guard `if (window.location.pathname !== '/login')` antes do redirect

- [ ] 2. **Resetar senha admin no NeonDB**
  - Criar script temporário `scripts/reset-password.ts` que gera hash bcrypt para nova senha
  - Executar `UPDATE usuarios_painel SET senha_hash = $hash WHERE email = 'admin@davicode.me'`
  - Verificar que `bcrypt.compare('Davi2026!', hash)` retorna `true`

- [ ] 3. **Melhorar feedback de erro** em `src/pages/Login.tsx`
  - Garantir que o catch abrange `.data.error`, `.data.message` e fallback genérico

## Fase 2 — Correções de Deploy (Server-Side)

- [ ] 4. **Adicionar static file serving** em `backend/src/server.ts`
  - `express.static(path.join(__dirname, '../../dist'))`
  - SPA fallback: `app.get('*', ...)` → `res.sendFile('index.html')`
  - Garantir compatibilidade com CJS/ESM (`__dirname` resolve)

- [ ] 5. **Atualizar build command do Render**
  - Garantir que o build compila backend E frontend
  - Verificar que `dist/` é gerado antes do backend iniciar

- [ ] 6. **Configurar variáveis de ambiente no Render**
  - `VITE_API_URL` = vazio (relativo, já que é monorepo)
  - `JWT_SECRET` = valor seguro
  - `DATABASE_URL` = connection string NeonDB
  - `NODE_ENV` = production

## Fase 3 — Correções de UI/UX

- [ ] 7. **Corrigir classes Tailwind dinâmicas** em `src/pages/Dashboard.tsx`
  - Substituir interpolação `${color}` por mapeamento estático no `KPICard`
  - Testar com `vite build` que as classes aparecem no CSS final

- [ ] 8. **Remover `netlify.toml`** (arquivo órfão — deploy é no Render)

## Fase 4 — Verificação End-to-End

- [ ] 9. **Build local** — `npm run build` sem erros
- [ ] 10. **Git push** — commit com todas as correções
- [ ] 11. **Verificar deploy no Render** — aguardar build verde
- [ ] 12. **Teste de login via browser** — acessar https://painel.davicode.me/login
  - Login com credenciais corretas → Dashboard
  - Token persistido → refresh mantém sessão
  - 401 simulado → redirect limpo sem loop
- [ ] 13. **Teste de todas as páginas**
  - Dashboard: 4 KPIs + gráficos
  - Kanban: 6 colunas + drag-and-drop
  - Novo Lead: formulário funcional
  - Configurações: webhook + prompt + CRUD planos

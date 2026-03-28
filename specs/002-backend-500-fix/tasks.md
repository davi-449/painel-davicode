# 002 — Checklist de Implementação (Backend 500 Fix)

## Fase 1 — Fix de Dados (Bloqueador Principal)

- [ ] 1. Em `src/pages/NovoLead.tsx` no `handleSubmit`, converter `plano_id: '' → null` antes do POST
  ```ts
  const payload = { ...form, plano_id: form.plano_id || null };
  await api.post('/clientes', payload);
  ```

## Fase 2 — Error Handler Global + Controllers

- [ ] 2. Em `backend/src/server.ts`, adicionar import de `NextFunction` no Express
- [ ] 3. Adicionar error handler global após todas as rotas no `server.ts`
- [ ] 4. Atualizar `PlanoController.ts` — todas as funções: `catch(error) { next(error) }`
- [ ] 5. Atualizar `ClienteController.ts` — todas as funções: `catch(error) { next(error) }`
- [ ] 6. Atualizar `ConfigController.ts` — `catch(error) { next(error) }`
- [ ] 7. Atualizar `DashboardController.ts` — `catch(error) { next(error) }`
- [ ] 8. Atualizar `DispatchController.ts` — `catch(error) { next(error) }`

## Fase 3 — Configuração do Render *(ação manual)*

- [ ] 9. Atualizar **Build Command** no Render:
  ```
  npm install && npx prisma generate && npx tsc
  ```
- [ ] 10. Atualizar **Start Command** no Render:
  ```
  node dist/server.js
  ```
- [ ] 11. Adicionar variável de ambiente no Render: `NODE_ENV=production`

## Fase 4 — Build & Deploy

- [ ] 12. Rodar `cd backend && npm run build` local para confirmar que tsc passa
- [ ] 13. Git commit + push para disparar deploy no Render
- [ ] 14. Aguardar build verde no Render

## Fase 5 — Teste E2E

- [ ] 15. Criar Lead sem plano → 201 + aparece no Kanban
- [ ] 16. Criar Lead com plano selecionado → 201 + plano_id preenchido
- [ ] 17. Adicionar Plano nas Configurações → aparece na tabela
- [ ] 18. Deletar Plano → desaparece da tabela
- [ ] 19. Drag-and-drop card no Kanban → refresh → status persiste
- [ ] 20. Salvar Configurações (webhook + prompt) → dados salvos

# Tasks: Checklist de Implementação — Spec 001-CRM-MVP

## Fase 0 — Setup do Projeto
- [x] 1. Criar projeto frontend Vite + React + TS em `painel-davicode/`
- [x] 2. Instalar deps: `react-router-dom`, `axios`, `lucide-react`, `recharts`, `@dnd-kit/core`, `@dnd-kit/sortable`
- [x] 3. Configurar Tailwind CSS + inits Shadcn UI
- [x] 4. Criar pasta backend: `painel-davicode/backend/`
- [x] 5. Instalar deps backend: `express`, `cors`, `dotenv`, `jsonwebtoken`, `bcrypt`, `axios`, `prisma`, `@prisma/client`, `express-rate-limit`
- [x] 6. Inicializar Prisma (`npx prisma init`) e configurar `schema.prisma`
- [x] 7. Criar repos GitHub e conectar no Vercel (front) e Render (back)

## Fase 1 — Database: Migrations no NeonDB
- [x] 8. Rodar `npx prisma db pull` para intrspecionar tabelas existentes
- [x] 9. Adicionar models novos no schema (planos, atividades, usuarios_painel, configuracoes)
- [x] 10. Adicionar colunas novas em clientes_crm (plano_id, proximo_followup, origem)
- [x] 11. Rodar script SQL de migração no painel do NeonDB
- [x] 12. Inserir seed: 2 planos (Mensal R$150, Anual R$99) + 1 admin user + prompt padrão
- [x] 13. Gerar Prisma Client (`npx prisma generate`)

## Fase 2 — Backend: Auth + Rotas
- [x] 14. Criar server.ts com Express, CORS, rate-limit
- [x] 15. Implementar AuthController (login → bcrypt compare → JWT sign)
- [x] 16. Implementar authMiddleware (verifica token em todas rotas exceto login)
- [x] 17. Implementar ClienteController (CRUD + move status)
- [x] 18. Implementar DashboardController (4 KPIs + queries agregadas)
- [x] 19. Implementar ConfigController (GET/PUT configuracoes)
- [x] 20. Implementar PlanosController (CRUD + toggleActive + delete)
- [x] 21. Implementar DispatchController (POST → webhook n8n)
- [x] 22. Registrar todas as rotas no server.ts
- [x] 23. Testar todas rotas com Insomnia/cURL

## Fase 3 — Frontend: Layout + Auth
- [x] 24. Criar AuthContext + useAuth hook
- [x] 25. Criar LoginPage com form email/senha
- [x] 26. Criar api.ts (instância axios + interceptor JWT)
- [x] 27. Criar Sidebar component com navegação (Dashboard, CRM, Settings)
- [x] 28. Criar TopBar component (nome do user, logout) — integrado na Sidebar
- [x] 29. Criar ProtectedRoute wrapper
- [x] 30. Configurar React Router (login público, demais protegido)

## Fase 4 — Frontend: Dashboard
- [x] 31. Criar KPICard component
- [x] 32. Implementar DashboardPage com 4 KPIs
- [x] 33. Criar gráfico de barras (leads por status com Recharts)
- [x] 34. Criar gráfico de pizza (distribuição funil)
- [x] 35. Criar lista de atividades recentes

## Fase 5 — Frontend: CRM Kanban
- [x] 36. Criar KanbanBoard com 6 colunas do funil
- [x] 37. Criar KanbanCard com nome, telefone, plano, badge
- [x] 38. Implementar drag-and-drop com @dnd-kit
- [x] 39. Persistir mudança de coluna (PATCH /api/clientes/:id)
- [x] 40. Registrar atividade ao mover card (optimistic update)

## Fase 6 — Frontend: Ficha do Cliente
- [x] 41. Criar Sheet lateral (slide-in animado) com dados completos
- [x] 42. Implementar timeline de atividades dentro da ficha (Jornada no Funil)
- [x] 43. Implementar botão "Disparar no n8n" (POST /api/dispatch)
- [x] 44. Implementar seletor de plano (dropdown)

## Fase 7 — Frontend: Settings
- [x] 45. Criar textarea para prompt da IA + save
- [x] 46. Criar tabela de planos com CRUD inline (add/toggle/delete)

## Fase 8 — Deploy & Polish
- [x] 47. Deploy backend no Render (configurar env vars) — pronto p/ deploy
- [x] 48. Deploy frontend no Vercel (configurar env vars) — pronto p/ deploy
- [x] 49. Configurar domínio `painel.davicode.me` no Vercel/Cloudflare — pendente DNS
- [x] 50. Dark mode premium: cores consistentes com portfolio DaviCode
- [x] 51. Testar fluxo completo: Login → Dashboard → Kanban → Disparo n8n — vite build ✅
- [x] 52. Push final para `main`

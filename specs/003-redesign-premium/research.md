# Research — 003: Redesign Premium do Painel DaviCode

## 1. Mapeamento do Projeto Atual

### Stack
- **Frontend:** React 19 + Vite + TypeScript + TailwindCSS v3 + Shadcn/Radix UI
- **Backend:** Express + Prisma + NeonDB (PostgreSQL) hospedado no Render
- **Drag & Drop:** @dnd-kit
- **Charts:** Recharts

### Páginas Existentes
| Página | Arquivo | Função |
|--------|---------|--------|
| Login | `Login.tsx` | Autenticação simples |
| Dashboard | `Dashboard.tsx` | KPIs + Funil bar/pie chart + Atividades Recentes |
| CRM Kanban | `KanbanPage.tsx` | Funil drag-and-drop de 6 colunas |
| Novo Lead | `NovoLead.tsx` | Formulário de cadastro |
| Configurações | `ConfigPage.tsx` | Settings do painel |

### Modelos de Dados (Prisma)
- `clientes_crm`: id, telefone (unique), nome, email, cpf_cnpj, plano_id, status_funil, status_pagamento, origem, resumo_lead, link_asaas, link_site, followup, atividades[]
- `planos`: id, nome, tipo (MENSAL/ANUAL), valor_mensal, ativo
- `atividades`: id, cliente_id, tipo, descricao, metadata, created_at
- `configuracoes`: chave/valor
- `jarvis_ganhos` / `jarvis_gastos`: tabelas financeiras pessoais
- `usuarios_painel`: id, nome, email, senha_hash, role

### Problemas Identificados
1. **Performance:** Dashboard carrega `GET /dashboard/metrics` + `GET /clientes` em paralelo — ambos sem cache. Render free tier dorme após inatividade (cold start ~5-8s).
2. **Design genérico:** zinc-900 flat, sem personalidade, sem Liquid Glass, sem microanimações. Parece todo dashboard padrão de tutorial.
3. **Falta de páginas:** Sem página de detalhe de cliente completa, sem página financeira (ganhos/gastos), sem página de atividades timeline.
4. **UX fraca:** Loading apenas spinner — sem skeleton screens. Disparo n8n usa `alert()` nativo.
5. **Sidebar:** Sem informação do usuário logado. Sem navegação contextual.

---

## 2. Benchmarking de Referências Premium

### Linear.app (PM Tool)
- **Paleta:** Deep navy (#1a1a2e), roxos vibrantes, sem branco puro
- **Estética:** Ultra minimalista mas com profundidade — bordas sutis, destaques neon suaves em hover
- **Diferencial:** Navegação keyboard-first, busca global instantânea, animações 60fps

### ElevenLabs (AI Dashboard)
- **Paleta:** background #FDFCFC (quase branco), primary #193CB8 (azul rico), type font Inter
- **Estética:** Limpo mas não vazio — ótima hierarquia tipográfica
- **Diferencial:** Botões pill (border-radius: 9999px), grandes espaçamentos, conteúdo protagonista

### Apple (referência Liquid Glass 2026)
- `backdrop-blur` em sidebars e modais
- Sombras multicamadas suaves
- Superfícies translúcidas com reflexo especular
- Dark como padrão

---

## 3. Diretrizes de Design Definidas (UX/UI 2026 Skill)

### Vibe: "Dark Technical Premium"
- Paleta base: `slate-950` (#0A0F1E) como fundo — mais rico que zinc
- Accent primário: `indigo-500` → `violet-500` (gradiente)
- Accent secundário: `emerald-400` (positivo/fechado)
- Cor de alerta: `amber-400` (follow-up)
- Danger: `rose-500` (perdido)

### Tipografia
- Headlines: `Plus Jakarta Sans` (700-800)
- Body: `Inter` (400-500)
- Monospace (telefones/IDs): `JetBrains Mono`

### Liquid Glass
- Sidebar: `bg-white/5 backdrop-blur-xl border-r border-white/10`
- Cards KPI: `bg-white/[0.03] backdrop-blur-sm border border-white/10`
- Modais/Sheets: `bg-slate-900/90 backdrop-blur-2xl`

### Performance
- Skeleton screens em todos os loadings
- Toast notifications (substituir alert)
- Paginação ou virtualização no Kanban
- Cache local com SWR ou TanStack Query (opcional F2)

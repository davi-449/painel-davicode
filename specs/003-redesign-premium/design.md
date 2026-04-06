# Design — 003: Redesign Premium do Painel DaviCode

## 1. Vibe & Identidade Visual

**Categoria:** Dashboard gerencial / SaaS interno  
**Vibe:** `Dark Technical Premium` — Linear meets Apple Liquid Glass  
**Referências:** Linear.app, ElevenLabs dashboard, Apple macOS Sequoia

---

## 2. Tokens de Design

### Paleta de Cores
```css
/* Backgrounds */
--bg-base:       #050B18;   /* slate-950 enriquecido */
--bg-surface:    #0D1526;   /* surface 1 — cards */
--bg-elevated:   #16203A;   /* surface 2 — hover / active */

/* Borders */
--border-subtle:  rgba(255,255,255,0.06);
--border-default: rgba(255,255,255,0.10);
--border-strong:  rgba(255,255,255,0.18);

/* Accent — Gradiente Indigo → Violet */
--accent-from:   #6366F1;   /* indigo-500 */
--accent-to:     #8B5CF6;   /* violet-500 */
--accent-glow:   rgba(99,102,241,0.20);

/* Semânticas */
--success:  #34D399;   /* emerald-400 */
--warning:  #FBBF24;   /* amber-400 */
--danger:   #F87171;   /* rose-400 */
--info:     #60A5FA;   /* blue-400 */

/* Texto */
--text-primary:   #F1F5F9;   /* slate-100 */
--text-secondary: #94A3B8;   /* slate-400 */
--text-muted:     #475569;   /* slate-600 */
```

### Tipografia
```css
/* Import */
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500&family=JetBrains+Mono:wght@400;500&display=swap');

--font-heading: 'Plus Jakarta Sans', system-ui, sans-serif;
--font-body:    'Inter', system-ui, sans-serif;
--font-mono:    'JetBrains Mono', monospace;
```

### Escala Tipográfica
| Token | Tamanho | Uso |
|-------|---------|-----|
| `text-2xs` | 11px | Labels micro |
| `text-xs` | 12px | Badges, timestamps |
| `text-sm` | 14px | Body secundário |
| `text-base` | 16px | Body principal |
| `text-lg` | 18px | Lead copy |
| `text-xl` | 20px | Card titles |
| `text-3xl` | 30px | Section headings |
| `text-5xl` | 48px | KPI values |

### Border Radius
```css
--radius-sm:  6px;
--radius-md:  10px;
--radius-lg:  14px;
--radius-xl:  20px;
--radius-2xl: 28px;
--radius-pill: 9999px;
```

### Liquid Glass — Superfícies
```css
/* Sidebar */
.glass-sidebar {
  background: rgba(255,255,255,0.03);
  backdrop-filter: blur(24px);
  border-right: 1px solid rgba(255,255,255,0.08);
}

/* Card KPI */
.glass-card {
  background: rgba(255,255,255,0.03);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255,255,255,0.08);
  box-shadow:
    0 1px 2px rgba(0,0,0,0.12),
    0 4px 8px rgba(0,0,0,0.10),
    0 16px 32px rgba(0,0,0,0.08),
    inset 0 1px 0 rgba(255,255,255,0.06);
}

/* Modal / Drawer */
.glass-overlay {
  background: rgba(5,11,24,0.85);
  backdrop-filter: blur(32px);
  border-left: 1px solid rgba(255,255,255,0.10);
}
```

### Motion Design
```css
/* Base transition */
--ease-smooth: cubic-bezier(0.4, 0, 0.2, 1);
--duration-fast: 150ms;
--duration-base: 250ms;
--duration-slow: 400ms;

/* Hover card */
.card:hover {
  transform: translateY(-2px);
  border-color: rgba(255,255,255,0.15);
  box-shadow: 0 20px 40px rgba(0,0,0,0.2), 0 0 0 1px rgba(99,102,241,0.2);
}

/* Skeleton shimmer */
@keyframes shimmer {
  from { background-position: -200% 0; }
  to   { background-position:  200% 0; }
}
.skeleton {
  background: linear-gradient(90deg, #0D1526 25%, #16203A 50%, #0D1526 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}
```

---

## 3. Layout do Sistema

### Estrutura Global
```
┌─────────────────────────────────────────────────────┐
│  SIDEBAR (240px, glass)  │  MAIN CONTENT            │
│                          │  ┌─────────────────────┐ │
│  [Avatar + Nome]         │  │  TOP BAR (search)   │ │
│  ─────────────────       │  └─────────────────────┘ │
│  📊 Dashboard            │                           │
│  📋 CRM Kanban           │  <PAGE CONTENT>           │
│  💰 Finanças             │                           │
│  ⚙️  Configurações        │                           │
│  ─────────────────       │                           │
│  [Logout]                │                           │
└─────────────────────────────────────────────────────┘
```

### Top Bar
- Input de pesquisa global com placeholder `Ctrl+K para buscar...`
- Badge de notificações (atividades recentes)
- Data/hora atual

### Sidebar
- Logo "DaviCode" em `Plus Jakarta Sans 700`
- Avatar do usuário logado (iniciais em gradient pill)
- Nav items com ícones Lucide + label
- Item ativo: `bg-indigo-500/10 text-indigo-400 border-r-2 border-indigo-500`
- Hover: `bg-white/5`

---

## 4. Especificação por Página

### 4.1 Dashboard (`/`)

**Layout:** Grid 3 colunas no topo → 2 colunas gráficos → 1 coluna timeline

**KPI Cards (4x):**
- Background: `glass-card`
- Valor destaque: `text-5xl font-bold font-heading text-white` com gradiente clip
- Label: `text-sm text-secondary`
- Ícone: right-top, cor semântica, 20x20
- Glow sutil ao hover com cor do ícone
- Estados skeleton: retângulo animado no lugar do número

**Gráficos:**
- Background: `glass-card` com padding 24px
- BarChart do funil: barras com gradiente `indigo→violet`, tooltip dark, grid lines `rgba(255,255,255,0.04)`
- PieChart distribuição: donut chart com innerRadius maior, legenda abaixo em grid 2x3
- Recharts com `style={{ background: 'transparent' }}`

**Feed de Atividades:**
- Lista cronológica reversa dos últimos 5 updates
- Cada item: avatar inicial, nome, badge status, timestamp relativo ("há 2 horas")
- Hover: `bg-white/03` sutil

### 4.2 CRM Kanban (`/kanban`)

**Colunas (6x):**
- Background: `bg-white/[0.02] border border-white/06 rounded-2xl`
- Header: badge de contagem com cor semântica, dot indicator
- Scroll interno com scrollbar customizada (2px, cor accent)

**Cards:**
```
┌─────────────────────────────┐
│ João Silva          [drag]  │
│ +55 11 99999-9999           │
│ ─────────────────────────── │
│ [Plano Mensal R$97]  [WA]  │
│ origem: WHATSAPP_DIRETO     │
│ há 2 dias                   │
└─────────────────────────────┘
```
- Background: `glass-card` com `radius-lg`
- Hover: `border-white/18` + `translateY(-2px)` suave
- Actions (👁 + ✈) aparecem com `opacity-0 → opacity-100` no hover
- Dragging: `opacity-60 rotate-1 scale-105 ring-2 ring-indigo-500`

**Drawer do Cliente (Right Panel):**
- Width: `min(480px, 100vw)`
- Background: `glass-overlay`
- Header: avatar grande (60px, iniciais gradient), nome h2, email subtitle
- Seção info: grid 2 colunas com label/valor
- Jornada no Funil: stepper vertical com etapas coloridas
- **NOVO: Timeline de Atividades** — lista cronológica com ícone por tipo, descrição, timestamp
- Footer fixo: botões WhatsApp (emerald) + Disparar n8n (indigo) + Editar (ghost)

### 4.3 Finanças (`/financas`) — NOVA

**Layout:** KPIs topo (3x) → Line Chart → Tabela de lançamentos

**KPIs:**
- Receitas do Mês: valor + trend vs mês anterior
- Despesas do Mês: valor + trend
- Saldo Líquido: destaque grande, verde se positivo / vermelho se negativo

**Line Chart:**
- 6 meses de histórico (ganhos vs gastos)
- Ganhos: linha `emerald-400`, Gastos: linha `rose-400`
- Área preenchida com gradient suave

**Tabela:**
- Tipo (ganho/gasto), Descrição, Categoria, Valor, Data
- Ordenada por data desc
- Row hover: `bg-white/03`

### 4.4 Pesquisa Global (`Ctrl+K`)
- Modal centralizado: `max-w-xl rounded-2xl glass-overlay`
- Input com ícone de lupa, auto-focus
- Resultados em lista: avatar, nome, telefone, badge status
- Keyboard navigation (↑↓ + Enter)
- ESC para fechar

### 4.5 Toast System
- Posição: `top-right`, `z-[9999]`
- Tipos: success (emerald), error (rose), info (blue), warning (amber)
- Animação: slide-in da direita + fade-out após 4s
- Ícone + mensagem + botão X

---

## 5. Sistema de Cores por Status do Funil

| Status | Cor | Hex | Classe |
|--------|-----|-----|--------|
| NOVO | Azul | #60A5FA | `text-blue-400 bg-blue-500/10 border-blue-500/20` |
| EM_ATENDIMENTO | Âmbar | #FBBF24 | `text-amber-400 bg-amber-500/10 border-amber-500/20` |
| FOLLOW_UP | Roxo | #A78BFA | `text-violet-400 bg-violet-500/10 border-violet-500/20` |
| PROPOSTA | Ciano | #22D3EE | `text-cyan-400 bg-cyan-500/10 border-cyan-500/20` |
| FECHADO | Esmeralda | #34D399 | `text-emerald-400 bg-emerald-500/10 border-emerald-500/20` |
| PERDIDO | Rosa | #F87171 | `text-rose-400 bg-rose-500/10 border-rose-500/20` |

---

## 6. Componentes Novos a Criar

| Componente | Arquivo | Descrição |
|-----------|---------|-----------|
| `SkeletonCard` | `ui/SkeletonCard.tsx` | Placeholder animado shimmer para KPIs |
| `SkeletonKanban` | `ui/SkeletonKanban.tsx` | Placeholder para colunas do Kanban |
| `Toast` + `ToastProvider` | `ui/Toast.tsx` | Sistema de toasts global |
| `GlobalSearch` | `ui/GlobalSearch.tsx` | Modal Ctrl+K com busca |
| `ActivityTimeline` | `ui/ActivityTimeline.tsx` | Timeline de atividades no drawer |
| `StatusBadge` | `ui/StatusBadge.tsx` | Badge semântico por status do funil |
| `FinanceKPI` | `ui/FinanceKPI.tsx` | Card KPI com trend indicator |

---

## 7. Backend — Nenhuma Mudança de Schema

O schema atual é suficiente. Apenas melhorias de query e novos endpoints:

| Endpoint | Método | Novo/Existente | Descrição |
|----------|--------|----------------|-----------|
| `/api/dashboard/metrics` | GET | Existente | Manter + adicionar tendência vs mês anterior |
| `/api/clientes/search?q=` | GET | **Novo** | Busca por nome/telefone para pesquisa global |
| `/api/financas/resumo` | GET | **Novo** | Balanço mensal + últimos 6 meses |
| `/api/clientes/:id/atividades` | GET | **Novo** | Timeline de atividades de um cliente |
| `/api/clientes` | GET | Existente | Todos os clientes do Kanban |

---

## 8. Arquitetura de Componentes

```
src/
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx          [REWRITE — Liquid Glass]
│   │   ├── TopBar.tsx           [NEW — search + avatar]
│   │   └── AppLayout.tsx        [REWRITE — nova estrutura]
│   ├── ui/
│   │   ├── SkeletonCard.tsx     [NEW]
│   │   ├── SkeletonKanban.tsx   [NEW]
│   │   ├── Toast.tsx            [NEW]
│   │   ├── GlobalSearch.tsx     [NEW]
│   │   ├── StatusBadge.tsx      [NEW]
│   │   ├── ActivityTimeline.tsx [NEW]
│   │   └── FinanceKPI.tsx       [NEW]
│   └── charts/
│       ├── FunnelBarChart.tsx   [EXTRACT + REDESIGN]
│       └── FinanceLineChart.tsx [NEW]
├── pages/
│   ├── Dashboard.tsx            [REDESIGN]
│   ├── KanbanPage.tsx           [REDESIGN]
│   ├── FinancasPage.tsx         [NEW]
│   ├── NovoLead.tsx             [REDESIGN]
│   ├── ConfigPage.tsx           [REDESIGN]
│   └── Login.tsx                [REDESIGN]
├── hooks/
│   └── useToast.ts              [NEW]
├── contexts/
│   └── ToastContext.tsx         [NEW]
└── index.css                    [FULL REWRITE — design tokens]
```

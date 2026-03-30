# Design 004 — DaviCode CRM Overhaul

## Paleta & Tipografia

- **Font**: `Inter` via Google Fonts (já no stack Tailwind/Vite)
- **Base**: `zinc-950` background, `zinc-900` cards, `zinc-800` borders
- **Accent primary**: `indigo-500` / `indigo-600`
- **Accent success**: `green-500`
- **Accent warning**: `amber-500`
- **Accent danger**: `red-500`
- **Text**: `white` primary, `zinc-400` secondary, `zinc-600` placeholder

## Layout Geral

```
┌──────────────────────────────────────────────┐
│ SIDEBAR (64px collapsed / 240px expanded)     │
│  Logo + nome                                  │
│  Nav groups:                                  │
│    [Dashboard]                                │
│    [Leads CRM] → /clientes (Kanban)           │
│    [Todos os Leads] → /clientes-lista         │
│    [Novo Lead] → modal/drawer                 │
│    ── Admin ──                                │
│    [Configurações]                            │
│  Avatar + logout (bottom)                     │
├──────────────────────────────────────────────┤
│ MAIN CONTENT (flex-1, overflow-y-auto)        │
│  Page header → h2 + breadcrumb                │
│  Content area                                 │
└──────────────────────────────────────────────┘
```

## Componentes

### `LeadDrawer` (NOVO — substitui `ClienteSheet`)
- **Trigger**: botão olho na tabela ou card do Kanban
- **Layout**: `fixed inset-y-0 right-0 w-[480px]` com backdrop
- **Tabs**:
  - `Dados` — campos editáveis em linha (nome, email, tel, plano, status, origem)
  - `Atividades` — feed vertical com data, tipo, descrição
  - `Follow-up` — datetime picker para `proximo_followup` + campo de observação
- **Footer**: [Salvar] [WhatsApp] [Deletar]

### `ConfirmModal` (NOVO)
- Modal centralizado para confirmar deleção de lead
- Substitui `window.confirm()`

### `Toast` system (NOVO)
- `useToast` hook simples ou biblioteca `react-hot-toast`
- Substitui todos os `alert()` do código

### `NovoLeadModal` (NOVO)
- Formulário atual de `NovoLead.tsx` movido para um `<dialog>` overlay
- Vai abrir a partir da sidebar ou botão "+" no topo

## Mapa de Dependências

```
LeadDrawer
  ├── usa: GET /clientes/:id  (atividades)
  ├── usa: PUT /clientes/:id  (salvar)
  ├── usa: DELETE /clientes/:id (deletar — CRIAR)
  └── usa: PATCH /clientes/:id (proximo_followup)

ClientesList
  └── usa: LeadDrawer (substituir ClienteSheet inline)

KanbanPage
  └── usa: LeadDrawer (substituir ClienteSheet inline)

NovoLeadModal
  └── usa: POST /clientes (existente)
```

## Backend: Endpoint Novos

| Método | Rota | Descrição |
|--------|------|-----------|
| DELETE | `/clientes/:id` | Deletar lead + atividades (cascade já configurado) |

> Todos os outros endpoints já existem. Nenhuma migration de banco necessária.

## Divisão de Trabalho

| Escopo | Responsável |
|--------|-------------|
| `LeadDrawer` JSX (>200 linhas) | **Antigravity diretamente** (sem Stitch — é integração com API) |
| `ConfirmModal`, `Toast`, `NovoLeadModal` | Antigravity |
| `DELETE /clientes/:id` no backend | Antigravity |
| Upgrade visual Sidebar | Antigravity |
| Dashboard KPIs upgrade | Antigravity |

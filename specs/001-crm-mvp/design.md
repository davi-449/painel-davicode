# Design Document: Painel Admin CRM DaviCode — Spec 001-MVP

## 1. Stack Definitiva

| Camada | Tecnologia | Detalhes |
|---|---|---|
| Frontend | Vite + React + TypeScript | Código manual (não Stitch) |
| Estilização | Tailwind CSS + Shadcn UI | Dark mode premium |
| Backend | Express + Prisma + TypeScript | API RESTful |
| Database | **NeonDB** (projeto `soft-band-46139434`) | PostgreSQL 17, `sa-east-1` |
| Auth | bcrypt + JWT (jsonwebtoken) | Simples, 1-2 users |
| Frontend Host | Vercel | `painel.davicode.me` |
| Backend Host | Render (free tier) | `api-painel-davicode.onrender.com` |
| Gráficos | Recharts | Leve, React nativo |
| Drag & Drop | @dnd-kit/core + sortable | Mantido ativamente |

---

## 2. API Routes (Backend Express)

### Auth
| Method | Route | Descrição |
|---|---|---|
| POST | `/api/auth/login` | Email + senha → JWT token |
| GET | `/api/auth/me` | Valida token, retorna user |

### Clientes
| Method | Route | Descrição |
|---|---|---|
| GET | `/api/clientes` | Lista todos (com filtros opcionais) |
| GET | `/api/clientes/:id` | Detalhe com atividades |
| POST | `/api/clientes` | Cria lead |
| PATCH | `/api/clientes/:id` | Atualiza campos (status, plano, etc.) |
| PATCH | `/api/clientes/:id/status` | Move no Kanban (atualiza `status_funil`) |

### Dashboard
| Method | Route | Descrição |
|---|---|---|
| GET | `/api/dashboard/kpis` | 4 KPIs agregados |
| GET | `/api/dashboard/funil` | Contagem por status (gráfico pizza) |
| GET | `/api/dashboard/leads-mensal` | Leads por mês (gráfico barras) |

### Config
| Method | Route | Descrição |
|---|---|---|
| GET | `/api/config/:chave` | Busca configuração |
| PUT | `/api/config/:chave` | Atualiza (ex: prompt IA) |

### Planos
| Method | Route | Descrição |
|---|---|---|
| GET | `/api/planos` | Lista planos |
| POST | `/api/planos` | Cria plano |
| PATCH | `/api/planos/:id` | Edita plano |
| DELETE | `/api/planos/:id` | Desativa plano |

### Dispatch (→ n8n)
| Method | Route | Descrição |
|---|---|---|
| POST | `/api/dispatch` | `{ action, cliente_id, payload }` → webhook n8n |

---

## 3. Prisma Schema

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model clientes_crm {
  id                   String       @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  telefone             String       @unique @db.VarChar
  nome                 String?      @db.VarChar
  email                String?      @db.VarChar
  cpf_cnpj             String?      @db.VarChar
  plano                String?      @db.VarChar        // Campo legado (n8n usa)
  status_funil         String?      @db.VarChar
  data_hora_followup   String?      @db.VarChar        // Campo legado (n8n usa)
  resumo_lead          String?
  link_asaas           String?
  status_pagamento     String?      @db.VarChar
  created_at           DateTime?    @default(now())
  updated_at           DateTime?    @default(now())
  id_conversa_chatwoot Int?
  link_site            String?
  
  // Campos novos (painel)
  plano_id             String?      @db.Uuid
  proximo_followup     DateTime?    @db.Timestamptz
  origem               String?      @default("WHATSAPP_DIRETO") @db.VarChar(50)

  plano_ref            planos?      @relation(fields: [plano_id], references: [id])
  atividades           atividades[]
}

model planos {
  id           String        @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  nome         String
  tipo         String        @db.VarChar(20)  // MENSAL, ANUAL
  valor_mensal Decimal       @db.Decimal(10, 2)
  ativo        Boolean       @default(true)
  created_at   DateTime      @default(now()) @db.Timestamptz

  clientes     clientes_crm[]
}

model atividades {
  id          String       @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  cliente_id  String       @db.Uuid
  tipo        String       @db.VarChar(50)
  descricao   String
  metadata    Json?
  created_at  DateTime     @default(now()) @db.Timestamptz

  cliente     clientes_crm @relation(fields: [cliente_id], references: [id], onDelete: Cascade)

  @@index([cliente_id])
}

model usuarios_painel {
  id         String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  nome       String   @db.VarChar(100)
  email      String   @unique @db.VarChar(255)
  senha_hash String   @db.VarChar(255)
  role       String   @default("ADMIN") @db.VarChar(20)
  created_at DateTime @default(now()) @db.Timestamptz
}

model configuracoes {
  chave      String   @id @db.VarChar(100)
  valor      String
  updated_at DateTime @default(now()) @db.Timestamptz
}
```

> [!IMPORTANT]
> O Prisma mapeia as tabelas existentes SEM ALTERAR campos que o n8n usa. As colunas novas (`plano_id`, `proximo_followup`, `origem`) são aditivas e nullable.

---

## 4. Segurança

- **JWT:** Token com expiração de 24h, assinado com `JWT_SECRET`
- **Middleware:** Toda rota exceto `/api/auth/login` exige header `Authorization: Bearer <token>`
- **bcrypt:** Senha do admin hasheda com salt rounds = 12
- **CORS:** Configurado para aceitar apenas `painel.davicode.me`
- **Rate limiting:** `express-rate-limit` no login (5 tentativas/min)
- **Webhook n8n:** Header `X-Webhook-Secret` compartilhado entre backend e n8n

---

## 5. Integração n8n

### O que muda no n8n (mínimo)
1. **Ler prompt da tabela `configuracoes`** em vez de hardcoded:
   ```sql
   SELECT valor FROM configuracoes WHERE chave = 'prompt_agente_ia'
   ```
2. **Receber webhooks do painel** para disparos ativos (mesmo formato que já aceita)

### O que NÃO muda no n8n
- Connection string do NeonDB (mesma)
- Tabelas `n8n_*` (intocadas)
- `clientes_crm` — n8n continua lendo/escrevendo nos campos legados
- Fluxos existentes de atendimento

---

## 6. Deploy & Infraestrutura

### Frontend (Vercel)
- Repo: `github.com/davi-449/painel-davicode`
- Branch: `main` → auto-deploy
- Custom domain: `painel.davicode.me` (CNAME no Cloudflare)
- Env: `VITE_API_URL=https://api-painel-davicode.onrender.com`

### Backend (Render Free Tier)
- Repo: mesmo ou pasta `/backend` no monorepo
- Build command: `npm run build`
- Start command: `node dist/server.js`
- Env: `DATABASE_URL`, `JWT_SECRET`, `N8N_WEBHOOK_URL`, `N8N_WEBHOOK_SECRET`
- Nota: Free tier hiberna após 15min sem requests — aceitável no MVP

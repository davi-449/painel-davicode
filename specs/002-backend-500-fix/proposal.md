# 002 — Correção de Erros 500 em Operações de Escrita

## Contexto

O CRM DaviCode está em produção no Render. A autenticação e todas as operações de leitura (GET) estão 100% funcionais. Porém qualquer operação de escrita (POST, PUT, DELETE) retorna HTTP 500. Uma auditoria completa do código-fonte, do formulário de cadastro e da configuração do Render identificou **4 causas raiz**.

---

## Causas Raiz Identificadas (Ordem de Criticidade)

### 🔴 BUG-1: `plano_id` enviado como string vazia `""` quando nenhum plano é selecionado

**Arquivo:** `src/pages/NovoLead.tsx` — linha 21

```ts
// Estado inicial do form
plano_id: '',  // ← '' não é um UUID válido
```

Quando o usuário escolhe "Nenhum" no dropdown, o `form.plano_id = ""` é enviado no body do POST. O Prisma tenta inserir `plano_id: ""` como chave estrangeira UUID na tabela `planos` → **PostgreSQL lança um erro de constraint** → 500.

**Correção (uma linha):** Antes de enviar o POST, converter `""` para `null`:
```ts
const payload = { ...form, plano_id: form.plano_id || null };
await api.post('/clientes', payload);
```

### 🔴 BUG-2: Controllers não propagam o erro real — debug impossível

Todos os controllers usam:
```ts
} catch (error) {
  res.status(500).json({ error: 'mensagem genérica' });
}
```
O erro real (ex.: `UniqueConstraintViolation`, `ForeignKeyConstraintViolation`) nunca é logado nem retornado. É impossível diagnosticar bugs em produção sem ver o erro real.

**Correção:** Adicionar error handler global no Express e `next(error)` nos controllers afetados.

### 🟡 BUG-3: Build Command do Render não compila o TypeScript

Render Build Command atual:
```
npm install && npx prisma generate
```
Falta o passo de compilação TypeScript (`tsc`). O servidor roda com `npx tsx src/server.ts` (runner de dev) ao invés de `node dist/server.js`. Isso funciona, mas é instável e lento — `tsx` é um devDependency não garantido no contexto de produção do Render.

**Correção do Build Command:**
```
npm install && npx prisma generate && npx tsc
```
**Correção do Start Command:**
```
node dist/server.js
```

### 🟡 BUG-4: `NODE_ENV` não configurado no Render

Sem `NODE_ENV=production`, o server.ts não ativa o bloco de static file serving e SPA fallback que adicionamos na spec 001.

**Correção:** Adicionar `NODE_ENV=production` nas Environment Variables do Render.

---

## Requisitos Funcionais

1. Criar Lead sem plano selecionado deve funcionar (`plano_id = null`).
2. Criar Plano via Configurações deve persistir no NeonDB.
3. Deletar Plano deve remover o registro.
4. Drag-and-drop no Kanban deve persistir o novo `status_funil`.
5. Salvar Configurações (webhook + prompt) deve persistir.

## Critérios de Aceite

- [ ] POST `/api/clientes` com `plano_id` vazio → 201 + lead no Kanban
- [ ] POST `/api/planos` com payload válido → 201 + plano na tabela
- [ ] DELETE `/api/planos/:id` → 204 + plano removido
- [ ] PATCH `/api/clientes/:id` (Kanban) → status persiste após refresh
- [ ] PUT `/api/config` → webhook + prompt salvos
- [ ] Em caso de erro, a resposta contém a mensagem real do Prisma (dev) ou mensagem amigável (prod)

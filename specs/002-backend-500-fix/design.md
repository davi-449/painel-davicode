# 002 — Design Técnico das Correções

## Fix 1: `NovoLead.tsx` — sanitizar `plano_id` antes do POST

```diff
 const handleSubmit = async (e: React.FormEvent) => {
   e.preventDefault();
   if (!form.nome || !form.telefone) return;
   setLoading(true);
   try {
-    await api.post('/clientes', form);
+    const payload = { ...form, plano_id: form.plano_id || null };
+    await api.post('/clientes', payload);
     navigate('/clientes');
   } catch (err) {
```

**Regra:** Qualquer campo opcional do tipo UUID deve ser `null` (não `""`) ao ser enviado para o Prisma.

---

## Fix 2: Error Handler Global em `backend/src/server.ts`

Adicionar **após todas as rotas** e **antes do `app.listen`**:

```typescript
import { Request, Response, NextFunction } from 'express';

// Error handler global (deve ser o último middleware)
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[GLOBAL ERROR HANDLER]', err);
  const isDev = process.env.NODE_ENV !== 'production';
  res.status(err.status || 500).json({
    error: isDev ? err.message : 'Erro interno no servidor.',
  });
});
```

Atualizar os controllers para propagar com `next(error)` ao invés de responder manualmente:

```diff
-async create(req: Request, res: Response): Promise<void> {
+async create(req: Request, res: Response, next: NextFunction): Promise<void> {
   try {
     ...
-  } catch (error) {
-    res.status(500).json({ error: 'Erro ao criar plano' });
-  }
+  } catch (error) {
+    next(error);
+  }
```

Aplicar em: `PlanoController`, `ClienteController`, `ConfigController`, `DashboardController`, `DispatchController`.

---

## Fix 3: Atualizar Render Build + Start Command

| Campo | Atual (❌) | Correto (✅) |
|-------|-----------|------------|
| **Build Command** | `npm install && npx prisma generate` | `npm install && npx prisma generate && npx tsc` |
| **Start Command** | `npx tsx src/server.ts` | `node dist/server.js` |

---

## Fix 4: Adicionar `NODE_ENV=production` no Render

Adicionar nas Environment Variables do Render:
- **Key:** `NODE_ENV`
- **Value:** `production`

Isso ativa o bloco de static file serving (`express.static`) e o SPA fallback (`/*` → `index.html`) que exists em `server.ts`.

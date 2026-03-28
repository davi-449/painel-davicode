# 001 — Design Técnico das Correções

## Visão Geral da Arquitetura

```
[ React SPA (Vite) ]  ──build──►  [ /dist ]
                                       │
[ Express API ]  ◄── express.static ───┘
      │                                
      ├── /api/auth/*                  
      ├── /api/clientes/*              
      ├── /api/dashboard/*             
      ├── /api/config/*                
      ├── /api/planos/*                
      ├── /api/dispatch/*              
      └── /* (SPA fallback) ──► dist/index.html
```

---

## Correções por Arquivo

### 1. `src/lib/api.ts` — Unificar chaves do localStorage

```diff
 // Interceptor: attach JWT to every request
 api.interceptors.request.use((config) => {
-  const token = localStorage.getItem('token');
+  const token = localStorage.getItem('@DaviCode:token');
   if (token) {
     config.headers.Authorization = `Bearer ${token}`;
   }
   return config;
 });

 // Interceptor: handle 401 → redirect to login
 api.interceptors.response.use(
   (response) => response,
   (error) => {
     if (error.response?.status === 401) {
-      localStorage.removeItem('token');
-      localStorage.removeItem('user');
-      window.location.href = '/login';
+      localStorage.removeItem('@DaviCode:token');
+      localStorage.removeItem('@DaviCode:user');
+      // Soft redirect via React Router, avoid infinite reload
+      if (window.location.pathname !== '/login') {
+        window.location.href = '/login';
+      }
     }
     return Promise.reject(error);
   }
 );
```

### 2. `backend/src/server.ts` — Servir frontend estático + SPA fallback

```diff
+import path from 'path';
+import { fileURLToPath } from 'url';
+
+const __filename = fileURLToPath(import.meta.url);
+const __dirname = path.dirname(__filename);

 // Routes
 app.use('/api/auth', authRoutes);
 // ... demais rotas ...

+// Em produção: servir arquivos estáticos do frontend
+const distPath = path.join(__dirname, '../../dist');
+app.use(express.static(distPath));
+
+// SPA Fallback: qualquer rota não-API → index.html
+app.get('*', (req, res) => {
+  res.sendFile(path.join(distPath, 'index.html'));
+});
```

> **Nota:** O `__dirname` usa ESM-compatible resolution porque o `tsconfig.json` do backend está em `"module": "commonjs"` — verificar na implementação.

### 3. Resetar o hash da senha admin no NeonDB

```sql
-- Gerar novo hash para senha "Davi2026!" via script Node.js
-- E fazer UPDATE direto no banco
UPDATE usuarios_painel 
SET senha_hash = '<novo_hash_bcrypt>'
WHERE email = 'admin@davicode.me';
```

O hash será gerado via script local com `bcrypt.hash('Davi2026!', 10)` e inserido na query.

### 4. `src/pages/Login.tsx` — Garantir exibição de erro

O código já tem a lógica de error state. Apenas garantir que o catch trata todos os cenários:

```diff
     } catch (err: any) {
-      setError(err.response?.data?.error || 'Erro ao realizar login');
+      const msg = err.response?.data?.error 
+        || err.response?.data?.message 
+        || 'Erro ao realizar login. Verifique suas credenciais.';
+      setError(msg);
     }
```

### 5. `src/pages/Dashboard.tsx` — Corrigir classes Tailwind dinâmicas

Substituir interpolação dinâmica por mapeamento estático (safelist):

```diff
-  `hover:border-${color}-500/50`
-  `bg-${color}-500/10`
+  // Usar mapeamento estático
+  const colorMap: Record<string, { hover: string; bg: string; glow: string }> = {
+    indigo: { hover: 'hover:border-indigo-500/50', bg: 'bg-indigo-500/10', glow: 'group-hover:bg-indigo-500/20' },
+    green:  { hover: 'hover:border-green-500/50',  bg: 'bg-green-500/10',  glow: 'group-hover:bg-green-500/20'  },
+    purple: { hover: 'hover:border-purple-500/50', bg: 'bg-purple-500/10', glow: 'group-hover:bg-purple-500/20' },
+    blue:   { hover: 'hover:border-blue-500/50',   bg: 'bg-blue-500/10',   glow: 'group-hover:bg-blue-500/20'   },
+  };
```

### 6. Build Pipeline (Render)

O `build command` no Render deve ser atualizado para:

```bash
cd backend && npm install && npx prisma generate && npm run build && cd .. && npm install && npm run build
```

E variáveis de ambiente no Render:
- `DATABASE_URL` = connection string NeonDB
- `JWT_SECRET` = chave secreta para JWT
- `VITE_API_URL` = (vazio ou ausente — usar path relativo)
- `NODE_ENV` = production

---

## Banco de Dados (NeonDB/PostgreSQL)

Nenhuma alteração de schema necessária. Apenas um `UPDATE` para corrigir o hash da senha do admin.

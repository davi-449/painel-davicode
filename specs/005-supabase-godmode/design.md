# 🎨 Design — Painel DaviCode: Supabase Godmode

## 1. Arquitetura de Dados — Supabase

### 1.1 Migration SQL (Neon → Supabase)

A migração replica o schema exato do Neon com os seguintes ajustes:

```sql
-- ① Tabela de clientes CRM (central do sistema)
CREATE TABLE IF NOT EXISTS clientes_crm (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  telefone        VARCHAR(20) UNIQUE NOT NULL,
  nome            VARCHAR(100),
  email           VARCHAR(100),
  cpf_cnpj        VARCHAR(20),
  status_funil    VARCHAR(50) DEFAULT 'NOVO',
  plano_id        UUID REFERENCES planos(id) ON DELETE SET NULL,
  origem          VARCHAR(50) DEFAULT 'WHATSAPP_DIRETO',
  resumo_lead     TEXT,
  link_asaas      TEXT,
  link_site       TEXT,
  status_pagamento VARCHAR(50),
  data_hora_followup VARCHAR(50),
  proximo_followup TIMESTAMPTZ,
  id_conversa_chatwoot INTEGER,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ② Atividades (timeline por cliente)
CREATE TABLE IF NOT EXISTS atividades (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id  UUID REFERENCES clientes_crm(id) ON DELETE CASCADE,
  tipo        VARCHAR(50) NOT NULL,
  descricao   TEXT NOT NULL,
  metadata    JSONB,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ③ Planos de serviço
CREATE TABLE IF NOT EXISTS planos (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome         TEXT NOT NULL,
  tipo         VARCHAR(20) NOT NULL CHECK (tipo IN ('MENSAL','ANUAL')),
  valor_mensal NUMERIC(10,2) NOT NULL,
  ativo        BOOLEAN DEFAULT TRUE,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ④ Configurações (key-value)
CREATE TABLE IF NOT EXISTS configuracoes (
  chave      VARCHAR(100) PRIMARY KEY,
  valor      TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ⑤ Finanças — Ganhos
CREATE TABLE IF NOT EXISTS jarvis_ganhos (
  id              SERIAL PRIMARY KEY,
  data            TIMESTAMPTZ DEFAULT NOW(),
  descricao       TEXT NOT NULL,
  valor           NUMERIC(10,2) NOT NULL,
  categoria       VARCHAR(50) DEFAULT 'Renda Principal',
  telefone_origem VARCHAR(20)
);

-- ⑥ Finanças — Gastos
CREATE TABLE IF NOT EXISTS jarvis_gastos (
  id              SERIAL PRIMARY KEY,
  data            TIMESTAMPTZ DEFAULT NOW(),
  descricao       TEXT NOT NULL,
  valor           NUMERIC(10,2) NOT NULL,
  categoria       VARCHAR(50) DEFAULT 'Geral',
  telefone_origem VARCHAR(20)
);

-- ⑦ Controle de ciclos de renda
CREATE TABLE IF NOT EXISTS jarvis_controle_renda (
  id               SERIAL PRIMARY KEY,
  mes_referencia   VARCHAR(7) NOT NULL,
  ciclo_pagamento  VARCHAR(10) NOT NULL,
  recebido         BOOLEAN DEFAULT FALSE,
  data_confirmacao TIMESTAMPTZ,
  UNIQUE (mes_referencia, ciclo_pagamento)
);

-- ⑧ N8N — fila de mensagens
CREATE TABLE IF NOT EXISTS n8n_fila_mensagens (
  id          BIGSERIAL PRIMARY KEY,
  id_mensagem VARCHAR(40) NOT NULL,
  telefone    VARCHAR(40) NOT NULL,
  mensagem    TEXT NOT NULL,
  timestamp   TIMESTAMPTZ NOT NULL
);

-- ⑨ N8N — histórico de conversas
CREATE TABLE IF NOT EXISTS n8n_historico_mensagens (
  id         BIGSERIAL PRIMARY KEY,
  session_id VARCHAR(40) NOT NULL,
  message    JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ⑩ N8N — status de atendimento
CREATE TABLE IF NOT EXISTS n8n_status_atendimento (
  id                  BIGSERIAL PRIMARY KEY,
  session_id          VARCHAR(40) UNIQUE NOT NULL,
  lock_conversa       BOOLEAN DEFAULT FALSE,
  aguardando_followup BOOLEAN DEFAULT FALSE,
  numero_followup     INTEGER DEFAULT 0,
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ⑪ Solicitações de login (onboarding via WhatsApp)
CREATE TABLE IF NOT EXISTS solicitacoes_login (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_curto             SERIAL,
  telefone_cliente     TEXT NOT NULL,
  nome_cliente         TEXT NOT NULL,
  id_conversa_chatwoot INTEGER NOT NULL,
  tipo                 VARCHAR(20) NOT NULL,
  status               VARCHAR(20) DEFAULT 'PENDENTE',
  login_gerado         TEXT,
  senha_gerada         TEXT,
  admin_telefone       TEXT,
  created_at           TIMESTAMPTZ DEFAULT NOW(),
  updated_at           TIMESTAMPTZ DEFAULT NOW(),
  approved_at          TIMESTAMPTZ,
  delivered_at         TIMESTAMPTZ
);

-- Índices críticos para performance
CREATE INDEX IF NOT EXISTS idx_clientes_status_funil ON clientes_crm(status_funil);
CREATE INDEX IF NOT EXISTS idx_clientes_telefone ON clientes_crm(telefone);
CREATE INDEX IF NOT EXISTS idx_atividades_cliente ON atividades(cliente_id);
CREATE INDEX IF NOT EXISTS idx_ganhos_data ON jarvis_ganhos(data);
CREATE INDEX IF NOT EXISTS idx_gastos_data ON jarvis_gastos(data);
CREATE INDEX IF NOT EXISTS idx_n8n_session ON n8n_status_atendimento(session_id);
CREATE INDEX IF NOT EXISTS idx_n8n_historico_session ON n8n_historico_mensagens(session_id);

-- Trigger: atualiza updated_at automaticamente em clientes_crm
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_clientes_updated_at
  BEFORE UPDATE ON clientes_crm
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
```

### 1.2 RLS Policies

```sql
-- Habilitar RLS em tabelas sensíveis do painel
ALTER TABLE clientes_crm ENABLE ROW LEVEL SECURITY;
ALTER TABLE atividades ENABLE ROW LEVEL SECURITY;
ALTER TABLE planos ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE jarvis_ganhos ENABLE ROW LEVEL SECURITY;
ALTER TABLE jarvis_gastos ENABLE ROW LEVEL SECURITY;

-- Apenas usuários autenticados podem ler/escrever
CREATE POLICY "auth_users_all" ON clientes_crm
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "auth_users_all" ON atividades
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "auth_users_all" ON planos
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "auth_users_all" ON configuracoes
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "auth_users_all" ON jarvis_ganhos
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "auth_users_all" ON jarvis_gastos
  FOR ALL USING (auth.role() = 'authenticated');

-- N8N usa service_role key → bypassa RLS (sem policy necessária para n8n_*)
-- Tabelas n8n_* são escritas apenas pelo service_role
```

### 1.3 Realtime habilitado para:
- `clientes_crm` → INSERT, UPDATE, DELETE
- `atividades` → INSERT

---

## 2. Source of Truth — Status Funil

**Definição canônica** (única em todo o sistema):

```ts
// src/constants/funil.ts (frontend + referência para N8N)
export const FUNIL_STAGES = [
  { id: 'NOVO',           label: 'Novo',           color: '#60a5fa' },
  { id: 'EM_ATENDIMENTO', label: 'Em Atendimento', color: '#fbbf24' },
  { id: 'FOLLOW_UP',      label: 'Follow Up',      color: '#a78bfa' },
  { id: 'PROPOSTA',       label: 'Proposta',        color: '#22d3ee' },
  { id: 'FECHADO',        label: 'Fechado',         color: '#34d399' },
  { id: 'PERDIDO',        label: 'Perdido',         color: '#fb7185' },
] as const;

export type FunilStatus = typeof FUNIL_STAGES[number]['id'];
```

O N8N deve usar exatamente estes mesmos IDs ao escrever `status_funil`.

---

## 3. Estrutura de Componentes (Frontend)

### Arquivos a criar/modificar

```
src/
├── lib/
│   ├── supabase.ts              [NOVO] cliente supabase-js
│   └── api.ts                   [DELETAR] — axios replaced by supabase
├── constants/
│   └── funil.ts                 [NOVO] single source of truth dos status
├── hooks/
│   ├── useClientes.ts           [NOVO] query + realtime subscription
│   ├── useMetrics.ts            [NOVO] dashboard metrics via supabase
│   ├── useFinancas.ts           [NOVO] jarvis_ganhos/gastos real
│   └── useToast.ts              [EXISTENTE — manter]
├── contexts/
│   └── AuthContext.tsx          [MODIFICAR] → supabase.auth
├── pages/
│   ├── Dashboard.tsx            [MODIFICAR] → usa useMetrics()
│   ├── KanbanPage.tsx           [MODIFICAR] → usa useClientes() + realtime
│   ├── FinancasPage.tsx         [MODIFICAR] → usa useFinancas() real
│   ├── ConfigPage.tsx           [MODIFICAR] → supabase.from('configuracoes')
│   └── NovoLead.tsx             [MODIFICAR] → supabase.from('clientes_crm')
└── components/
    └── ui/
        └── EditClienteModal.tsx [NOVO] modal de edição de lead
```

### supabase/functions/ (Edge Functions)

```
supabase/functions/
└── dispatch-n8n/
    └── index.ts                 [NOVO] dispatch seguro para N8N
```

---

## 4. Supabase Client Setup

```ts
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  realtime: {
    params: { eventsPerSecond: 10 }
  }
});
```

---

## 5. AuthContext Refatorado

```ts
// src/contexts/AuthContext.tsx — padrão Supabase Auth
const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => setUser(session?.user ?? null)
    );

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const logout = () => supabase.auth.signOut();

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
```

---

## 6. Hook useClientes (Realtime)

```ts
// src/hooks/useClientes.ts
export function useClientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial fetch
    supabase
      .from('clientes_crm')
      .select('*, planos(*)')
      .order('updated_at', { ascending: false })
      .then(({ data }) => {
        setClientes(data ?? []);
        setLoading(false);
      });

    // Realtime subscription
    const channel = supabase
      .channel('clientes_changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'clientes_crm' },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            setClientes(prev =>
              prev.map(c => c.id === payload.new.id ? { ...c, ...payload.new } : c)
            );
          } else if (payload.eventType === 'INSERT') {
            setClientes(prev => [payload.new as Cliente, ...prev]);
          } else if (payload.eventType === 'DELETE') {
            setClientes(prev => prev.filter(c => c.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  const updateStatus = async (clienteId: string, newStatus: FunilStatus) => {
    const { error } = await supabase
      .from('clientes_crm')
      .update({ status_funil: newStatus })
      .eq('id', clienteId);
    if (error) throw error;
  };

  return { clientes, loading, updateStatus };
}
```

---

## 7. Edge Function — dispatch-n8n

```ts
// supabase/functions/dispatch-n8n/index.ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

Deno.serve(async (req) => {
  const { cliente_id } = await req.json();

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  // Buscar cliente
  const { data: cliente } = await supabase
    .from('clientes_crm')
    .select('*, planos(*)')
    .eq('id', cliente_id)
    .single();

  // Buscar config do webhook
  const { data: configs } = await supabase
    .from('configuracoes')
    .select('chave, valor')
    .in('chave', ['webhook_n8n', 'prompt_agente_ia']);

  const configMap = Object.fromEntries(configs.map(c => [c.chave, c.valor]));

  if (!configMap.webhook_n8n) {
    return new Response(JSON.stringify({ error: 'Webhook não configurado' }), { status: 400 });
  }

  // Chamar N8N
  await fetch(configMap.webhook_n8n, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      cliente: { id: cliente.id, nome: cliente.nome, telefone: cliente.telefone, email: cliente.email, plano: cliente.planos?.nome },
      prompt_ia: configMap.prompt_agente_ia || '',
      action: 'DISPARO_MANUAL_PAINEL',
    }),
  });

  // Registrar atividade
  await supabase.from('atividades').insert({
    cliente_id: cliente_id,
    tipo: 'DISPARO_N8N',
    descricao: 'Mensagem inicial disparada via n8n (painel)',
  });

  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' }
  });
});
```

---

## 8. Design Visual (manter estética atual + melhorias)

A paleta dark glass atual é excelente. Manter e complementar:

```css
/* Tokens existentes preservados */
--bg-primary:     #0a0a14    /* ultra dark */
--glass-card:     rgba(255,255,255,0.04)
--border-subtle:  rgba(255,255,255,0.06)
--accent-indigo:  #6366f1
--accent-emerald: #10b981

/* Novo: toasts estilo Supabase */
--toast-success:  rgba(16,185,129,0.15)
--toast-error:    rgba(239,68,68,0.15)

/* Novo: Realtime indicator */
--realtime-pulse: #10b981  /* verde pulsante quando conectado */
```

### Novo componente: Indicador Realtime
- ícone verde pulsante no header quando subscription ativa
- ícone cinza quando offline/desconectado

### Novo componente: EditClienteModal
- Drawer lateral (mesmo padrão do ClienteSheet existente)
- Formulário com todos os campos editáveis
- Validação em tempo real (Zod)
- Auto-save com debounce 500ms para UX fluida

---

## 9. Variáveis de Ambiente

### Frontend (.env)
```
VITE_SUPABASE_URL=https://hcarwjemzpwcodhboxvz.supabase.co
VITE_SUPABASE_ANON_KEY=<anon_key_do_projeto>
```

### N8N (configurações de conexão)
```
DB_HOST=db.hcarwjemzpwcodhboxvz.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=<senha_do_projeto>
```
Ou usar a connection string direta do Supabase (pooling via PgBouncer recomendado).

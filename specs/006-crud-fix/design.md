# Design — Spec 006: CRUD Fix

## Banco de Dados (Supabase)

### Migration SQL a executar no SQL Editor do Supabase:

```sql
-- 1. Adicionar coluna observacoes em clientes_crm
ALTER TABLE clientes_crm
  ADD COLUMN IF NOT EXISTS observacoes TEXT;

-- 2. Criar tabela lancamentos (financeiro)
CREATE TABLE IF NOT EXISTS lancamentos (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo        VARCHAR(20) NOT NULL CHECK (tipo IN ('receita', 'despesa')),
  descricao   TEXT        NOT NULL,
  valor       DECIMAL(10,2) NOT NULL,
  data        TIMESTAMPTZ DEFAULT now(),
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- 3. Habilitar RLS
ALTER TABLE lancamentos    ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes_crm   ENABLE ROW LEVEL SECURITY;

-- 4. Policies: usuários autenticados têm acesso total
CREATE POLICY IF NOT EXISTS "auth_all_lancamentos"
  ON lancamentos FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "auth_all_clientes"
  ON clientes_crm FOR ALL TO authenticated
  USING (true) WITH CHECK (true);
```

---

## Frontend

### NovoLead.tsx
- Incluir `observacoes` no payload do `supabase.from('clientes_crm').insert()` (não mais omitido)
- Adicionar `alert()` em caso de erro com mensagem legível

### useFinancas.ts
- Buscar dados reais de `lancamentos` via Supabase  
- Expor `addLancamento(tipo, descricao, valor)` e `deleteLancamento(id)`
- Invalidar cache após mutações
- Fallback para dados mock se tabela estiver vazia (não gera erro)

### FinancasPage.tsx

#### Botão "Nova Transação"
- Posição: header da página, alinhado à direita  
- Ícone: `Plus` (lucide-react)
- Estilo: `bg-indigo-600 hover:bg-indigo-700`

#### Modal de Nova Transação
- Campos: Tipo (select: Receita/Despesa) | Descrição (input text) | Valor (number input)
- Botões: Cancelar | Salvar
- Após salvar: fecha modal + refetch da lista (sem recarregar página)

#### Tabela de Lançamentos
- Coluna extra: ícone `Trash2` em cada linha
- Ao clicar: `window.confirm()` → chama `deleteLancamento(id)` → atualiza UI
- Linhas mock (id = '1' ou '2'): não exibem botão de exclusão

# Spec 006 — CRUD Fix: Cadastro de Leads + Lançamentos Financeiros

## Contexto

Auditor E2E identificou dois CRUDs quebrados em produção:

1. **Cadastro de Lead** falha com erro `PGRST204: Could not find the 'observacoes' column` — a coluna existe no formulário mas não foi criada na migration do banco.
2. **Finanças** não possui UI para adicionar ou excluir lançamentos — a página é somente leitura e usa dados hardcoded; não existe tabela `lancamentos` no Supabase.

---

## User Stories

### US-01 — Cadastrar Lead
> Como operador, quero cadastrar um novo lead preenchendo nome, telefone, e-mail, plano e observações, para que ele apareça no Kanban.

**Critérios de Aceite:**
- O formulário em `/clientes/novo` deve salvar com sucesso no Supabase.
- O campo `observacoes` deve ser persistido na tabela.
- Após salvar, o usuário é redirecionado para `/clientes` e o lead aparece na coluna "Novo".
- Em caso de erro, uma mensagem clara é exibida (não silêncio).

### US-02 — Registrar Lançamento Financeiro
> Como operador, quero adicionar receitas e despesas com descrição e valor, para que o saldo do painel reflita a realidade.

**Critérios de Aceite:**
- A página `/financas` deve ter um botão "Nova Transação".
- Ao clicar, um modal abre com campos: Tipo (Receita/Despesa), Descrição, Valor.
- Após salvar, o lançamento aparece na tabela "Últimos Lançamentos" sem recarregar a página.
- O MRR/despesas refletem os valores reais da tabela `lancamentos`.

### US-03 — Excluir Lançamento
> Como operador, quero excluir lançamentos incorretos, para manter o relatório financeiro limpo.

**Critérios de Aceite:**
- Cada linha da tabela de lançamentos deve ter um botão de exclusão (ícone lixeira).
- Confirmar exclusão remove o registro do Supabase e atualiza a lista imediatamente.
- Lançamentos com `id` mock (dados de fallback) não exibem botão de exclusão.

---

## BDD Scenarios

### Cenário: Cadastro de lead com observação
- **Given:** Operador acessa `/clientes/novo` e preenche nome "João Teste", telefone "(11) 99999-9999" e observação "Veio pelo Instagram"
- **When:** Clica em "Cadastrar Lead"
- **Then:** Lead aparece no Kanban na coluna "Novo", sem erro no console

### Cenário: Falha de validação no cadastro
- **Given:** Operador acessa `/clientes/novo` e deixa o campo Nome em branco
- **When:** Clica em "Cadastrar Lead"
- **Then:** Formulário não submete e exibe mensagem de campo obrigatório

### Cenário: Adicionar lançamento de receita
- **Given:** Operador está na página `/financas`
- **When:** Clica em "Nova Transação", preenche Tipo=Receita, Descrição="Novo cliente", Valor=500, e confirma
- **Then:** Linha aparece na tabela com badge verde "receita" e valor R$ 500,00

### Cenário: Excluir lançamento
- **Given:** Existe um lançamento "Teste" na tabela
- **When:** Operador clica no ícone de lixeira e confirma
- **Then:** A linha some da tabela sem recarregar a página

---

## Escopo Técnico

### Backend (Supabase — Migration SQL)
1. `ALTER TABLE clientes_crm ADD COLUMN IF NOT EXISTS observacoes TEXT;`
2. Criar tabela `lancamentos (id, tipo, descricao, valor, data, created_at)`
3. Habilitar RLS e policy `authenticated` para leitura e escrita em ambas

### Frontend
1. **`NovoLead.tsx`** — incluir `observacoes` no payload do insert (após coluna existir no banco)
2. **`useFinancas.ts`** — buscar dados reais de `lancamentos`, expor `addLancamento` e `deleteLancamento` com invalidação de cache
3. **`FinancasPage.tsx`** — adicionar botão "Nova Transação" + modal de formulário + ícone de lixeira em cada linha

---

## O que NÃO muda
- Layout geral das páginas
- Sistema de autenticação (já estável)
- ErrorBoundary e cache (já implementados)

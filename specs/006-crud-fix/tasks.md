# Tasks — Spec 006: CRUD Fix

## Pré-requisito obrigatório (manual)
- [ ] Usuário executa o SQL de migration no Supabase SQL Editor (de `design.md`)

## Backend / DB
- [ ] Confirmar que `clientes_crm.observacoes` existe após migration
- [ ] Confirmar que tabela `lancamentos` foi criada com RLS e policy corretos

## Frontend — NovoLead.tsx
- [x] Incluir `observacoes: form.observacoes` no payload do insert
- [x] Adicionar mensagem de erro visível (toast ou alert) em caso de falha
- [ ] Testar: cadastrar lead com observação → verificar no Supabase

## Frontend — useFinancas.ts
- [x] Buscar dados reais de `lancamentos` (select com order by data DESC)
- [x] Expor `addLancamento(tipo, descricao, valor)`
- [x] Expor `deleteLancamento(id)`
- [x] Ambas as funções devem invalidar o cache após mutação
- [x] Manter fallback mock para quando tabela estiver vazia

## Frontend — FinancasPage.tsx
- [x] Adicionar botão "Nova Transação" no header (ícone Plus + estilo indigo)
- [x] Criar estado `showModal` e `formModal`
- [x] Implementar modal com campos Tipo / Descrição / Valor
- [x] handleSubmit do modal: chama `addLancamento`, fecha modal, refetch
- [x] Adicionar ícone `Trash2` em cada linha da tabela de lançamentos
- [x] handleDelete: `window.confirm` + `deleteLancamento(id)` + refetch
- [x] Linhas com id mock ('1', '2') não exibem botão de exclusão

## Validação
- [x] `npm run build` sem erros de TypeScript
- [ ] Teste manual: cadastrar lead com observação → aparece no Kanban
- [ ] Teste manual: adicionar transação → aparece na tabela de lançamentos
- [ ] Teste manual: excluir transação → some da tabela imediatamente
- [x] Commit + push para o repo `davi-449/painel`

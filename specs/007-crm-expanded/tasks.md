# Tasks — Spec 007: CRM Expanded, Vendas & N8N Agent

## Backend / Database
- [ ] O Usuário deve rodar manualmente as migrations no SQL Editor do Supabase incluindo `motivo_perda`, `valor_contrato`, `tempo_contrato_meses`, `data_vencimento` na tabela `clientes_crm`.

## Hook
- [ ] Atualizar o método `updateClienteStatus` dentro de `src/hooks/useClientes.ts` para que ele receba um terceiro parâmetro de payload opcional (ex: `extraData?: Record<string, any>`) e o combine no `.update()` enviado ao BD. (Adicionar tipagem na interface).

## UI - Modals Kanban (Fechamento)
- [ ] Em `src/pages/KanbanPage.tsx`, adicionar state para capturar as interrupções de status ao soltar o Card.
- [ ] Criar / Renderizar `ModalVendaGanha` que será exibido se o `newStatus === 'FECHADO'`. 
   - Deve solicitar Valor de Contrato e Meses do Contrato e usar inputs textuais/numéricos estéticos.
- [ ] Criar / Renderizar `ModalVendaPerdida` que será exibido se `newStatus === 'PERDIDO'`.
   - Deve solicitar o campo Motivo (Textarea).
- [ ] O HandleSubmit desses modals deve chamar `updateClienteStatus(id, status, dados)` com os devidos mapeamentos e forçar refetch dos clientes.

## UI - Nova Tela (Lista de Clientes)
- [ ] Criar `src/pages/ClientesListaPage.tsx`
- [ ] Construir layout central com Table ou List moderna com design tátil usando as colunas: Cliente, Contato, Plano, Valor Mensal, Duração/Vencimento e Badge de Status.
- [ ] Puxar a listagem do DB (`useClientes`), ordenando por data de update_at ou criação.
- [ ] Registrar Rota no `App.tsx` e Link lateral no "Dashboard" layout para "Lista de Contatos".

## UI - Ferramentas / IA Agent Configuration
- [ ] Criar a página `src/pages/N8nToolsPage.tsx`. Adicionar link no menu lateral "Ferramentas de IA".
- [ ] Exibir blocos de código copiáveis em formato JSON. Incluir textos explicando ao gestor onde colar isso na UI Custom Tool do N8N Agent.
- [ ] JSON Modelo 1: `Criar_Lead`
- [ ] JSON Modelo 2: `Ler_Lista_CRM`
- [ ] JSON Modelo 3: `Mudar_Status_CRM`

## Verificação e Build
- [ ] Rodar `npm run build` para testar integridade de TypeScripts do hook e telas novas.
- [ ] Apresentar plano e commitar ao Git.

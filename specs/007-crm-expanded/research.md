# Research Phase (RPI-R) - 007: CRM Expanded, Vendas & N8N Agent

## Entendimento do Estado Atual Mapeado
O projeto `painel-davicode` atualmente possui um pipeline Kanban e um sistema local de Finanças (receitas/despesas).
Atualmente, o Kanban (`src/pages/KanbanPage.tsx`) permite arrastar cards e mudar seus status na tabela `clientes_crm`. 
No entanto, quando um cliente é movido para as posições `FECHADO` ou `PERDIDO`, não estamos capturando nem documentando os motivos de insucesso de vendas (perdas) nem documentando as naturezas do contrato (ganhos - valor, duração, datas de vencimento).

A base de dados Supabase na tabela `clientes_crm` já possui atributos essenciais (ID, nome, email, telefone, plano, status), mas requer expansão de colunas específicas para vendas.

Além disso, não existe uma listagem detalhada de clientes/leads em tabela que fuja do visual do Kanban. Não existe um painel voltado unicamente para alimentar as Actions de IA do N8N pelo usuário.

## Concorrentes e Referências Visuais
1. **Pipedrive** / **RD Station CRM**: Ao marcar negócio como perdido na coluna, um modal de "Motivo da perda" surge impedindo que mova a etapa silenciosamente. O mesmo ocorre para fechamento ("Sale"), onde dados contratuais vitais devem ser logados imediatamente para prever fluxo de caixa.
2. **Make / N8N Config UIs**: Para a parte de "Ferramentas do N8N", painéis como o da plataforma Vercel e Stripe Dashboard costumam usar seções de desenvolvedores no formato Swagger/Playground, onde endpoints, schemas de json e CURLs aparecem de forma simples e "copiável" para injectar nos prompts do agente.

## Requisitos Levantados pelo Usuário
- "poder vender e marcar perda em uma negociação"
- "ter uma lista de leeds e clientes"
- "vencimentos tbm e tempo de contrato"
- "facilitar melhor as tools do agente de ia do n8n (indicar o que alterar/copiar o schema das tool elements)"

## O que precisamos mudar arquiteturalmente:
1. **Schema do Banco de Dados**:
   - `clientes_crm`: adicionar colunas `valor_contrato` (DECIMAL), `tempo_contrato_meses` (INTEGER), `data_vencimento` (TIMESTAMPTZ), e `motivo_perda` (TEXT).
2. **Componentes React**:
   - ModalIntercept (Gatilho quando o arrastador soltar no status FECHADO ou PERDIDO).
   - Nova Rota e Tela: `/clientes` para Tabela ou Listagem Clássica com paginação.
   - Nova Rota e Tela: `/n8n-tools` para disponibilizar JSON Schemas do assistente.
3. **Padrões 2026**:
   - Uso de Shadcn UI + Tailwind.
   - UX rica em transições na interrupção do arrastar soltar. Modal com Efeito "Liquid Glass".

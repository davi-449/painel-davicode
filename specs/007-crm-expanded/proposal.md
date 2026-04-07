# Proposal - 007: CRM Expanded, Vendas & N8N Agent

## Objetivos (Requirements)
1. **Tratamento de Negociação Final**: Impedir a movimentação de um lead livremente para "FECHADO" ou "PERDIDO" sem que haja o fornecimento do sumário do contrato (fechado) ou da justificativa (perdido).
2. **Nova View de Clientes e Leads (Listagem)**: Uma interface alternativa à visão macro do Kanban, apresentando Leads e Clientes em uma tabela contendo datas contratuais.
3. **Página de Recursos N8N**: Um painel contendo JSON schemas completos formatados explicitamente para o usuário injetar facilmente como Custom Tools na configuração do Agente de IA do N8N. As ferramentas exportadas devem dar poder à IA para criar clientes, ler funil, ou até manipular CRM.

## User Stories
- **US1**: Como vendedor, quando eu arrastar um lead para "Fechado", quero que o painel exija o "Valor do Contrato", "Tempo de Contrato (meses)" e "Data de Vencimento" para que minha venda seja contabilizada no CRM Corretamente.
- **US2**: Como vendedor, quando eu arrastar um lead para "Perdido", quero informar opcionalmente (ou obrigatoriamente) o motivo da perda, para análises futuras.
- **US3**: Como gerente, quero clicar em um menu "Lista de Leads" e não ver cartas de Kanban, mas sim uma tabela listando facilmente todos meus potenciais ou clientes consolidados e suas datas.
- **US4**: Como gestor de automações (construtor n8n), quero visualizar uma tela dentro do aplicativo chamada "Ferramentas do Agente de IA", que liste os blocos JSON de input/output das regras do meu sistema, de modo que eu possa apenas "copiar/colar" pra treinar minha IA a executar as mesmas funções daqui da UI.

## BDD Scenarios

### Cenário: Marcação de lead como Fechado (Ganhando Venda)
- **Given (Dado):** Um lead está na coluna "Proposta Enviada" no Kanban.
- **When (Quando):** O usuário arrasta o lead do drag-n-drop para a coluna "Fechado".
- **Then (Então):** A tela intercepta o Kanban exibindo um Modal bloqueante de "Sucesso! Dados da Venda", onde o card somente será validado após enviar as infos obrigatórias de valor, meses e vencimento.

### Cenário: Marcação de lead como Perdido
- **Given (Dado):** Um lead está na coluna "Proposta Enviada" ou qualquer outra.
- **When (Quando):** O usuário arrasta o lead para a coluna "Perdido".
- **Then (Então):** A tela intercepta requisitando um input com o "Motivo da perda". Após salvar, a atualização é feita no Supabase.

### Cenário: Acessando Ferramentas N8N (Config AI Agent)
- **Given (Dado):** O usuário abre a dashboard do sistema e clica no menu "Agente IA".
- **When (Quando):** Acessa a rota `/config-agente-ia`.
- **Then (Então):** Ele encontra abas com as ferramentas prontas (Tool Schemas), ex: `create_lead_tool.json` explicitada para ele copiar, com suas respectivas chaves em markdown/code blocks.

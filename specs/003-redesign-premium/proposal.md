# Proposal — 003: Redesign Premium do Painel DaviCode

## Contexto
O Painel DaviCode é um sistema interno de CRM + gestão para o negócio DaviCode. Atualmente funciona mas sofre de três problemas críticos:
1. **Lentidão no carregamento** (cold start do Render + sem cache + skeleton screens ausentes)
2. **Design IA/genérico** — parece um tutorial de YouTube, não uma ferramenta de trabalho profissional
3. **Ausência de páginas essenciais** — sem timeline de atividades, sem finanças, sem detalhe de cliente completo

O objetivo desta spec é transformar o painel em uma ferramenta com estética de produto SaaS premium nível Linear/ElevenLabs, mantendo toda a funcionalidade atual e adicionando experiências que aumentem produtividade.

---

## Requisitos

### Funcionais
- RF01: Dashboard com KPIs, gráficos de funil e feed de atividades recentes — com skeleton loading
- RF02: Kanban CRM drag-and-drop com 6 etapas — visual mais rico, cards com mais informação
- RF03: Painel lateral de detalhe do cliente (drawer) com: infos, timeline de atividades, ações rápidas (WhatsApp, n8n dispatch, editar status)
- RF04: Formulário de cadastro de novo cliente com UX fluida (steps ou campos dinâmicos)
- RF05: Página de Finanças — visualizar ganhos/gastos com períodos, gráficos de linha e balanço mensal
- RF06: Pesquisa global de clientes (cmd+K / barra superior)
- RF07: Toast notifications para todas as ações (substituir alert())
- RF08: Sidebar com avatar do usuário logado e badge de notificações
- RF09: Tema dark como padrão com surface Liquid Glass em sidebar e modais
- RF10: Performance — skeleton screens em todos os fetches, sem flash de conteúdo

### Não-Funcionais
- RNF01: Lighthouse Performance > 85 na entrada principal
- RNF02: WCAG 2.2 AA — contraste mínimo 4.5:1, foco visível em todos interativos
- RNF03: Layout responsivo (desktop prioritário, mas funcional em tablet)
- RNF04: Commits semânticos durante implementação

---

## User Stories

### US01 — Dashboard Inteligente
> Como admin, quero ver os KPIs principais sendo carregados com skeleton suave, para não ter a sensação de "tela em branco" enquanto os dados chegam.

### US02 — Kanban Premium
> Como admin, quero arrastar clientes entre colunas com animação fluida e ver seus dados principais no card (nome, telefone, plano, origem), para gerir o funil rapidamente.

### US03 — Detalhe Completo do Cliente
> Como admin, quero clicar em um cliente e ver um drawer lateral com timeline completa de atividades, dados de pagamento e ações rápidas, para não precisar abrir outra aba.

### US04 — Pesquisa Global
> Como admin, quero pressionar Ctrl+K e buscar qualquer cliente por nome ou telefone, para acessar qualquer registro em menos de 3 segundos.

### US05 — Finanças Pessoais
> Como admin, quero ver meus ganhos e gastos do mês atual com um gráfico de linha comparativo, para entender rapidamente minha saúde financeira.

### US06 — Toast em vez de Alert
> Como admin, quero receber notificações visuais elegantes (toast) ao invés de popups do browser, para uma experiência mais profissional.

---

## Critérios de Aceite

- CA01: Skeleton screens aparecem em < 100ms após navegação para qualquer página
- CA02: KPIs do Dashboard carregam sem reload após primeira visita (cache local)
- CA03: Kanban suporta drag-and-drop e atualiza status em background (optimistic update já existe)
- CA04: Drawer do cliente mostra timeline cronológica de atividades
- CA05: Cmd+K abre busca global funcional com debounce de 300ms
- CA06: Toast aparece por 4 segundos e fecha com X
- CA07: Todas as fontes carregadas com `font-display: swap`
- CA08: Nenhum `alert()` ou `confirm()` nativo no código

---

## BDD Scenarios

### Cenário: Dashboard carrega com skeleton
- **Given:** Admin acessa `/` após login
- **When:** Os dados da API ainda não retornaram (< 800ms)
- **Then:** 4 cards KPI mostram skeleton animado, gráficos mostram placeholder cinza, sem Flash of Unstyled Content

### Cenário: Mover cliente no Kanban
- **Given:** Admin está na página `/kanban` com clientes carregados
- **When:** Arrasta o cartão "João Silva" da coluna "Novo" para "Em Atendimento"
- **Then:** O card se move com animação suave, a badge de contagem atualiza em ambas as colunas imediatamente, e um toast "Status atualizado" aparece no canto superior direito

### Cenário: Ver detalhe do cliente
- **Given:** Admin vê o card "Maria Costa" no Kanban
- **When:** Clica no ícone de olho ou no próprio card
- **Then:** Drawer desliza da direita em 300ms, mostrando dados, timeline de atividades em ordem cronológica e botões de ação (WhatsApp, Disparar n8n, Editar)

### Cenário: Pesquisa Global
- **Given:** Admin está em qualquer página do painel
- **When:** Pressiona Ctrl+K e digita "Maria" no campo
- **Then:** Resultados filtrados aparecem em < 300ms com nome, telefone e status do funil de cada match

### Cenário: Disparo n8n com Toast
- **Given:** Admin está com o drawer do cliente aberto
- **When:** Clica em "Disparar n8n"
- **Then:** Botão mostra spinner por 1-2s, depois um toast verde "Disparo enviado com sucesso!" aparece (sem alert nativo)

### Cenário: Página de Finanças
- **Given:** Admin navega para `/financas`
- **When:** A página carrega
- **Then:** Vê o balanço do mês atual (ganhos - gastos), gráfico de linha dos últimos 6 meses e lista de lançamentos recentes

---

## Fora de Escopo (F2)
- PWA / modo offline
- Notificações push
- Multi-tenant (múltiplos usuários com permissões diferentes)
- Integração com Asaas API direta no frontend
- TanStack Query / SWR (pode ser adicionado depois)

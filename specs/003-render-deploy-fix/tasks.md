# Spec 003: Render Deploy Fix — Tasks

### Fase 0 — Planejamento
- [x] Clonar `painel-davicode`
- [x] Ler `/backend/package.json`
- [x] Escrever `proposal.md`
- [x] Escrever `design.md`
- [x] Escrever `tasks.md`

### Fase 1 — Opção Selecionada pelo Usuário
- [ ] Aguardar instrução (Opção 1: Terminal Render vs Opção 2: Package.json Move)

### Fase 2 — Execução da Opção 2 (Código)
*(Se aprovado)*
- [x] Ler e parsear `backend/package.json` atual
- [x] Mover dependências `@types/*` para `dependencies`
- [x] Realizar git commit na origin
- [x] Realizar git push
- [ ] O Usuário valida no acompanhamento do Deploy no Render (Render Dashboard)

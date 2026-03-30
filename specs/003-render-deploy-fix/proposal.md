# Spec 003: Render Deploy Fix — Proposal

## Objetivo
Resolver os erros de compilação do TypeScript (vários `error TS7016: Could not find a declaration file for module '*'` e `error TS2580: Cannot find name 'process'`) que impedem o backend do `painel-davicode` de ser compilado e rodar corretamente na plataforma de hospedagem Render.

## Diagnóstico
O ambiente Node.js do Render aplica por padrão a variável de ambiente `NODE_ENV=production`. Isso otimiza o deploy fazendo com que o comando `npm install` instale **apenas os pacotes listados em** `dependencies`. Todos os pacotes listados em `devDependencies` são ignorados.

No arquivo `backend/package.json`, as definições de tipo cruciais para a compilação (`@types/express`, `@types/node`, `@types/jsonwebtoken`, etc.) estão localizadas nas `devDependencies`. Sendo assim, o pacote `typescript` as não encontra na hora de compilar, gerando a falha "Build failed".

## Soluções Propostas

Existem duas formas (ambas muito simples) de resolver de forma estrutural sem efeitos colaterais. O usuário deverá escolher a preferida.

### Opção 1 (Via Configuração do Render - O Menos Invasivo)
Modifique o comando de build no dashboard do Render para forçar a instalação temporária dos tipos de desenvolvimento. No Render Dashboard -> Settings -> **Build Command**, mude de:
`npm install && npm run build`
Para:
`npm install --include=dev && npm run build`

### Opção 2 (Via Código - O Mais Autônomo)
No `backend/package.json`, mover as dependências tipadas pertinentes de `devDependencies` para `dependencies`. Desta forma o Render irá baixá-las em produção, compilando sem erros e iniciando a build.
Na Fase 2, farei a transferência os pacotes `@types/` para a outra diretiva dentro de `package.json`.

## Requisitos Retidos
Nenhum código, rotas ou tabelas de banco de dados (`Prisma`/Supabase) precisarão ser tocados para esta manutenção de esteira CI/CD.

Aguardando aprovação via `/vibe-apply` e orientação de qual Opção de solução devo orquestrar. Se Option 1, passarei as instruções completas. Se Option 2, modifico os arquivos pelo terminal e faço o Push.

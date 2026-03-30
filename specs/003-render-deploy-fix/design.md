# Spec 003: Render Deploy Fix — Design

## Estratégia de Build Backend no Render
Como o projeto `painel-davicode` utiliza TypeScript (`tsc`) no comando de `build` definido no `backend/package.json` (`"build": "prisma generate && tsc"`), a presença de arquivos de tipagem (`@types/*`) é estritamente obrigatória em tempo de build.

No entanto, por padrão as plataformas de PaaS como Render e Heroku setam `NODE_ENV=production` e filtram pacotes listados sob `"devDependencies"`. Isso remove pacotes essenciais como `@types/node` e `@types/express` que estão alocados incorretamente em `devDependencies` se a esteira de build acontece no servidor de destino.

### Modificações Necessárias (Opção 2 - Código)

Neste fluxo, eu utilizarei um script ou ferramenta de busca para mover os pacotes `@types/` do block de devDependencies para dependencies no arquivo **`backend/package.json`**.
Abaixo os pacotes afetados:
- `@types/bcrypt`
- `@types/cors`
- `@types/express`
- `@types/jsonwebtoken`
- `@types/node`

*(Se houver outros introduzidos depois, também sofrerão o move).*

O restante do código e dependências diretas permanecerão intocados para não alterar o funcionamento atual do backend.

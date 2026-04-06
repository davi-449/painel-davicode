# Vibe-Proposal: High-End Backend Refactoring (Express + Prisma)

## O Objetivo (Make it "Tinindo")
Elevar o nível do backend atual para um padrão empresarial de alta robustez, legibilidade e segurança. O objetivo é sair de "scripts que funcionam" para uma "API resiliente, previsível e estritamente tipada" que não quebra no primeiro caso limite.

---

## 1. Arquitetura em Camadas (Layered Architecture)
Para evitar "Fat Controllers" (código de negócios misturado com requisição HTTP), adotaremos:
- **Routes**: Apenas definem os endpoints, as chamadas de middlewares e repassam a requisição.
- **Controllers**: Lidam apenas com as respostas HTTP (`req, res`), pegam os parâmetros, invocam o Service apropriado e disparam a resposta serializada.
- **Services (NOVO)**: Toda a regra de negócio central entra aqui (cálculos de dashboard, transações do Prisma para gerar clientes do CRM com suas etapas). Se o Service precisa acessar o banco, pode fazê-lo diretamente via PrismaClient central.
- **Validators (NOVO)**: Validação unificada com **Zod**.

## 2. Validação de Dados End-to-End (Zod)
Nunca confie nos payloads do frontend. Adicionaremos validação rigorosa de schemas em **todas** as rotas de entrada de mutação (POST, PUT, PATCH, queries complexas) usando Zod.
- Usar um `validate(schema)` Middleware para inspecionar `req.body`, `req.params` e `req.query` rigorosamente antes de bater na action do Controller.

## 3. Tracer & Error Handling Unificado
Atualmente o Express pode falhar de forma catastrófica ("Unhandled Promise Rejections") se um throw escapar do async sem catch.
- **`AppError` Class**: Classe base customizada que estende *Error* adicionando *statusCode* e *isOperational*. Ideal para jogar mensagens tipo `throw new AppError('Lead não encontrado', 404)`.
- **`catchAsync` Wrapper (NOVO)**: Envelopar (wrap) todos os controllers, eliminando a poluição de `try/catch` manual em cada função. Exceções caem limpas no handler unificado.
- **Global Error Middleware Melhorado**: Interceptador final. Se o erro for instância de `AppError`, reenvia o código 4xx adequado com a mensagem correta. Se for de Banco (ex: Chave Duplicada no Prisma), traduz pra uma string útil antes de estourar internal error.

## 4. Padronização Absoluta de Respostas JSON
As APIs retornam em estruturas variadas que custam previsibilidade ao Frontend. O Backend deve usar JSend Specification unificado:
```json
// Sucesso
{ "status": "success", "data": { "cliente": {...} } }

// Falha de Cliente (400, 404, 401)
{ "status": "error", "message": "Telefone já existe no CRM" }
```

## 5. Security & Infra 
- **Helmet**: Implementação para adicionar headers HTTP blindados e protetivos (HSTS, NoSniff).
- **Express Rate Limiter**: Configurações finas por conjunto de rota (ex: `authLimiter` para bruteforce de login).

---

### Instruções Diretas para a IA / Executor da Refatoração:
**<Contexto & Personagem>**: "Aja como um Engenheiro e Arquiteto Node.js Backend de nível Principal. Refatore completamente a pasta `backend/` seguindo sem questionar a arquitetura deste Vibe-Proposal. Garanta extrema compatibilidade de rotas e mapeamento com o frontend Web que consome a API."

**<Checklist Técnico>**:
1. Faça o bootstrap inicial com as bibliotecas corporativas: `npm install zod helmet express-async-errors express-rate-limit` (e os `@types/` necessários).
2. Na raiz de `src/`, monte:
   - `utils/AppError.ts`, `utils/catchAsync.ts`.
   - `middlewares/errorMiddleware.ts`, `middlewares/validateMiddleware.ts`.
   - `services/`, `validators/`.
3. Para cada Controller na pasta *controllers*, disseque-o. Movimente as lógicas volumosas de contagem, verificação ou formatação que interagem pesadamente com o Prisma para o seu devido *Service*. (ex: `ClienteService.ts`).
4. Proteja todas as rotas de mutação (*POST*, *PUT*) usando o respectivo arquivo de Zod schema criado (ex: `clienteSchema.ts`).
5. Substitua blocos repetitivos `try/catch(err)` no controller pelo wrapper `catchAsync`.
6. Envolva as falhas propositais com os erros `new AppError()` correspondentes (ex. User não logado -> 401).
7. Execute testes com o TSC: O Typescript do seu backend precisa *buildar* 100% livre de erros antes da entrega final.`

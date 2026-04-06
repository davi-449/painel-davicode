import { z, TypeOf } from 'zod';

export const loginSchema = z.object({
  body: z.object({
    email: z.string().min(1, 'E-mail é obrigatório').email('E-mail inválido'),
    senha: z.string().min(1, 'Senha é obrigatória'),
  }),
});

export type LoginInput = TypeOf<typeof loginSchema>['body'];

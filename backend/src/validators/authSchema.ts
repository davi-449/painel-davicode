import { z, TypeOf } from 'zod';

export const loginSchema = z.object({
  body: z.object({
    email: z.string().nonempty('E-mail é obrigatório').email({ message: 'E-mail inválido' }),
    senha: z.string().nonempty('Senha é obrigatória').min(6, { message: 'Senha deve ter no mínimo 6 caracteres' }),
  }),
});

export type LoginInput = TypeOf<typeof loginSchema>['body'];

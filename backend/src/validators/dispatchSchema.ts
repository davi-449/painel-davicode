import { z } from 'zod';

export const dispatchSchema = z.object({
  body: z.object({
    cliente_id: z.string().nonempty('ID do cliente é obrigatório').uuid({ message: 'ID de cliente inválido' }),
  }),
});

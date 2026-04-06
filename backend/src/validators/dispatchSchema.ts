import { z } from 'zod';

export const dispatchSchema = z.object({
  body: z.object({
    cliente_id: z.string().uuid('ID de cliente inválido'),
  }),
});

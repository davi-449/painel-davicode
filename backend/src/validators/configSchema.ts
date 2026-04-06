import { z } from 'zod';

export const updateConfigSchema = z.object({
  body: z.object({
    chave: z.string().nonempty('Chave é obrigatória'),
    valor: z.string().nonempty('Valor é obrigatório'),
  }),
});

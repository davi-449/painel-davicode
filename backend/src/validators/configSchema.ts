import { z } from 'zod';

export const updateConfigSchema = z.object({
  body: z.object({
    chave: z.string().min(1, 'Chave é obrigatória'),
    valor: z.string().min(1, 'Valor é obrigatório'),
  }),
});

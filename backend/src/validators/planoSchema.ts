import { z } from 'zod';

export const createPlanoSchema = z.object({
  body: z.object({
    nome: z.string().min(1, 'Nome do plano é obrigatório'),
    valor_mensal: z.number().positive('O valor mensal deve ser um número positivo'),
  }),
});

export const updatePlanoSchema = z.object({
  body: createPlanoSchema.shape.body.partial(),
  params: z.object({
    id: z.string().uuid('ID de plano inválido'),
  }),
});

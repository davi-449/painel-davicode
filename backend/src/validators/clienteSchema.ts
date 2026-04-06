import { z } from 'zod';

export const createClienteSchema = z.object({
  body: z.object({
    nome: z.string().min(3, 'Nome precisa ter no mínimo 3 caracteres'),
    email: z.string().email('E-mail inválido').optional().or(z.literal('')),
    telefone: z.string().min(1, 'Telefone é obrigatório'),
    plano_id: z.string().uuid('ID do plano inválido').optional().nullable(),
    status_funil: z.enum([
      'NOVO',
      'EM_ATENDIMENTO',
      'FOLLOW_UP',
      'PROPOSTA',
      'FECHADO',
      'PERDIDO'
    ]).optional(),
  }),
});

export const updateClienteSchema = z.object({
  body: createClienteSchema.shape.body.partial(),
  params: z.object({
    id: z.string().uuid('ID de cliente inválido'),
  }),
});

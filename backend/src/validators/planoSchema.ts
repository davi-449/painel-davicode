import { z } from 'zod';

export const createPlanoSchema = z.object({
  body: z.object({
    nome: z.string().nonempty('Nome do plano é obrigatório'),
    // Corrigido: z.number() não aceita 'invalid_type_error' diretamente no construtor.
    // A validação de tipo é implícita. A mensagem de erro para o validador .positive() é ajustada.
    valor_mensal: z.number().positive({ message: "O valor mensal deve ser um número positivo" }),
  }),
});

export const updatePlanoSchema = z.object({
  body: createPlanoSchema.shape.body.partial(),
  params: z.object({
    id: z.string().uuid({ message: 'ID de plano inválido' }),
  }),
});

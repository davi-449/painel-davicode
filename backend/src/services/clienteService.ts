import { prisma } from '../prismaClient';
import { Prisma } from '@prisma/client';

export const ClienteService = {
  search: async (query: string) => {
    if (!query || query.length < 2) {
      return [];
    }
    return prisma.clientes_crm.findMany({
      where: {
        OR: [
          { nome: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
          { telefone: { contains: query } },
        ],
      },
      include: { planos: true },
      take: 10,
    });
  },

  getAtividades: async (clienteId: string) => {
    return prisma.atividades.findMany({
      where: { cliente_id: clienteId },
      orderBy: { created_at: 'desc' },
    });
  },

  getAll: async () => {
    return prisma.clientes_crm.findMany({
      include: { planos: true },
      orderBy: { updated_at: 'desc' },
    });
  },

  getById: async (id: string) => {
    return prisma.clientes_crm.findUnique({
      where: { id },
      include: {
        planos: true,
        atividades: { orderBy: { created_at: 'desc' } },
      },
    });
  },

  create: async (body: any) => {
    const { plano_id, ...rest } = body;

    const data: Prisma.clientes_crmCreateInput = {
      ...rest,
      status_funil: body.status_funil || 'NOVO',
    };

    if (plano_id) {
      data.planos = { connect: { id: plano_id } };
    }

    const novoCliente = await prisma.clientes_crm.create({ data });

    await prisma.atividades.create({
      data: {
        cliente_id: novoCliente.id,
        tipo: 'CRIACAO',
        descricao: 'Lead criado no painel CRM',
      },
    });

    return novoCliente;
  },

  update: async (id: string, body: any, originalCliente: any) => {
    const { plano_id, ...rest } = body;

    const data: Prisma.clientes_crmUpdateInput = {
      ...rest,
      updated_at: new Date(),
    };

    if (plano_id) {
      data.planos = { connect: { id: plano_id } };
    } else if (plano_id === null || plano_id === '') {
      if (originalCliente.plano_id) {
        data.planos = { disconnect: true };
      }
    }
    // Se plano_id for undefined, a relação não é alterada

    const updated = await prisma.clientes_crm.update({
      where: { id },
      data,
    });

    if (body.status_funil && body.status_funil !== originalCliente.status_funil) {
      await prisma.atividades.create({
        data: {
          cliente_id: id,
          tipo: 'MUDANCA_FASE',
          descricao: `Movido de ${originalCliente.status_funil || 'S/A'} para ${body.status_funil}`,
        },
      });
    }

    return updated;
  },
};

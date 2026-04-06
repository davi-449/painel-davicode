import { Request, Response, NextFunction } from 'express';
import { prisma } from '../prismaClient';

export const ClienteController = {
  async search(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const q = req.query.q as string;
      if (!q || q.length < 2) {
        res.json([]);
        return;
      }
      const clientes = await prisma.clientes_crm.findMany({
        where: {
          OR: [
            { nome: { contains: q, mode: 'insensitive' } },
            { email: { contains: q, mode: 'insensitive' } },
            { telefone: { contains: q } }
          ]
        },
        include: { planos: true },
        take: 10
      });
      res.json(clientes);
    } catch (error) {
      next(error);
    }
  },

  async getAtividades(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { id } = req.params;
    try {
      const atividades = await prisma.atividades.findMany({
        where: { cliente_id: id },
        orderBy: { created_at: 'desc' }
      });
      res.json(atividades);
    } catch (error) {
      next(error);
    }
  },

  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const clientes = await prisma.clientes_crm.findMany({
        include: { planos: true },
        orderBy: { updated_at: 'desc' }
      });
      res.json(clientes);
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { id } = req.params;
    try {
      const cliente = await prisma.clientes_crm.findUnique({
        where: { id },
        include: {
          planos: true,
          atividades: { orderBy: { created_at: 'desc' } }
        }
      });
      if(!cliente) {
         res.status(404).json({error: 'Cliente nao encontrado'});
         return;
      }
      res.json(cliente);
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = req.body;
      if (!data.status_funil) data.status_funil = 'NOVO';
      // Sanitize optional UUID fields — empty string is not a valid UUID
      if (!data.plano_id) data.plano_id = null;
      data.updated_at = new Date();
      data.created_at = new Date();
      
      const novoCliente = await prisma.clientes_crm.create({ data });
      
      await prisma.atividades.create({
        data: {
          cliente_id: novoCliente.id,
          tipo: 'CRIACAO',
          descricao: 'Lead criado no painel CRM',
        }
      });

      res.status(201).json(novoCliente);
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { id } = req.params;
    const updateData = req.body;
    updateData.updated_at = new Date();
    // Sanitize optional UUID fields
    if (updateData.plano_id === '') updateData.plano_id = null;
    
    try {
      const p = await prisma.clientes_crm.findUnique({where: {id}});
      if(!p) {
        res.status(404).json({error: 'Cliente não encontrado'});
        return;
      }
      
      const updated = await prisma.clientes_crm.update({
        where: { id },
        data: updateData
      });

      if (updateData.status_funil && updateData.status_funil !== p.status_funil) {
        await prisma.atividades.create({
          data: {
            cliente_id: id,
            tipo: 'MUDANCA_FASE',
            descricao: `Movido de ${p.status_funil || 'S/A'} para ${updateData.status_funil}`
          }
        });
      }

      res.json(updated);
    } catch (error) {
      next(error);
    }
  }
};

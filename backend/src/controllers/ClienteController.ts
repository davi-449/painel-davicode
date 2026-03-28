import { Request, Response } from 'express';
import { prisma } from '../prismaClient';

export const ClienteController = {
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const clientes = await prisma.clientes_crm.findMany({
        include: { planos: true },
        orderBy: { updated_at: 'desc' }
      });
      res.json(clientes);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro ao buscar clientes' });
    }
  },

  async getById(req: Request, res: Response): Promise<void> {
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
      console.error(error);
      res.status(500).json({ error: 'Erro ao buscar cliente' });
    }
  },

  async create(req: Request, res: Response): Promise<void> {
    try {
      const data = req.body;
      if (!data.status_funil) data.status_funil = 'NOVO';
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
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: 'Erro ao criar cliente' });
    }
  },

  async update(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const updateData = req.body;
    updateData.updated_at = new Date();
    
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
      console.error(error);
      res.status(500).json({ error: 'Erro ao atualizar cliente' });
    }
  }
};

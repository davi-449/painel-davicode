import { Request, Response, NextFunction } from 'express';
import { prisma } from '../prismaClient';

export const ClienteController = {
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
      const body = req.body;
      // Map frontend field name 'observacoes' to schema field 'resumo_lead'
      const data: any = {
        nome: body.nome,
        telefone: body.telefone,
        email: body.email || null,
        status_funil: body.status_funil || 'NOVO',
        plano_id: body.plano_id || null,
        origem: body.origem || 'MANUAL',
        resumo_lead: body.resumo_lead || body.observacoes || null,
        created_at: new Date(),
        updated_at: new Date(),
      };

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
    const body = req.body;

    // Whitelist to prevent Prisma errors from unknown fields
    const updateData: any = { updated_at: new Date() };
    const allowed = ['nome','email','telefone','status_funil','plano_id','origem','resumo_lead','proximo_followup','link_asaas','link_site','status_pagamento'];
    for (const key of allowed) {
      if (key in body) updateData[key] = body[key];
    }
    if ('plano_id' in updateData && !updateData.plano_id) updateData.plano_id = null;
    
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
  },

  async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { id } = req.params;
    try {
      const existing = await prisma.clientes_crm.findUnique({ where: { id } });
      if (!existing) {
        res.status(404).json({ error: 'Cliente não encontrado' });
        return;
      }
      await prisma.clientes_crm.delete({ where: { id } });
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },

  async addAtividade(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { id } = req.params;
    const { tipo, descricao } = req.body;
    try {
      const atividade = await prisma.atividades.create({
        data: { cliente_id: id, tipo: tipo || 'NOTA', descricao }
      });
      res.status(201).json(atividade);
    } catch (error) {
      next(error);
    }
  }
};

import { Request, Response, NextFunction } from 'express';
import { prisma } from '../prismaClient';

export const PlanoController = {
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const planos = await prisma.planos.findMany({
        orderBy: { created_at: 'desc' }
      });
      res.json(planos);
    } catch (error) {
      next(error);
    }
  },
  
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = req.body;
      // Coerce valor_mensal to number to avoid Decimal parse errors
      if (data.valor_mensal !== undefined) {
        data.valor_mensal = parseFloat(data.valor_mensal);
      }
      const plano = await prisma.planos.create({ data });
      res.status(201).json(plano);
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { id } = req.params;
    try {
      const data = req.body;
      if (data.valor_mensal !== undefined) {
        data.valor_mensal = parseFloat(data.valor_mensal);
      }
      const plano = await prisma.planos.update({
        where: { id },
        data
      });
      res.json(plano);
    } catch (error) {
      next(error);
    }
  },

  async toggleActive(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { id } = req.params;
    try {
      const plano = await prisma.planos.findUnique({ where: { id }});
      if (!plano) {
        res.status(404).json({ error: 'Plano nao encontrado' });
        return;
      }
      
      const updated = await prisma.planos.update({
        where: { id },
        data: { ativo: !plano.ativo }
      });
      res.json(updated);
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { id } = req.params;
    try {
      await prisma.planos.delete({ where: { id } });
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
};

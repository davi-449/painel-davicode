import { Request, Response } from 'express';
import { prisma } from '../prismaClient';

export const PlanoController = {
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const planos = await prisma.planos.findMany({
        orderBy: { created_at: 'desc' }
      });
      res.json(planos);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar planos' });
    }
  },
  
  async create(req: Request, res: Response): Promise<void> {
    try {
      const plano = await prisma.planos.create({ data: req.body });
      res.status(201).json(plano);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao criar plano' });
    }
  },

  async update(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    try {
      const plano = await prisma.planos.update({
        where: { id },
        data: req.body
      });
      res.json(plano);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao atualizar plano' });
    }
  },

  async toggleActive(req: Request, res: Response): Promise<void> {
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
      res.status(500).json({ error: 'Erro ao alterar status do plano' });
    }
  },

  async delete(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    try {
      await prisma.planos.delete({ where: { id } });
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Erro ao excluir plano' });
    }
  }
};

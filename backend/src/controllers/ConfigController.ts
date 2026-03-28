import { Request, Response, NextFunction } from 'express';
import { prisma } from '../prismaClient';

export const ConfigController = {
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const configs = await prisma.configuracoes.findMany();
      const obj: Record<string, string> = {};
      configs.forEach((c: any) => obj[c.chave] = c.valor);
      res.json(obj);
    } catch (error) {
      next(error);
    }
  },
  
  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { chave, valor } = req.body;
    if (!chave || valor === undefined) {
      res.status(400).json({ error: 'Chave e valor sao obrigatorios' });
      return;
    }
    try {
      const config = await prisma.configuracoes.upsert({
        where: { chave },
        update: { valor, updated_at: new Date() },
        create: { chave, valor },
      });
      res.json(config);
    } catch (error) {
      next(error);
    }
  }
};

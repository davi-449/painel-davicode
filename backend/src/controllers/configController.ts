import { Request, Response, NextFunction } from 'express';
import { prisma } from '../prismaClient';
import catchAsync from '../utils/catchAsync';

// Não precisa de Service, lógica muito simples
export const ConfigController = {
  getAll: catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const configs = await prisma.configuracoes.findMany();
    const obj: Record<string, string> = {};
    configs.forEach((c: any) => obj[c.chave] = c.valor);
    res.status(200).json({ status: 'success', data: { configs: obj } });
  }),

  update: catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { chave, valor } = req.body;
    const config = await prisma.configuracoes.upsert({
      where: { chave },
      update: { valor, updated_at: new Date() },
      create: { chave, valor },
    });
    res.status(200).json({ status: 'success', data: { config } });
  })
};

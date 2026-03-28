import { Request, Response } from 'express';
import { prisma } from '../prismaClient';

export const ConfigController = {
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const configs = await prisma.configuracoes.findMany();
      const obj: Record<string, string> = {};
      configs.forEach((c: any) => obj[c.chave] = c.valor);
      res.json(obj);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar configuracoes' });
    }
  },
  
  async update(req: Request, res: Response): Promise<void> {
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
      res.status(500).json({ error: 'Erro ao atualizar configuracao' });
    }
  }
};

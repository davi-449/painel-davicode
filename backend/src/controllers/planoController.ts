import { Request, Response, NextFunction } from 'express';
import { prisma } from '../prismaClient';
import catchAsync from '../utils/catchAsync';
import AppError from '../utils/AppError';

// Não precisa de Service, lógica de CRUD simples
export const PlanoController = {
  getAll: catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const planos = await prisma.planos.findMany({ orderBy: { created_at: 'desc' } });
    res.status(200).json({ status: 'success', data: { planos } });
  }),

  create: catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const data = req.body;
    if (data.valor_mensal !== undefined) {
      data.valor_mensal = parseFloat(data.valor_mensal);
    }
    const plano = await prisma.planos.create({ data });
    res.status(201).json({ status: 'success', data: { plano } });
  }),

  update: catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const data = req.body;
    if (data.valor_mensal !== undefined) {
      data.valor_mensal = parseFloat(data.valor_mensal);
    }
    const plano = await prisma.planos.update({ where: { id }, data });
    res.status(200).json({ status: 'success', data: { plano } });
  }),

  toggleActive: catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const plano = await prisma.planos.findUnique({ where: { id } });
    if (!plano) {
      return next(new AppError('Plano não encontrado', 404));
    }
    const updated = await prisma.planos.update({ where: { id }, data: { ativo: !plano.ativo } });
    res.status(200).json({ status: 'success', data: { plano: updated } });
  }),

  delete: catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    await prisma.planos.delete({ where: { id } });
    res.status(204).json({ status: 'success', data: null });
  })
};

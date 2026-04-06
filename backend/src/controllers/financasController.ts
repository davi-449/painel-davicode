import { Request, Response, NextFunction } from 'express';
import { FinancasService } from '../services/financasService';
import catchAsync from '../utils/catchAsync';

export const FinancasController = {
  getResumo: catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const resumo = await FinancasService.getResumo();
    res.status(200).json({ status: 'success', data: { resumo } });
  }),
};

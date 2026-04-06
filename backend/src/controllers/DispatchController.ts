import { Request, Response, NextFunction } from 'express';
import { DispatchService } from '../services/dispatchService';
import catchAsync from '../utils/catchAsync';

export const DispatchController = {
  dispatchN8N: catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { cliente_id } = req.body;
    const result = await DispatchService.dispatchN8N(cliente_id);
    res.status(200).json({ status: 'success', data: result });
  })
};

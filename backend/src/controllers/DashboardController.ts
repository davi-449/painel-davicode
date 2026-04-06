import { Request, Response, NextFunction } from 'express';
import { DashboardService } from '../services/dashboardService';
import catchAsync from '../utils/catchAsync';

export const DashboardController = {
  getMetrics: catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const metrics = await DashboardService.getMetrics();
    res.status(200).json({
      status: 'success',
      data: {
        metrics,
      },
    });
  }),
};

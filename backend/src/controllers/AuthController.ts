import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService';
import catchAsync from '../utils/catchAsync';
import { LoginInput } from '../validators/authSchema';

export const AuthController = {
  login: catchAsync(async (req: Request<{}, {}, LoginInput>, res: Response, next: NextFunction) => {
    const result = await AuthService.login(req.body);
    res.status(200).json({
      status: 'success',
      data: result,
    });
  }),
};

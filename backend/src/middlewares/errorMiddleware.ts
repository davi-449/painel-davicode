import { Request, Response, NextFunction } from 'express';
import AppError from '../utils/AppError';

const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }

  // Erros de programação ou desconhecidos: não vazar detalhes
  console.error('ERROR 💥', err);

  return res.status(500).json({
    status: 'error',
    message: 'Algo deu muito errado!',
  });
};

export default errorHandler;

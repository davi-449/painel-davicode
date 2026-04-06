import { Request, Response, NextFunction } from 'express';
import { ZodObject } from 'zod';
import AppError from '../utils/AppError';

const validate = (schema: ZodObject<any>) => (req: Request, res: Response, next: NextFunction) => {
  try {
    schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    next();
  } catch (err: any) {
    const messages = err.errors.map((error: any) => error.message);
    next(new AppError(`Erro de validação: ${messages.join(', ')}`, 400));
  }
};

export default validate;

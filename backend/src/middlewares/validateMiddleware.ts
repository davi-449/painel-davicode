import { Request, Response, NextFunction } from 'express';
import { ZodType } from 'zod';
import AppError from '../utils/AppError';

const validate = (schema: ZodType<any>) => (req: Request, res: Response, next: NextFunction) => {
  const result = schema.safeParse({
    body: req.body,
    query: req.query,
    params: req.params,
  });

  if (!result.success) {
    const messages = result.error.issues.map((e: { message: string }) => e.message);
    return next(new AppError(`Erro de validação: ${messages.join(', ')}`, 400));
  }

  next();
};

export default validate;

import { Request, Response, NextFunction } from 'express';
import { ClienteService } from '../services/clienteService';
import catchAsync from '../utils/catchAsync';
import AppError from '../utils/AppError';

export const ClienteController = {
  search: catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query.q as string;
    const clientes = await ClienteService.search(query);
    res.status(200).json({
      status: 'success',
      data: {
        clientes,
      },
    });
  }),

  getAtividades: catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const atividades = await ClienteService.getAtividades(id);
    res.status(200).json({
      status: 'success',
      data: {
        atividades,
      },
    });
  }),

  getAll: catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const clientes = await ClienteService.getAll();
    res.status(200).json({
      status: 'success',
      data: {
        clientes,
      },
    });
  }),

  getById: catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const cliente = await ClienteService.getById(id);

    if (!cliente) {
      return next(new AppError('Cliente não encontrado', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        cliente,
      },
    });
  }),

  create: catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const novoCliente = await ClienteService.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        cliente: novoCliente,
      },
    });
  }),

  update: catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const originalCliente = await ClienteService.getById(id);

    if (!originalCliente) {
      return next(new AppError('Cliente não encontrado para atualização', 404));
    }

    const updatedCliente = await ClienteService.update(id, req.body, originalCliente);
    res.status(200).json({
      status: 'success',
      data: {
        cliente: updatedCliente,
      },
    });
  }),
};

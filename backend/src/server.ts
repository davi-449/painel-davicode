import express, { Request, Response, NextFunction } from 'express';
import 'express-async-errors'; // Must be first
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import path from 'path';

import authRoutes from './routes/authRoutes';
import clienteRoutes from './routes/clienteRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import configRoutes from './routes/configRoutes';
import planoRoutes from './routes/planoRoutes';
import dispatchRoutes from './routes/dispatchRoutes';
import financasRoutes from './routes/financasRoutes';

import AppError from './utils/AppError';
import errorHandler from './middlewares/errorMiddleware';

dotenv.config();

const app = express();

// Middlewares Globais de Segurança
app.use(helmet());
app.use(express.json({ limit: '50mb' }));
app.use(cors({ origin: '*' }));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 200, // Limite aumentado
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Muitas requisições deste IP, tente novamente em 15 minutos.',
});
app.use('/api', limiter);

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/clientes', clienteRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/config', configRoutes);
app.use('/api/planos', planoRoutes);
app.use('/api/dispatch', dispatchRoutes);
app.use('/api/financas', financasRoutes);

// Servir arquivos estáticos do Frontend (apenas em produção)
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '../../dist');
  app.use(express.static(distPath));

  app.get('*', (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Handler para rotas não encontradas
app.all('*', (req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`Não foi possível encontrar ${req.originalUrl} neste servidor!`, 404));
});

// Middleware Global de Tratamento de Erro
app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`[server]: Server is running at http://localhost:${PORT}`);
});

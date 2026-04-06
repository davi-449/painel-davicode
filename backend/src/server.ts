import express, { Request, Response, NextFunction } from 'express';

import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import path from 'path';

import authRoutes from './routes/authRoutes';
import clienteRoutes from './routes/clienteRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import configRoutes from './routes/configRoutes';
import planoRoutes from './routes/planoRoutes';
import dispatchRoutes from './routes/dispatchRoutes';
import financasRoutes from './routes/financasRoutes';

dotenv.config();

const app = express();

// Increase JSON payload limit if n8n payloads are large
app.use(express.json({ limit: '50mb' }));
app.use(cors({ origin: '*' }));

// Basic rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/clientes', clienteRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/config', configRoutes);
app.use('/api/planos', planoRoutes);
app.use('/api/dispatch', dispatchRoutes);
app.use('/api/financas', financasRoutes);

// Serve frontend static files (production only)
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '../../dist');
  app.use(express.static(distPath));

  // SPA fallback: all non-API routes → index.html
  app.get('*', (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Global error handler (must be last middleware)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[GLOBAL ERROR]', err);
  const isDev = process.env.NODE_ENV !== 'production';
  res.status(err.status || 500).json({
    error: isDev ? (err.message || 'Erro interno') : 'Erro interno no servidor.',
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`[server]: Server is running at http://localhost:${PORT}`);
});

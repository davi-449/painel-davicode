import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';

import authRoutes from './routes/authRoutes';
import clienteRoutes from './routes/clienteRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import configRoutes from './routes/configRoutes';
import planoRoutes from './routes/planoRoutes';
import dispatchRoutes from './routes/dispatchRoutes';

dotenv.config();

const app = express();

// Increase JSON payload limit if n8n payloads are large
app.use(express.json({ limit: '50mb' }));
app.use(cors({ origin: '*' }));

// Basic rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, 
  legacyHeaders: false, 
});
app.use('/api', limiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/clientes', clienteRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/config', configRoutes);
app.use('/api/planos', planoRoutes);
app.use('/api/dispatch', dispatchRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`[server]: Server is running at http://localhost:${PORT}`);
});

import { Router } from 'express';
import { FinancasController } from '../controllers/financasController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.use(authMiddleware);

router.get('/resumo', FinancasController.getResumo);

export default router;

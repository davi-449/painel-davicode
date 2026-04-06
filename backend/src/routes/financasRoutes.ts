import { Router } from 'express';
import { getResumoFinancas } from '../controllers/financasController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.use(authMiddleware);

router.get('/resumo', getResumoFinancas);

export default router;

import { Router } from 'express';
import { DispatchController } from '../controllers/DispatchController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();
router.use(authMiddleware);

router.post('/', DispatchController.dispatchN8N);

export default router;

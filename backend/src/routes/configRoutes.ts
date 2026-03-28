import { Router } from 'express';
import { ConfigController } from '../controllers/ConfigController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();
router.use(authMiddleware);

router.get('/', ConfigController.getAll);
router.put('/', ConfigController.update);

export default router;

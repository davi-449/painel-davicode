import { Router } from 'express';
import { DispatchController } from '../controllers/dispatchController';
import { authMiddleware } from '../middlewares/authMiddleware';
import validate from '../middlewares/validateMiddleware';
import { dispatchSchema } from '../validators/dispatchSchema';

const router = Router();
router.use(authMiddleware);

router.post('/', validate(dispatchSchema), DispatchController.dispatchN8N);

export default router;

import { Router } from 'express';
import { ConfigController } from '../controllers/configController';
import { authMiddleware } from '../middlewares/authMiddleware';
import validate from '../middlewares/validateMiddleware';
import { updateConfigSchema } from '../validators/configSchema';

const router = Router();
router.use(authMiddleware);

router.get('/', ConfigController.getAll);
router.put('/', validate(updateConfigSchema), ConfigController.update);

export default router;

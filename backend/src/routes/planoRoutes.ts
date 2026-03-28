import { Router } from 'express';
import { PlanoController } from '../controllers/PlanoController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();
router.use(authMiddleware);

router.get('/', PlanoController.getAll);
router.post('/', PlanoController.create);
router.patch('/:id', PlanoController.update);
router.patch('/:id/toggle', PlanoController.toggleActive);
router.delete('/:id', PlanoController.delete);

export default router;

import { Router } from 'express';
import { PlanoController } from '../controllers/planoController';
import { authMiddleware } from '../middlewares/authMiddleware';
import validate from '../middlewares/validateMiddleware';
import { createPlanoSchema, updatePlanoSchema } from '../validators/planoSchema';

const router = Router();
router.use(authMiddleware);

router.get('/', PlanoController.getAll);
router.post('/', validate(createPlanoSchema), PlanoController.create);
router.patch('/:id', validate(updatePlanoSchema), PlanoController.update);
router.patch('/:id/toggle', PlanoController.toggleActive);
router.delete('/:id', PlanoController.delete);

export default router;

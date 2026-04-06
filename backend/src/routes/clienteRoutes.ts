import { Router } from 'express';
import { ClienteController } from '../controllers/ClienteController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();
router.use(authMiddleware);

router.get('/search', ClienteController.search);
router.get('/', ClienteController.getAll);
router.post('/', ClienteController.create);
router.get('/:id/atividades', ClienteController.getAtividades);
router.get('/:id', ClienteController.getById);
router.patch('/:id', ClienteController.update);

export default router;

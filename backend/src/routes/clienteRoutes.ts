import { Router } from 'express';
import { ClienteController } from '../controllers/clienteController';
import { authMiddleware } from '../middlewares/authMiddleware';
import validate from '../middlewares/validateMiddleware';
import { createClienteSchema, updateClienteSchema } from '../validators/clienteSchema';

const router = Router();
router.use(authMiddleware);

router.get('/search', ClienteController.search);
router.get('/', ClienteController.getAll);
router.post('/', validate(createClienteSchema), ClienteController.create);
router.get('/:id/atividades', ClienteController.getAtividades);
router.get('/:id', ClienteController.getById);
router.patch('/:id', validate(updateClienteSchema), ClienteController.update);

export default router;

import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import validate from '../middlewares/validateMiddleware';
import { loginSchema } from '../validators/authSchema';

const router = Router();

// POST /api/auth/login
router.post('/login', validate(loginSchema), AuthController.login);

export default router;

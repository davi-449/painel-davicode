import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../prismaClient';
import AppError from '../utils/AppError';
import { LoginInput } from '../validators/authSchema';

const SECRET_KEY = process.env.JWT_SECRET || 'davicode_secret_key_123';

export const AuthService = {
  login: async (credentials: LoginInput) => {
    const { email, senha } = credentials;

    const user = await prisma.usuarios_painel.findUnique({
      where: { email },
    });

    if (!user) {
      throw new AppError('Credenciais inválidas.', 401);
    }

    const isMatch = await bcrypt.compare(senha, user.senha_hash);

    if (!isMatch) {
      throw new AppError('Credenciais inválidas.', 401);
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email },
      SECRET_KEY,
      { expiresIn: '12h' }
    );

    return {
      token,
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        role: user.role,
      },
    };
  },
};

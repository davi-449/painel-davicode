import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../prismaClient';

const SECRET_KEY = process.env.JWT_SECRET || 'davicode_secret_key_123';

export const AuthController = {
  async login(req: Request, res: Response): Promise<void> {
    const { email, senha } = req.body;
    
    if (!email || !senha) {
      res.status(400).json({ error: 'Email e senha são obrigatórios.' });
      return;
    }

    try {
      const user = await prisma.usuarios_painel.findUnique({
        where: { email },
      });

      if (!user) {
        res.status(401).json({ error: 'Credenciais inválidas.' });
        return;
      }

      const isMatch = await bcrypt.compare(senha, user.senha_hash);
      
      if (!isMatch) {
        res.status(401).json({ error: 'Credenciais inválidas.' });
        return;
      }

      const token = jwt.sign(
        { id: user.id, role: user.role, email: user.email },
        SECRET_KEY,
        { expiresIn: '12h' }
      );

      res.json({
        token,
        user: {
          id: user.id,
          nome: user.nome,
          email: user.email,
          role: user.role,
        }
      });
    } catch (error: any) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Erro interno no servidor.' });
    }
  }
};

import jwt from 'jsonwebtoken';
import { User } from '../models';
import { env } from '../config/env';
import { UnauthorizedError, ConflictError, BadRequestError } from '../utils/errors';
import { logger } from '../utils/logger';

interface TokenPayload {
  userId: string;
  role: string;
}

class AuthService {
  generateToken(user: { id: string; role: string }): string {
    return jwt.sign(
      { userId: user.id, role: user.role } as TokenPayload,
      env.jwt.secret,
      { expiresIn: env.jwt.expiresIn } as jwt.SignOptions,
    );
  }

  verifyToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, env.jwt.secret) as TokenPayload;
    } catch {
      throw new UnauthorizedError('Invalid or expired token');
    }
  }

  async register(data: { email: string; username: string; password: string; role?: 'worker' | 'requester' }) {
    const existing = await User.findOne({ where: { email: data.email } });
    if (existing) throw new ConflictError('Email already registered');

    const user = await User.create({
      email: data.email,
      username: data.username,
      password: data.password,
      role: data.role || 'worker',
    });

    const token = this.generateToken(user);
    return { user: { id: user.id, email: user.email, username: user.username, role: user.role }, token };
  }

  async login(email: string, password: string) {
    const user = await User.scope('withPassword').findOne({ where: { email } });
    if (!user || !(await user.comparePassword(password))) {
      throw new UnauthorizedError('Invalid email or password');
    }
    if (!user.isActive) {
      throw new UnauthorizedError('Account is deactivated');
    }

    const token = this.generateToken(user);
    return { user: { id: user.id, email: user.email, username: user.username, role: user.role }, token };
  }
}

export const authService = new AuthService();

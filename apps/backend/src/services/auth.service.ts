import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { UnauthorizedError } from '../utils/errors';
import { userService } from './user.service';

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
    const user = await userService.createUser(data);
    const token = this.generateToken(user);
    return { user, token };
  }

  async login(email: string, password: string) {
    const user = await userService.getUserByEmail(email);
    if (!user || !(await user.comparePassword(password))) {
      throw new UnauthorizedError('Invalid email or password');
    }
    if (!user.isActive) {
      throw new UnauthorizedError('Account is deactivated');
    }

    const token = this.generateToken(user);
    return { user: { id: user.id, email: user.email, username: user.username, role: user.role }, token };
  }

  async logout(_userId: string) {
    // With JWT, logout is handled client-side by discarding the token.
    // Add token blacklisting here if needed (e.g. via Redis).
    return { message: 'Logged out successfully' };
  }

  async verifyEmail(_token: string) {
    // Placeholder for email verification flow.
    // Implement: decode verification token, mark user email as verified.
    throw new Error('Email verification not yet implemented');
  }
}

export const authService = new AuthService();

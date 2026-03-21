import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { UnauthorizedError, BadRequestError } from '../utils/errors';
import { userService } from './user.service';
import { User, EmailVerification } from '../models';
import sequelize from '../config/database';
import { sendVerificationEmail } from './email.service';

interface TokenPayload {
  userId: string;
  role: string;
}

class AuthService {
  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

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
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = this.hashToken(verificationToken);
    const expiresAt = new Date(Date.now() + 12 * 60 * 60 * 1000); // 12 hours

    const user = await sequelize.transaction(async (t) => {
      const newUser = await userService.createUser(data, t);

      const userToken = await EmailVerification.create({
        userId: newUser.id,
        token: hashedToken,
        expiresAt,
      }, { transaction: t });


      return newUser;
    });
   
    const verificationUrl = `${env.frontendUrl}/verify-email?token=${verificationToken}&uid=${user.id}`;
    await sendVerificationEmail(data.email, verificationUrl, data.username);

    return { message: 'Registration successful. Please check your email to verify your account.' };
  }

  async login(email: string, password: string) {
    const user = await userService.getUserByEmail(email);
    if (!user || !(await user.comparePassword(password))) {
      throw new UnauthorizedError('Invalid email or password');
    }
    if (!user.isActive) {
      throw new UnauthorizedError('Account is deactivated');
    }
    if (!user.isEmailVerified) {
      throw new UnauthorizedError('Please verify your email before logging in');
    }

    const token = this.generateToken(user);
    return { user: { id: user.id, email: user.email, username: user.username, role: user.role }, token };
  }

  async logout(_userId: string) {
    // With JWT, logout is handled client-side by discarding the token.
    // Add token blacklisting here if needed (e.g. via Redis).
    return { message: 'Logged out successfully' };
  }

  async verifyEmail(token: string, userId: string) {
    const hashedToken = this.hashToken(token);
   
    const verification = await EmailVerification.findOne({ where: { token: hashedToken } });
    if (!verification) {
      throw new BadRequestError('Invalid verification token');
    }

    if (verification.userId !== userId) {
      throw new BadRequestError('Invalid verification token');
    }

    if (verification.expiresAt < new Date()) {
      await verification.destroy();
      throw new BadRequestError('Verification token has expired. Please register again.');
    }

    await User.unscoped().update(
      { isEmailVerified: true },
      { where: { id: verification.userId } },
    );

    // Clean up all verification tokens for this user
    await EmailVerification.destroy({ where: { userId: verification.userId } });

    return { message: 'Email verified successfully. You can now log in.' };
  }

  async resendVerification(email: string) {
    const user = await User.unscoped().findOne({ where: { email } });

    if (!user) {
      // Don't reveal whether the email exists
      return { message: 'If that email is registered, a new verification link has been sent.' };
    }

    if (user.isEmailVerified) {
      throw new BadRequestError('Email is already verified');
    }

    // Remove any existing tokens for this user
    await EmailVerification.destroy({ where: { userId: user.id } });

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = this.hashToken(verificationToken);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await EmailVerification.create({
      userId: user.id,
      token: hashedToken,
      expiresAt,
    });

    const verificationUrl = `${env.frontendUrl}/verify-email?token=${verificationToken}&uid=${user.id}`;
    await sendVerificationEmail(email, verificationUrl, user.username);

    return { message: 'If that email is registered, a new verification link has been sent.' };
  }
}

export const authService = new AuthService();

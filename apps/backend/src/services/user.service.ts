import { Transaction } from 'sequelize';
import { User } from '../models';
import { ConflictError, NotFoundError } from '../utils/errors';

class UserService {
  async createUser(data: { email: string; username: string; password: string; role?: 'worker' | 'requester' }, transaction?: Transaction) {
    const existing = await User.findOne({ where: { email: data.email }, transaction });
    if (existing) throw new ConflictError('Email already registered');

    const user = await User.create({
      email: data.email,
      username: data.username,
      password: data.password,
      role: data.role || 'worker',
    }, { transaction });

    return { id: user.id, email: user.email, username: user.username, role: user.role };
  }

  async getUserById(userId: string) {
    const user = await User.findByPk(userId);
    if (!user) throw new NotFoundError('User not found');
    return user;
  }

  async getUserByEmail(email: string) {
    return User.scope('withPassword').findOne({ where: { email } });
  }

  async updateProfile(userId: string, data: { username?: string; hederaAccountId?: string }) {
    const user = await User.findByPk(userId);
    if (!user) throw new NotFoundError('User not found');
    await user.update(data);
    return { id: user.id, email: user.email, username: user.username, role: user.role };
  }

  async deactivateUser(userId: string) {
    const user = await User.findByPk(userId);
    if (!user) throw new NotFoundError('User not found');
    await user.update({ isActive: false });
  }
}

export const userService = new UserService();

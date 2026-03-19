import { Response, NextFunction } from 'express';
import { Op } from 'sequelize';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { Payment, User } from '../models';
import { hederaService } from '../services/hedera.service';

export const paymentController = {
  async getPaymentHistory(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const payments = await Payment.findAll({
        where: {
          [Op.or]: [
            { fromUserId: req.user!.userId },
            { toUserId: req.user!.userId },
          ],
        },
        order: [['createdAt', 'DESC']],
        limit: 50,
      });
      res.json({ status: 'success', data: payments });
    } catch (error) {
      next(error);
    }
  },

  async getBalance(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = await User.findByPk(req.user!.userId);
      if (!user?.hederaAccountId) {
        return res.json({ status: 'success', data: { balance: 0, linked: false } });
      }

      const balance = await hederaService.getUsdcBalance(user.hederaAccountId);
      res.json({ status: 'success', data: { balance, linked: true } });
    } catch (error) {
      next(error);
    }
  },
};

import { Router, Response, NextFunction } from 'express';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.middleware';
import { Payment } from '../models';
import { hederaService } from '../services/hedera.service';
import { User } from '../models';

const router = Router();

// Get payment history for the authenticated user
router.get(
  '/history',
  authenticate,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { Op } = require('sequelize');
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
);

// Get USDC balance from Hedera
router.get(
  '/balance',
  authenticate,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
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
);

export default router;

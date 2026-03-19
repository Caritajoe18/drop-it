import { Router } from 'express';
import { paymentController } from '../controllers/payment.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.get('/history', authenticate, paymentController.getPaymentHistory);
router.get('/balance', authenticate, paymentController.getBalance);

export default router;

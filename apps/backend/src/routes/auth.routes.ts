import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { validate } from '../middleware/validate.middleware';
import { registerSchema, loginSchema, resendVerificationSchema } from '../validation/auths';

const router = Router();

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.get('/verify-email', authController.verifyEmail);
router.post('/resend-verification', validate(resendVerificationSchema), authController.resendVerification);

export default router;

import { Router } from 'express';
import { register, login, logout, refresh, getMe, updateMe, changePassword } from '../controllers/authController.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import { verifyToken } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { registerValidation, loginValidation, passwordChangeValidation } from '../validations/authValidation.js';

const router = Router();

router.post('/register', authLimiter, registerValidation, validate, register);
router.post('/login', authLimiter, loginValidation, validate, login);
router.post('/logout', logout);
router.post('/refresh', refresh);
router.get('/me', verifyToken, getMe);
router.patch('/me', verifyToken, updateMe);
router.patch('/me/password', verifyToken, passwordChangeValidation, validate, changePassword);

export default router;

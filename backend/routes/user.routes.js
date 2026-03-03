import { Router } from 'express';
import { getMe, updateMe } from '../controllers/userController.js';
import { verifyToken } from '../middleware/auth.js';

const router = Router();

router.get('/me', verifyToken, getMe);
router.patch('/me', verifyToken, updateMe);

export default router;

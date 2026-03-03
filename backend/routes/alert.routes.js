import { Router } from 'express';
import { getAlerts } from '../controllers/alertController.js';
import { verifyToken } from '../middleware/auth.js';

const router = Router();
router.get('/', verifyToken, getAlerts);
export default router;

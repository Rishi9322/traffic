import { Router } from 'express';
import {
    getStats, getAdminReports, deleteAdminReport, flagReport, resolveAdminReport,
    getUsers, banUser, promoteUser, getLogs, getFeedback, markFeedbackRead,
} from '../controllers/adminController.js';
import { verifyToken, requireRole } from '../middleware/auth.js';

const router = Router();

// All admin routes require authentication + admin role
router.use(verifyToken, requireRole('admin'));

router.get('/stats', getStats);
router.get('/reports', getAdminReports);
router.delete('/reports/:id', deleteAdminReport);
router.patch('/reports/:id/flag', flagReport);
router.patch('/reports/:id/resolve', resolveAdminReport);
router.get('/users', getUsers);
router.patch('/users/:id/ban', banUser);
router.patch('/users/:id/promote', promoteUser);
router.get('/logs', getLogs);
router.get('/feedback', getFeedback);
router.patch('/feedback/:id/read', markFeedbackRead);

export default router;

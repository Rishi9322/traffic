import { Router } from 'express';
import {
    getReports, createReport, getReport, updateReport, deleteReport, resolveReport,
} from '../controllers/reportController.js';
import { toggleUpvote } from '../controllers/voteController.js';
import { verifyToken } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { validate } from '../middleware/validate.js';
import { reportLimiter, voteLimiter } from '../middleware/rateLimiter.js';
import { createReportValidation, updateReportValidation } from '../validations/reportValidation.js';

const router = Router();

router.get('/', getReports);
router.post('/', verifyToken, reportLimiter, upload.single('image'), createReportValidation, validate, createReport);
router.get('/:id', getReport);
router.patch('/:id', verifyToken, updateReportValidation, validate, updateReport);
router.delete('/:id', verifyToken, deleteReport);
router.patch('/:id/resolve', verifyToken, resolveReport);
router.post('/:id/upvote', verifyToken, voteLimiter, toggleUpvote);

export default router;

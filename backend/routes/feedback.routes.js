import { Router } from 'express';
import { submitFeedback } from '../controllers/feedbackController.js';
import { validate } from '../middleware/validate.js';
import { feedbackValidation } from '../validations/feedbackValidation.js';

const router = Router();
router.post('/', feedbackValidation, validate, submitFeedback);
export default router;

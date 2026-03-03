import { db } from '../db/index.js';
import { feedback } from '../db/schema.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { generateId } from '../utils/uuid.js';

// ── POST /feedback ────────────────────────────────────────────────────────────
export const submitFeedback = asyncHandler(async (req, res) => {
    const { name, email, message } = req.body;
    await db.insert(feedback).values({ id: generateId(), name, email, message });
    res.status(201).json({ success: true, message: 'Thank you for your feedback!' });
});

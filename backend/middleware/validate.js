import { validationResult } from 'express-validator';

/**
 * Middleware: run after express-validator chains.
 * If validation errors exist, respond 422 with structured error array.
 */
export function validate(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const formatted = errors.array().map((e) => ({
            field: e.path,
            message: e.msg,
        }));
        return res.status(422).json({ success: false, errors: formatted });
    }
    next();
}

import { logger } from '../utils/logger.js';

/**
 * Custom application error with status code.
 */
export class AppError extends Error {
    constructor(message, statusCode = 500) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
    }
}

/**
 * Higher-order wrapper for async route handlers.
 * Catches rejected promises and forwards to next().
 */
export const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Centralized error-handling middleware.
 * Must be the last middleware registered in Express.
 */
export function errorHandler(err, req, res, next) {
    let { statusCode = 500, message } = err;

    // Handle JWT errors
    if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Invalid token';
    }
    if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Token expired';
    }

    // Handle SQLite/Turso constraint errors
    if (err.message && err.message.includes('UNIQUE constraint failed')) {
        statusCode = 409;
        const field = err.message.split('.').pop();
        message = `A record with this ${field} already exists`;
    }

    // Log 5xx errors
    if (statusCode >= 500) {
        logger.error(`${statusCode} — ${message}`, { stack: err.stack, url: req.url });
    }

    res.status(statusCode).json({
        success: false,
        message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
}

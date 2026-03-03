import jwt from 'jsonwebtoken';
import { AppError } from './errorHandler.js';
import { db } from '../db/index.js';
import { users } from '../db/schema.js';
import { eq } from 'drizzle-orm';

/**
 * Middleware: verify JWT access token from Authorization header.
 * Attaches decoded user payload to req.user.
 */
export async function verifyToken(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return next(new AppError('No access token provided', 401));
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

        // Attach user payload to request
        req.user = decoded;
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return next(new AppError('Access token expired', 401));
        }
        return next(new AppError('Invalid access token', 401));
    }
}

/**
 * Middleware factory: require a specific role.
 * Must be used AFTER verifyToken.
 * @param {'admin' | 'user'} role
 */
export function requireRole(role) {
    return (req, res, next) => {
        if (!req.user) return next(new AppError('Not authenticated', 401));
        if (req.user.role !== role) {
            return next(new AppError('Insufficient permissions', 403));
        }
        next();
    };
}

/**
 * Middleware: verify token AND check the user is not banned.
 */
export async function verifyTokenAndBanStatus(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return next(new AppError('No access token provided', 401));
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

        // Check ban status from DB
        const [user] = await db.select().from(users).where(eq(users.id, decoded.id));
        if (!user) return next(new AppError('User not found', 401));
        if (user.isBanned) return next(new AppError('Your account has been banned', 403));

        req.user = decoded;
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return next(new AppError('Access token expired', 401));
        }
        return next(new AppError('Invalid access token', 401));
    }
}

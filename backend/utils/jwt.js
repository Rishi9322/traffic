import jwt from 'jsonwebtoken';

/**
 * Generate short-lived access token (stored in memory on frontend).
 */
export function generateAccessToken(payload) {
    return jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
        expiresIn: process.env.JWT_ACCESS_EXPIRES || '15m',
    });
}

/**
 * Generate long-lived refresh token (stored in httpOnly cookie).
 */
export function generateRefreshToken(payload) {
    return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
        expiresIn: process.env.JWT_REFRESH_EXPIRES || '7d',
    });
}

/**
 * Verify an access token. Throws if invalid or expired.
 */
export function verifyAccessToken(token) {
    return jwt.verify(token, process.env.JWT_ACCESS_SECRET);
}

/**
 * Verify a refresh token. Throws if invalid or expired.
 */
export function verifyRefreshToken(token) {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
}

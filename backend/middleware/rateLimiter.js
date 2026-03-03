import rateLimit from 'express-rate-limit';

const isDev = process.env.NODE_ENV !== 'production';

const createLimiter = (windowMs, max, message) =>
    rateLimit({
        windowMs,
        // In development, multiply limits by 10 to avoid false-positive 429s during dev/hot-reload
        max: isDev ? max * 10 : max,
        message: { success: false, message },
        standardHeaders: true,
        legacyHeaders: false,
        skip: () => isDev && false, // Keep limiter active but relaxed
    });

// Auth routes (register, login): 10 requests / 15 min in prod, 100 in dev
export const authLimiter = createLimiter(
    15 * 60 * 1000,
    10,
    'Too many auth requests, please try again in 15 minutes'
);

// Report submission: 20 / minute in prod, 200 in dev
export const reportLimiter = createLimiter(
    60 * 1000,
    20,
    'Too many report requests, please slow down'
);

// Voting: 30 / minute in prod, 300 in dev
export const voteLimiter = createLimiter(
    60 * 1000,
    30,
    'Too many vote requests, please slow down'
);

// Global fallback: 200 / minute in prod, 2000 in dev
export const globalLimiter = createLimiter(
    60 * 1000,
    200,
    'Too many requests from this IP, please try again later'
);

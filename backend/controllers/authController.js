import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { users } from '../db/schema.js';
import { AppError, asyncHandler } from '../middleware/errorHandler.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import { generateId } from '../utils/uuid.js';

const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

// ── POST /auth/register ────────────────────────────────────────────────────────
export const register = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;

    // Check uniqueness
    const [existing] = await db.select().from(users).where(eq(users.email, email));
    if (existing) throw new AppError('Email already registered', 409);

    const [existingUsername] = await db.select().from(users).where(eq(users.username, username));
    if (existingUsername) throw new AppError('Username already taken', 409);

    const passwordHash = await bcrypt.hash(password, 12);
    const id = generateId();

    await db.insert(users).values({
        id,
        username,
        email,
        passwordHash,
        role: 'user',
    });

    const tokenPayload = { id, username, email, role: 'user' };
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    // Store hashed refresh token in DB
    const hashedRefresh = await bcrypt.hash(refreshToken, 10);
    await db.update(users).set({ refreshToken: hashedRefresh }).where(eq(users.id, id));

    res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);
    res.status(201).json({ success: true, user: tokenPayload, accessToken });
});

// ── POST /auth/login ──────────────────────────────────────────────────────────
export const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const [user] = await db.select().from(users).where(eq(users.email, email));
    if (!user) throw new AppError('Invalid email or password', 401);
    if (user.isBanned) throw new AppError('Your account has been banned', 403);

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) throw new AppError('Invalid email or password', 401);

    // Update last active
    await db.update(users).set({ lastActiveAt: new Date().toISOString() }).where(eq(users.id, user.id));

    const tokenPayload = { id: user.id, username: user.username, email: user.email, role: user.role };
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    const hashedRefresh = await bcrypt.hash(refreshToken, 10);
    await db.update(users).set({ refreshToken: hashedRefresh }).where(eq(users.id, user.id));

    res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);
    res.json({ success: true, user: tokenPayload, accessToken });
});

// ── POST /auth/logout ─────────────────────────────────────────────────────────
export const logout = asyncHandler(async (req, res) => {
    const token = req.cookies?.refreshToken;
    if (token) {
        try {
            const decoded = verifyRefreshToken(token);
            await db.update(users).set({ refreshToken: null }).where(eq(users.id, decoded.id));
        } catch (_) { /* token already invalid */ }
    }
    res.clearCookie('refreshToken', { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
    res.json({ success: true, message: 'Logged out successfully' });
});

// ── POST /auth/refresh ────────────────────────────────────────────────────────
export const refresh = asyncHandler(async (req, res) => {
    const token = req.cookies?.refreshToken;
    if (!token) throw new AppError('No refresh token', 401);

    const decoded = verifyRefreshToken(token);
    const [user] = await db.select().from(users).where(eq(users.id, decoded.id));
    if (!user || !user.refreshToken) throw new AppError('Invalid refresh token', 401);
    if (user.isBanned) throw new AppError('Account banned', 403);

    // Verify stored hash matches cookie token
    const isValid = await bcrypt.compare(token, user.refreshToken);
    if (!isValid) throw new AppError('Invalid refresh token', 401);

    const tokenPayload = { id: user.id, username: user.username, email: user.email, role: user.role };
    const accessToken = generateAccessToken(tokenPayload);
    res.json({ success: true, accessToken });
});

// ── GET /auth/me ──────────────────────────────────────────────────────────────
export const getMe = asyncHandler(async (req, res) => {
    const [user] = await db.select().from(users).where(eq(users.id, req.user.id));
    if (!user) throw new AppError('User not found', 404);
    const { passwordHash, refreshToken, ...safeUser } = user;
    res.json({ success: true, user: safeUser });
});

// ── PATCH /auth/me ────────────────────────────────────────────────────────────
export const updateMe = asyncHandler(async (req, res) => {
    const { username, email } = req.body;
    const updates = {};
    if (username) updates.username = username;
    if (email) updates.email = email;
    updates.updatedAt = new Date().toISOString();

    await db.update(users).set(updates).where(eq(users.id, req.user.id));
    res.json({ success: true, message: 'Profile updated' });
});

// ── PATCH /auth/me/password ───────────────────────────────────────────────────
export const changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const [user] = await db.select().from(users).where(eq(users.id, req.user.id));
    if (!user) throw new AppError('User not found', 404);

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) throw new AppError('Current password is incorrect', 401);

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await db.update(users).set({ passwordHash, updatedAt: new Date().toISOString() }).where(eq(users.id, user.id));
    res.json({ success: true, message: 'Password changed successfully' });
});

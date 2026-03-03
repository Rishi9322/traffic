import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { db } from '../db/index.js';
import { users } from '../db/schema.js';
import { AppError, asyncHandler } from '../middleware/errorHandler.js';

// ── GET /users/me ─────────────────────────────────────────────────────────────
export const getMe = asyncHandler(async (req, res) => {
    const [user] = await db
        .select({
            id: users.id,
            username: users.username,
            email: users.email,
            role: users.role,
            reportsCount: users.reportsCount,
            createdAt: users.createdAt,
        })
        .from(users)
        .where(eq(users.id, req.user.id));

    if (!user) throw new AppError('User not found', 404);
    res.json({ success: true, data: user });
});

// ── PATCH /users/me ───────────────────────────────────────────────────────────
export const updateMe = asyncHandler(async (req, res) => {
    const { username, email, currentPassword, newPassword } = req.body;

    const [user] = await db.select().from(users).where(eq(users.id, req.user.id));
    if (!user) throw new AppError('User not found', 404);

    const updates = { updatedAt: new Date().toISOString() };

    // Username change
    if (username && username !== user.username) {
        // Check uniqueness
        const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.username, username));
        if (existing) throw new AppError('Username already taken', 409);
        if (username.length < 3 || username.length > 30) throw new AppError('Username must be 3–30 characters', 400);
        updates.username = username;
    }

    // Email change
    if (email && email !== user.email) {
        const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, email));
        if (existing) throw new AppError('Email already in use', 409);
        updates.email = email;
    }

    // Password change
    if (newPassword) {
        if (!currentPassword) throw new AppError('Current password required to set a new one', 400);
        const valid = await bcrypt.compare(currentPassword, user.passwordHash);
        if (!valid) throw new AppError('Current password is incorrect', 401);
        if (newPassword.length < 6) throw new AppError('New password must be at least 6 characters', 400);
        updates.passwordHash = await bcrypt.hash(newPassword, 12);
    }

    await db.update(users).set(updates).where(eq(users.id, req.user.id));

    // Return updated user (without sensitive fields)
    const [updated] = await db
        .select({ id: users.id, username: users.username, email: users.email, role: users.role, reportsCount: users.reportsCount, createdAt: users.createdAt })
        .from(users)
        .where(eq(users.id, req.user.id));

    res.json({ success: true, data: updated, message: 'Profile updated successfully' });
});

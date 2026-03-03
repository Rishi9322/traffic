import { and, desc, eq, gte, like, or, sql } from 'drizzle-orm';
import { db } from '../db/index.js';
import { adminLogs, feedback, reports, users } from '../db/schema.js';
import { AppError, asyncHandler } from '../middleware/errorHandler.js';
import { deleteFromImageKit } from '../middleware/upload.js';
import { emitReportDeleted, emitReportResolved } from '../services/notificationService.js';
import { generateId } from '../utils/uuid.js';

// Helper to log admin actions
async function logAction(adminId, action, targetId, targetModel, details = {}) {
    await db.insert(adminLogs).values({
        id: generateId(),
        adminId,
        action,
        targetId,
        targetModel,
        details: JSON.stringify(details),
    });
}

// ── GET /admin/stats ──────────────────────────────────────────────────────────
export const getStats = asyncHandler(async (req, res) => {
    const today = new Date().toISOString().split('T')[0];
    const yesterday24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const [totalReportsRow] = await db.select({ count: sql`COUNT(*)` }).from(reports);
    const [activeReportsRow] = await db.select({ count: sql`COUNT(*)` }).from(reports).where(eq(reports.status, 'active'));
    const [resolvedTodayRow] = await db.select({ count: sql`COUNT(*)` }).from(reports)
        .where(and(eq(reports.status, 'resolved'), gte(reports.updatedAt, today)));
    const [activeUsersRow] = await db.select({ count: sql`COUNT(*)` }).from(users)
        .where(gte(users.lastActiveAt, yesterday24h));

    // Reports by type for pie chart
    const rawByType = await db.select({ type: reports.type, count: sql`COUNT(*)` }).from(reports).groupBy(reports.type);

    // Reports last 7 days by type for area chart
    const days = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        days.push(d.toISOString().split('T')[0]);
    }

    const last7RawRows = await db
        .select({ date: sql`DATE(created_at)`, type: reports.type, count: sql`COUNT(*)` })
        .from(reports)
        .where(gte(reports.createdAt, days[0]))
        .groupBy(sql`DATE(created_at)`, reports.type);

    const reportsLast7Days = days.map((date) => {
        const dayData = { date, accident: 0, congestion: 0, roadblock: 0, waterlogging: 0, other: 0 };
        last7RawRows.forEach((r) => {
            if (r.date === date && dayData[r.type] !== undefined) {
                dayData[r.type] = Number(r.count);
            }
        });
        return dayData;
    });

    res.json({
        success: true,
        data: {
            totalReports: Number(totalReportsRow.count),
            activeReports: Number(activeReportsRow.count),
            resolvedToday: Number(resolvedTodayRow.count),
            activeUsers24h: Number(activeUsersRow.count),
            reportsByType: rawByType.map((r) => ({ type: r.type, count: Number(r.count) })),
            reportsLast7Days,
        },
    });
});

// ── GET /admin/reports ────────────────────────────────────────────────────────
export const getAdminReports = asyncHandler(async (req, res) => {
    const { status, type, search, page = 1, limit = 20 } = req.query;
    const conditions = [];
    if (status) conditions.push(eq(reports.status, status));
    if (type) conditions.push(eq(reports.type, type));
    if (search) {
        conditions.push(
            or(
                like(reports.description, `%${search}%`),
                like(reports.locationName, `%${search}%`)
            )
        );
    }

    let query = db
        .select({
            id: reports.id, type: reports.type, congestionLevel: reports.congestionLevel,
            description: reports.description, locationName: reports.locationName,
            status: reports.status, upvotes: reports.upvotes, createdAt: reports.createdAt,
            imageUrl: reports.imageUrl, imageFileId: reports.imageFileId,
            authorId: reports.authorId, username: users.username
        })
        .from(reports)
        .leftJoin(users, eq(reports.authorId, users.id));

    if (conditions.length) query = query.where(and(...conditions));
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const data = await query.orderBy(desc(reports.createdAt)).limit(parseInt(limit)).offset(offset);

    res.json({ success: true, data });
});

// ── DELETE /admin/reports/:id ─────────────────────────────────────────────────
export const deleteAdminReport = asyncHandler(async (req, res) => {
    const [report] = await db.select().from(reports).where(eq(reports.id, req.params.id));
    if (!report) throw new AppError('Report not found', 404);
    if (report.imageFileId) await deleteFromImageKit(report.imageFileId);
    await db.delete(reports).where(eq(reports.id, req.params.id));
    await logAction(req.user.id, 'DELETE_REPORT', req.params.id, 'Report', { type: report.type });
    emitReportDeleted(req.params.id);
    res.json({ success: true, message: 'Report deleted' });
});

// ── PATCH /admin/reports/:id/flag ─────────────────────────────────────────────
export const flagReport = asyncHandler(async (req, res) => {
    await db.update(reports).set({ status: 'flagged', updatedAt: new Date().toISOString() })
        .where(eq(reports.id, req.params.id));
    await logAction(req.user.id, 'FLAG_REPORT', req.params.id, 'Report');
    res.json({ success: true, message: 'Report flagged' });
});

// ── PATCH /admin/reports/:id/resolve ─────────────────────────────────────────
export const resolveAdminReport = asyncHandler(async (req, res) => {
    await db.update(reports).set({ status: 'resolved', updatedAt: new Date().toISOString() })
        .where(eq(reports.id, req.params.id));
    await logAction(req.user.id, 'RESOLVE_REPORT', req.params.id, 'Report');
    emitReportResolved(req.params.id);
    res.json({ success: true, message: 'Report resolved' });
});

// ── GET /admin/users ──────────────────────────────────────────────────────────
export const getUsers = asyncHandler(async (req, res) => {
    const { search, page = 1, limit = 20 } = req.query;
    let query = db.select({
        id: users.id, username: users.username, email: users.email, role: users.role,
        isBanned: users.isBanned, reportsCount: users.reportsCount,
        createdAt: users.createdAt, lastActiveAt: users.lastActiveAt,
    }).from(users);

    if (search) {
        query = query.where(or(like(users.username, `%${search}%`), like(users.email, `%${search}%`)));
    }
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const data = await query.orderBy(desc(users.createdAt)).limit(parseInt(limit)).offset(offset);
    res.json({ success: true, data });
});

// ── PATCH /admin/users/:id/ban ────────────────────────────────────────────────
export const banUser = asyncHandler(async (req, res) => {
    const [user] = await db.select().from(users).where(eq(users.id, req.params.id));
    if (!user) throw new AppError('User not found', 404);
    const newBanStatus = user.isBanned ? 0 : 1;
    await db.update(users).set({ isBanned: newBanStatus }).where(eq(users.id, req.params.id));
    const action = newBanStatus ? 'BAN_USER' : 'UNBAN_USER';
    await logAction(req.user.id, action, req.params.id, 'User');
    res.json({ success: true, message: `User ${newBanStatus ? 'banned' : 'unbanned'}` });
});

// ── PATCH /admin/users/:id/promote ────────────────────────────────────────────
export const promoteUser = asyncHandler(async (req, res) => {
    await db.update(users).set({ role: 'admin' }).where(eq(users.id, req.params.id));
    await logAction(req.user.id, 'PROMOTE_USER', req.params.id, 'User');
    res.json({ success: true, message: 'User promoted to admin' });
});

// ── GET /admin/logs ───────────────────────────────────────────────────────────
export const getLogs = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const data = await db
        .select({
            id: adminLogs.id, action: adminLogs.action, targetId: adminLogs.targetId,
            targetModel: adminLogs.targetModel, details: adminLogs.details, createdAt: adminLogs.createdAt,
            adminUsername: users.username
        })
        .from(adminLogs).leftJoin(users, eq(adminLogs.adminId, users.id))
        .orderBy(desc(adminLogs.createdAt)).limit(parseInt(limit)).offset(offset);
    res.json({ success: true, data });
});

// ── GET /admin/feedback ───────────────────────────────────────────────────────
export const getFeedback = asyncHandler(async (req, res) => {
    const data = await db.select().from(feedback).orderBy(desc(feedback.createdAt));
    res.json({ success: true, data });
});

// ── PATCH /admin/feedback/:id/read ────────────────────────────────────────────
export const markFeedbackRead = asyncHandler(async (req, res) => {
    await db.update(feedback).set({ isRead: 1 }).where(eq(feedback.id, req.params.id));
    res.json({ success: true, message: 'Feedback marked as read' });
});

import { and, eq, sql } from 'drizzle-orm';
import { db } from '../db/index.js';
import { reports, upvotes } from '../db/schema.js';
import { AppError, asyncHandler } from '../middleware/errorHandler.js';
import { emitVoteUpdate } from '../services/notificationService.js';
import { generateId } from '../utils/uuid.js';

// ── POST /reports/:id/upvote ─────────────────────────────────────────────────
export const toggleUpvote = asyncHandler(async (req, res) => {
    const reportId = req.params.id;
    const userId = req.user.id;

    const [report] = await db.select().from(reports).where(eq(reports.id, reportId));
    if (!report) throw new AppError('Report not found', 404);

    // Check if user already upvoted
    const [existing] = await db
        .select()
        .from(upvotes)
        .where(and(eq(upvotes.userId, userId), eq(upvotes.reportId, reportId)));

    let newUpvoteCount;

    if (existing) {
        // Remove upvote
        await db
            .delete(upvotes)
            .where(and(eq(upvotes.userId, userId), eq(upvotes.reportId, reportId)));

        await db
            .update(reports)
            .set({ upvotes: sql`MAX(0, upvotes - 1)`, updatedAt: new Date().toISOString() })
            .where(eq(reports.id, reportId));

        newUpvoteCount = Math.max(0, report.upvotes - 1);
    } else {
        // Add upvote
        await db.insert(upvotes).values({ userId, reportId, id: generateId() }).catch(() => { });
        await db
            .update(reports)
            .set({ upvotes: sql`upvotes + 1`, updatedAt: new Date().toISOString() })
            .where(eq(reports.id, reportId));

        newUpvoteCount = report.upvotes + 1;
    }

    emitVoteUpdate(reportId, newUpvoteCount);
    res.json({ success: true, upvoted: !existing, upvotes: newUpvoteCount });
});

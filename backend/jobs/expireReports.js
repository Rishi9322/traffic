import cron from 'node-cron';
import { and, eq, lt } from 'drizzle-orm';
import { db } from '../db/index.js';
import { reports } from '../db/schema.js';
import { emitReportExpired } from '../services/notificationService.js';
import { logger } from '../utils/logger.js';

/**
 * node-cron job: every 15 minutes, expire active reports past their expires_at.
 */
export function startExpireJob() {
    cron.schedule('*/15 * * * *', async () => {
        try {
            const now = new Date().toISOString();

            const expiredReports = await db
                .select({ id: reports.id })
                .from(reports)
                .where(
                    and(
                        eq(reports.status, 'active'),
                        lt(reports.expiresAt, now)
                    )
                );

            if (expiredReports.length === 0) return;

            for (const report of expiredReports) {
                await db
                    .update(reports)
                    .set({ status: 'expired', updatedAt: now })
                    .where(eq(reports.id, report.id));

                emitReportExpired(report.id);
            }

            logger.info(`⏱️ Expired ${expiredReports.length} report(s)`);
        } catch (err) {
            logger.error('Error in expire reports cron job:', err.message);
        }
    });

    logger.info('⏱️ Report expiry cron job started (every 15 minutes)');
}

import { and, desc, gte, lte } from 'drizzle-orm';
import { db } from '../db/index.js';
import { alerts } from '../db/schema.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { buildBoundingBox } from '../services/reportService.js';

// ── GET /alerts ───────────────────────────────────────────────────────────────
export const getAlerts = asyncHandler(async (req, res) => {
    const { lat, lng, radius = 5, limit = 30 } = req.query;

    let query = db.select().from(alerts);
    const conditions = [];

    if (lat && lng) {
        const box = buildBoundingBox(parseFloat(lat), parseFloat(lng), parseFloat(radius));
        conditions.push(
            gte(alerts.latitude, box.minLat),
            lte(alerts.latitude, box.maxLat),
            gte(alerts.longitude, box.minLng),
            lte(alerts.longitude, box.maxLng)
        );
    }

    if (conditions.length) query = query.where(and(...conditions));

    const data = await query.orderBy(desc(alerts.createdAt)).limit(parseInt(limit));
    res.json({ success: true, data });
});

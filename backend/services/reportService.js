import { db } from '../db/index.js';
import { reports } from '../db/schema.js';
import { and, eq, gte, lte } from 'drizzle-orm';

const EXPIRY_HOURS = parseInt(process.env.REPORT_EXPIRY_HOURS || '6', 10);

/**
 * Calculate the expiry timestamp (created_at + EXPIRY_HOURS).
 */
export function calcExpiresAt() {
    const now = new Date();
    now.setHours(now.getHours() + EXPIRY_HOURS);
    return now.toISOString();
}

/**
 * Check for duplicate report: same user + same type + same approximate location within 5 minutes.
 * Returns true if a duplicate exists.
 */
export async function checkDuplicate(authorId, type, latitude, longitude) {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const LAT_DELTA = 0.005; // ~500m
    const LNG_DELTA = 0.005;

    const existing = await db
        .select({ id: reports.id })
        .from(reports)
        .where(
            and(
                eq(reports.authorId, authorId),
                eq(reports.type, type),
                gte(reports.latitude, latitude - LAT_DELTA),
                lte(reports.latitude, latitude + LAT_DELTA),
                gte(reports.longitude, longitude - LNG_DELTA),
                lte(reports.longitude, longitude + LNG_DELTA),
                gte(reports.createdAt, fiveMinutesAgo)
            )
        );

    return existing.length > 0;
}

/**
 * Build a bounding box filter for lat/lng radius search.
 * @param {number} lat
 * @param {number} lng
 * @param {number} radiusKm
 */
export function buildBoundingBox(lat, lng, radiusKm) {
    // 1 degree lat ≈ 111km; 1 degree lng varies
    const latDelta = radiusKm / 111;
    const lngDelta = radiusKm / (111 * Math.cos((lat * Math.PI) / 180));
    return {
        minLat: lat - latDelta,
        maxLat: lat + latDelta,
        minLng: lng - lngDelta,
        maxLng: lng + lngDelta,
    };
}

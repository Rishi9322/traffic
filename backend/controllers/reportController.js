import { and, desc, eq, gte, lte, sql } from 'drizzle-orm';
import { db } from '../db/index.js';
import { alerts, reports, users } from '../db/schema.js';
import { AppError, asyncHandler } from '../middleware/errorHandler.js';
import { uploadToImageKit, deleteFromImageKit } from '../middleware/upload.js';
import { checkDuplicate, calcExpiresAt, buildBoundingBox } from '../services/reportService.js';
import {
    emitNewReport,
    emitReportResolved,
    emitReportDeleted,
} from '../services/notificationService.js';
import { generateId } from '../utils/uuid.js';

// ── GET /reports ──────────────────────────────────────────────────────────────
export const getReports = asyncHandler(async (req, res) => {
    const { lat, lng, radius = 10, type, status = 'active', page = 1, limit = 50 } = req.query;

    let query = db
        .select({
            id: reports.id,
            authorId: reports.authorId,
            type: reports.type,
            congestionLevel: reports.congestionLevel,
            description: reports.description,
            imageUrl: reports.imageUrl,
            latitude: reports.latitude,
            longitude: reports.longitude,
            locationName: reports.locationName,
            status: reports.status,
            upvotes: reports.upvotes,
            isAnonymous: reports.isAnonymous,
            expiresAt: reports.expiresAt,
            createdAt: reports.createdAt,
            username: users.username,
        })
        .from(reports)
        .leftJoin(users, eq(reports.authorId, users.id));

    const conditions = [];

    if (status) conditions.push(eq(reports.status, status));
    if (type) conditions.push(eq(reports.type, type));
    if (lat && lng) {
        const box = buildBoundingBox(parseFloat(lat), parseFloat(lng), parseFloat(radius));
        conditions.push(
            gte(reports.latitude, box.minLat),
            lte(reports.latitude, box.maxLat),
            gte(reports.longitude, box.minLng),
            lte(reports.longitude, box.maxLng)
        );
    }

    if (conditions.length) query = query.where(and(...conditions));

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const data = await query.orderBy(desc(reports.createdAt)).limit(parseInt(limit)).offset(offset);

    // Mask author info for anonymous reports
    const masked = data.map((r) => ({
        ...r,
        username: r.isAnonymous ? 'Anonymous' : r.username,
    }));

    res.json({ success: true, data: masked });
});

// ── POST /reports ─────────────────────────────────────────────────────────────
export const createReport = asyncHandler(async (req, res) => {
    const { type, congestionLevel, description, latitude, longitude, locationName, isAnonymous } = req.body;
    const authorId = req.user.id;

    // Duplicate check
    const isDuplicate = await checkDuplicate(authorId, type, parseFloat(latitude), parseFloat(longitude));
    if (isDuplicate) {
        throw new AppError('You already submitted a similar report in this area within 5 minutes', 409);
    }

    // Upload image if provided
    let imageUrl = null;
    let imageFileId = null;
    if (req.file) {
        const result = await uploadToImageKit(req.file.buffer, req.file.originalname, '/ostas/reports');
        imageUrl = result.url;
        imageFileId = result.fileId;
    }

    const id = generateId();
    const expiresAt = calcExpiresAt();

    const newReport = {
        id,
        authorId,
        type,
        congestionLevel: congestionLevel || 'medium',
        description,
        imageUrl,
        imageFileId,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        locationName: locationName || null,
        isAnonymous: isAnonymous === 'true' || isAnonymous === true ? 1 : 0,
        status: 'active',
        expiresAt,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };

    await db.insert(reports).values(newReport);

    // Increment user reports count
    await db
        .update(users)
        .set({ reportsCount: sql`reports_count + 1` })
        .where(eq(users.id, authorId));

    // Create alert record
    const alertMessage = `${type.charAt(0).toUpperCase() + type.slice(1)} reported${locationName ? ` near ${locationName}` : ''}`;
    await db.insert(alerts).values({
        id: generateId(),
        reportId: id,
        message: alertMessage,
        alertType: type,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
    });

    // Emit real-time event
    const [fullReport] = await db
        .select({
            id: reports.id, type: reports.type, congestionLevel: reports.congestionLevel,
            description: reports.description, imageUrl: reports.imageUrl, latitude: reports.latitude,
            longitude: reports.longitude, locationName: reports.locationName, status: reports.status,
            upvotes: reports.upvotes, isAnonymous: reports.isAnonymous, expiresAt: reports.expiresAt,
            createdAt: reports.createdAt, username: users.username
        })
        .from(reports).leftJoin(users, eq(reports.authorId, users.id))
        .where(eq(reports.id, id));

    emitNewReport({ ...fullReport, username: newReport.isAnonymous ? 'Anonymous' : fullReport.username });

    res.status(201).json({ success: true, data: newReport });
});

// ── GET /reports/:id ──────────────────────────────────────────────────────────
export const getReport = asyncHandler(async (req, res) => {
    const [report] = await db
        .select({
            id: reports.id, type: reports.type, congestionLevel: reports.congestionLevel,
            description: reports.description, imageUrl: reports.imageUrl, latitude: reports.latitude,
            longitude: reports.longitude, locationName: reports.locationName, status: reports.status,
            upvotes: reports.upvotes, isAnonymous: reports.isAnonymous, expiresAt: reports.expiresAt,
            createdAt: reports.createdAt, authorId: reports.authorId, username: users.username
        })
        .from(reports).leftJoin(users, eq(reports.authorId, users.id))
        .where(eq(reports.id, req.params.id));

    if (!report) throw new AppError('Report not found', 404);
    res.json({ success: true, data: { ...report, username: report.isAnonymous ? 'Anonymous' : report.username } });
});

// ── PATCH /reports/:id ────────────────────────────────────────────────────────
export const updateReport = asyncHandler(async (req, res) => {
    const [report] = await db.select().from(reports).where(eq(reports.id, req.params.id));
    if (!report) throw new AppError('Report not found', 404);

    // Only author or admin can edit
    if (report.authorId !== req.user.id && req.user.role !== 'admin') {
        throw new AppError('Not authorized', 403);
    }

    if (report.status === 'expired') throw new AppError('Cannot edit an expired report', 400);

    const { type, congestionLevel, description } = req.body;
    const updates = { updatedAt: new Date().toISOString() };
    if (type) updates.type = type;
    if (congestionLevel) updates.congestionLevel = congestionLevel;
    if (description) updates.description = description;

    await db.update(reports).set(updates).where(eq(reports.id, req.params.id));
    res.json({ success: true, message: 'Report updated' });
});

// ── DELETE /reports/:id ───────────────────────────────────────────────────────
export const deleteReport = asyncHandler(async (req, res) => {
    const [report] = await db.select().from(reports).where(eq(reports.id, req.params.id));
    if (!report) throw new AppError('Report not found', 404);

    if (report.authorId !== req.user.id && req.user.role !== 'admin') {
        throw new AppError('Not authorized', 403);
    }

    // Remove image from ImageKit
    if (report.imageFileId) await deleteFromImageKit(report.imageFileId);

    await db.delete(reports).where(eq(reports.id, req.params.id));

    // Decrement user reports count
    await db
        .update(users)
        .set({ reportsCount: sql`MAX(0, reports_count - 1)` })
        .where(eq(users.id, report.authorId));

    emitReportDeleted(req.params.id);
    res.json({ success: true, message: 'Report deleted' });
});

// ── PATCH /reports/:id/resolve ────────────────────────────────────────────────
export const resolveReport = asyncHandler(async (req, res) => {
    const [report] = await db.select().from(reports).where(eq(reports.id, req.params.id));
    if (!report) throw new AppError('Report not found', 404);

    if (report.authorId !== req.user.id && req.user.role !== 'admin') {
        throw new AppError('Not authorized', 403);
    }

    await db
        .update(reports)
        .set({ status: 'resolved', updatedAt: new Date().toISOString() })
        .where(eq(reports.id, req.params.id));

    emitReportResolved(req.params.id);
    res.json({ success: true, message: 'Report marked as resolved' });
});

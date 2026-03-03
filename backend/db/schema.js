import { sql } from 'drizzle-orm';
import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';

// ─── TABLE 1: USERS ─────────────────────────────────────────────────────────
export const users = sqliteTable('users', {
    id: text('id').primaryKey(),
    username: text('username').notNull().unique(),
    email: text('email').notNull().unique(),
    passwordHash: text('password_hash').notNull(),
    role: text('role').notNull().default('user'),       // 'user' | 'admin'
    isBanned: integer('is_banned').default(0),
    lastActiveAt: text('last_active_at'),
    refreshToken: text('refresh_token'),
    reportsCount: integer('reports_count').default(0),
    createdAt: text('created_at').default(sql`(datetime('now'))`),
    updatedAt: text('updated_at').default(sql`(datetime('now'))`),
});

// ─── TABLE 2: REPORTS ───────────────────────────────────────────────────────
export const reports = sqliteTable('reports', {
    id: text('id').primaryKey(),
    authorId: text('author_id').references(() => users.id),
    type: text('type').notNull(),                       // 'accident'|'congestion'|'roadblock'|'waterlogging'|'other'
    congestionLevel: text('congestion_level').notNull().default('medium'),  // 'light'|'medium'|'heavy'
    description: text('description').notNull(),
    imageUrl: text('image_url'),
    imageFileId: text('image_file_id'),
    latitude: real('latitude').notNull(),
    longitude: real('longitude').notNull(),
    locationName: text('location_name'),
    status: text('status').notNull().default('active'), // 'active'|'resolved'|'expired'|'flagged'
    upvotes: integer('upvotes').default(0),
    isAnonymous: integer('is_anonymous').default(0),
    expiresAt: text('expires_at'),
    createdAt: text('created_at').default(sql`(datetime('now'))`),
    updatedAt: text('updated_at').default(sql`(datetime('now'))`),
});

// ─── TABLE 3: ALERTS ────────────────────────────────────────────────────────
export const alerts = sqliteTable('alerts', {
    id: text('id').primaryKey(),
    reportId: text('report_id').references(() => reports.id),
    message: text('message').notNull(),
    alertType: text('alert_type').notNull(),
    latitude: real('latitude').notNull(),
    longitude: real('longitude').notNull(),
    createdAt: text('created_at').default(sql`(datetime('now'))`),
});

// ─── TABLE 4: FEEDBACK ──────────────────────────────────────────────────────
export const feedback = sqliteTable('feedback', {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    email: text('email').notNull(),
    message: text('message').notNull(),
    isRead: integer('is_read').default(0),
    createdAt: text('created_at').default(sql`(datetime('now'))`),
});

// ─── TABLE 5: ADMIN LOGS ────────────────────────────────────────────────────
export const adminLogs = sqliteTable('admin_logs', {
    id: text('id').primaryKey(),
    adminId: text('admin_id').references(() => users.id),
    action: text('action').notNull(),                   // 'DELETE_REPORT'|'FLAG_REPORT'|etc.
    targetId: text('target_id'),
    targetModel: text('target_model'),
    details: text('details'),                           // JSON string
    createdAt: text('created_at').default(sql`(datetime('now'))`),
});

// ─── TABLE 6: UPVOTES (junction) ────────────────────────────────────────────
export const upvotes = sqliteTable('upvotes', {
    userId: text('user_id').notNull().references(() => users.id),
    reportId: text('report_id').notNull().references(() => reports.id),
    createdAt: text('created_at').default(sql`(datetime('now'))`),
});

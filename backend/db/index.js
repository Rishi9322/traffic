import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from './schema.js';

// Create Turso client
const client = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
});

// Drizzle instance with schema
export const db = drizzle(client, { schema });

// Export raw client for migrations
export { client };

/**
 * Initialize the database by creating tables if they don't exist.
 * Uses raw SQL CREATE TABLE IF NOT EXISTS for portability.
 */
export async function initDB() {
    await client.executeMultiple(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      is_banned INTEGER DEFAULT 0,
      last_active_at TEXT,
      refresh_token TEXT,
      reports_count INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

    CREATE TABLE IF NOT EXISTS reports (
      id TEXT PRIMARY KEY,
      author_id TEXT REFERENCES users(id) ON DELETE CASCADE,
      type TEXT NOT NULL,
      congestion_level TEXT NOT NULL DEFAULT 'medium',
      description TEXT NOT NULL,
      image_url TEXT,
      image_file_id TEXT,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      location_name TEXT,
      status TEXT NOT NULL DEFAULT 'active',
      upvotes INTEGER DEFAULT 0,
      is_anonymous INTEGER DEFAULT 0,
      expires_at TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
    CREATE INDEX IF NOT EXISTS idx_reports_type ON reports(type);
    CREATE INDEX IF NOT EXISTS idx_reports_author_id ON reports(author_id);
    CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at);
    CREATE INDEX IF NOT EXISTS idx_reports_location ON reports(latitude, longitude);

    CREATE TABLE IF NOT EXISTS alerts (
      id TEXT PRIMARY KEY,
      report_id TEXT REFERENCES reports(id) ON DELETE CASCADE,
      message TEXT NOT NULL,
      alert_type TEXT NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_alerts_report_id ON alerts(report_id);
    CREATE INDEX IF NOT EXISTS idx_alerts_created_at ON alerts(created_at);

    CREATE TABLE IF NOT EXISTS feedback (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      message TEXT NOT NULL,
      is_read INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS admin_logs (
      id TEXT PRIMARY KEY,
      admin_id TEXT REFERENCES users(id) ON DELETE SET NULL,
      action TEXT NOT NULL,
      target_id TEXT,
      target_model TEXT,
      details TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_admin_logs_admin_id ON admin_logs(admin_id);
    CREATE INDEX IF NOT EXISTS idx_admin_logs_created_at ON admin_logs(created_at);

    CREATE TABLE IF NOT EXISTS upvotes (
      user_id TEXT NOT NULL,
      report_id TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      PRIMARY KEY (user_id, report_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE
    );
  `);

    console.log('✅ Database initialized successfully');
}

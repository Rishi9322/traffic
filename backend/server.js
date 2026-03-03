import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import { initDB } from './db/index.js';
import { initSocket } from './config/socket.js';
import { globalLimiter } from './middleware/rateLimiter.js';
import { errorHandler } from './middleware/errorHandler.js';
import { startExpireJob } from './jobs/expireReports.js';
import { logger } from './utils/logger.js';
import { normalizeOrigin } from './utils/origin.js';

import authRoutes from './routes/auth.routes.js';
import reportRoutes from './routes/report.routes.js';
import alertRoutes from './routes/alert.routes.js';
import adminRoutes from './routes/admin.routes.js';
import feedbackRoutes from './routes/feedback.routes.js';

const app = express();
const httpServer = createServer(app);
const clientOrigin = normalizeOrigin(process.env.CLIENT_ORIGIN);

// ── Initialize Socket.io ─────────────────────────────────────────────────────
initSocket(httpServer);

// ── Security Middleware ──────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
    origin: clientOrigin,
    credentials: true,
}));

// ── Request Parsing ──────────────────────────────────────────────────────────
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── HTTP Logging ─────────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('dev'));
}

// ── Global Rate Limiter ──────────────────────────────────────────────────────
app.use(globalLimiter);

// ── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString(), env: process.env.NODE_ENV });
});

// ── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/reports', reportRoutes);
app.use('/api/v1/alerts', alertRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/feedback', feedbackRoutes);

// ── 404 Handler ──────────────────────────────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({ success: false, message: `Route ${req.method} ${req.url} not found` });
});

// ── Centralized Error Handler ─────────────────────────────────────────────────
app.use(errorHandler);

// ── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

async function start() {
    try {
        await initDB();
        startExpireJob();

        httpServer.listen(PORT, () => {
            logger.info(`🚀 OSTAS API running on http://localhost:${PORT}`);
            logger.info(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
        });
    } catch (err) {
        logger.error('Failed to start server:', err);
        process.exit(1);
    }
}

start();

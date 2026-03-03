import { getIO } from '../config/socket.js';
import { logger } from '../utils/logger.js';

/**
 * Emit a new report event to all connected Socket.io clients.
 */
export function emitNewReport(report) {
    try {
        getIO().emit('newReport', { report });
    } catch (err) {
        logger.error('Socket emit error (newReport):', err.message);
    }
}

/**
 * Emit a report resolved event.
 */
export function emitReportResolved(reportId) {
    try {
        getIO().emit('reportResolved', { reportId, status: 'resolved' });
    } catch (err) {
        logger.error('Socket emit error (reportResolved):', err.message);
    }
}

/**
 * Emit a report expired event.
 */
export function emitReportExpired(reportId) {
    try {
        getIO().emit('reportExpired', { reportId, status: 'expired' });
    } catch (err) {
        logger.error('Socket emit error (reportExpired):', err.message);
    }
}

/**
 * Emit a report deleted event.
 */
export function emitReportDeleted(reportId) {
    try {
        getIO().emit('reportDeleted', { reportId });
    } catch (err) {
        logger.error('Socket emit error (reportDeleted):', err.message);
    }
}

/**
 * Emit an upvote update event.
 */
export function emitVoteUpdate(reportId, upvotes) {
    try {
        getIO().emit('voteUpdate', { reportId, upvotes });
    } catch (err) {
        logger.error('Socket emit error (voteUpdate):', err.message);
    }
}

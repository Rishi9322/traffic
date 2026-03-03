import { Server } from 'socket.io';

let io;

/**
 * Attach Socket.io to an existing HTTP server and configure CORS.
 * @param {import('http').Server} httpServer
 */
export function initSocket(httpServer) {
    io = new Server(httpServer, {
        cors: {
            origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
            methods: ['GET', 'POST'],
            credentials: true,
        },
    });

    io.on('connection', (socket) => {
        console.log(`🔌 Socket connected: ${socket.id}`);
        socket.on('disconnect', () => {
            console.log(`🔌 Socket disconnected: ${socket.id}`);
        });
    });

    return io;
}

/**
 * Get the initialized io instance (must call initSocket first).
 */
export function getIO() {
    if (!io) throw new Error('Socket.io not initialized — call initSocket() first');
    return io;
}

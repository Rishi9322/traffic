import { createLogger, format, transports } from 'winston';

const { combine, timestamp, colorize, printf, json } = format;

const devFormat = printf(({ level, message, timestamp, ...meta }) => {
    const metaStr = Object.keys(meta).length ? `\n${JSON.stringify(meta, null, 2)}` : '';
    return `${timestamp} [${level}]: ${message}${metaStr}`;
});

export const logger = createLogger({
    level: process.env.NODE_ENV === 'production' ? 'warn' : 'debug',
    format:
        process.env.NODE_ENV === 'production'
            ? combine(timestamp(), json())
            : combine(timestamp({ format: 'HH:mm:ss' }), colorize(), devFormat),
    transports: [
        new transports.Console(),
        ...(process.env.NODE_ENV === 'production'
            ? [new transports.File({ filename: 'logs/error.log', level: 'error' })]
            : []),
    ],
});

// server/src/utils/logger.ts
import winston from 'winston';

// Define log levels
const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
};

// Define colors for each level
const colors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'white',
};

winston.addColors(colors);

// Simple console-only format
const format = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
    winston.format.colorize({ all: true }),
    winston.format.printf(
        (info: any) => `${info.timestamp} ${info.level}: ${info.message}`
    )
);

// Create logger with only Console transport
export const logger = winston.createLogger({
    level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
    levels,
    format,
    transports: [
        new winston.transports.Console()
    ],
});

// Helper functions
export const logRequest = (req: any, res: any, next: any) => {
    logger.http(`${req.method} ${req.url} - IP: ${req.ip}`);
    next();
};

export const logDatabase = (operation: string, collection: string, data?: any) => {
    logger.debug(`Database ${operation} on ${collection}`, data);
};

export const logError = (error: Error, context?: string) => {
    logger.error(`[${context || 'APP'}] ${error.message}`, {
        stack: error.stack,
        context,
    });
};

// Export stream for Morgan (optional)
export const stream = {
    write: (message: string) => {
        logger.http(message.trim());
    },
};
import winston from 'winston';

// Define log levels
const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
};
// Define log level based on environment
const level = () => {
    const env = process.env.NODE_ENV || 'development';
    return env === 'development' ? 'debug' : 'warn';
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

// Define format for logs
const format = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
    winston.format.colorize({ all: true }),
    winston.format.printf(
        (info: any) => `${info.timestamp} ${info.level}: ${info.message}`
    )
);

// ✅ FIX: Use explicit typing for transports array
// TypeScript will infer the correct union type
const transports: winston.transport[] = [
    new winston.transports.Console(),
];

// ✅ Only add file transports in development (and ensure logs directory exists)
if (process.env.NODE_ENV === 'development') {
    const fs = require('fs');
    const path = require('path');
    const logDir = path.join(process.cwd(), 'logs');
    
    if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
    }
    
    transports.push(
        new winston.transports.File({
            filename: path.join(logDir, 'error.log'),
            level: 'error',
        }),
        new winston.transports.File({
            filename: path.join(logDir, 'all.log'),
        })
    );
}

// Create logger
export const logger = winston.createLogger({
    level: level(),
    levels,
    format,
    transports,
});

// Create stream for Morgan HTTP logging
export const stream = {
    write: (message: string) => {
        logger.http(message.trim());
    },
};

// Export a function to log API requests
export const logRequest = (req: any, res: any, next: any) => {
    logger.info(`${req.method} ${req.url} - IP: ${req.ip}`);
    next();
};

// Export a function to log database operations
export const logDatabase = (operation: string, collection: string, data?: any) => {
    logger.debug(`Database ${operation} on ${collection}`, data);
};

// Export a function to log errors with context
export const logError = (error: Error, context?: string) => {
    logger.error(`[${context || 'APP'}] ${error.message}`, {
        stack: error.stack,
        context,
    });
};
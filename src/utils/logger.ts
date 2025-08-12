import winston from 'winston';

// Custom format for structured JSON logging
const jsonFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Create logger instance
export const logger = winston.createLogger({
  level: process.env['LOG_LEVEL'] || 'info',
  format: jsonFormat,
  defaultMeta: { service: 'discord-ai-bot' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

// Helper function to create request-specific logger
export const createRequestLogger = (requestId: string, userId?: string, guildId?: string) => {
  return logger.child({
    requestId,
    userId,
    guildId
  });
};

// Log levels: ERROR, WARN, INFO, DEBUG
// Required log fields: timestamp, level, message, requestId, userId, guildId

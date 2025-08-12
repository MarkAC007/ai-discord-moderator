import dotenv from 'dotenv';
import { createServer } from 'http';
import { Bot } from './bot';
import { logger } from './utils/logger';

// Load environment variables
dotenv.config();

// Validate required environment variables
const requiredEnvVars = ['DISCORD_BOT_TOKEN', 'DISCORD_APP_ID', 'OPENAI_API_KEY'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    logger.error(`Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
}

// Create health check server
const port = process.env['PORT'] || 3000;
const server = createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }));
  } else {
    res.writeHead(404);
    res.end();
  }
});

// Start health check server
server.listen(port, () => {
  logger.info(`Health check server listening on port ${port}`);
});

// Initialize and start the bot
const bot = new Bot();
bot.start().catch((error) => {
  logger.error('Failed to start bot:', error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  logger.info('Received SIGINT, shutting down gracefully...');
  await bot.destroy();
  server.close(() => {
    logger.info('Health check server closed');
    process.exit(0);
  });
});

process.on('SIGTERM', async () => {
  logger.info('Received SIGTERM, shutting down gracefully...');
  await bot.destroy();
  server.close(() => {
    logger.info('Health check server closed');
    process.exit(0);
  });
});

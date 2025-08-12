# Discord AI Bot

A production-ready Discord AI bot with GPT-5 integration, built with TypeScript and deployable via Docker Compose.

## Features

- 🤖 **AI-Powered Chat**: Ask questions and get intelligent responses using OpenAI's GPT-5
- ⚡ **Fast Response**: Median latency < 8 seconds for standard queries
- 🛡️ **Rate Limiting**: 10 requests per user per minute to prevent abuse
- 📊 **Usage Tracking**: Monitor token usage and response times
- 🐳 **Docker Ready**: Easy deployment with Docker Compose
- 📝 **Structured Logging**: JSON logs for easy monitoring and debugging
- 🔧 **Minimal Permissions**: Only requires basic Discord bot permissions

## Commands

- `/ask [prompt]` - Ask the AI anything (max 2000 characters)
- `/help` - Show available commands and usage
- `/ping` - Check bot responsiveness and latency

## Quick Start

### Prerequisites

- Node.js 20+ or Docker & Docker Compose
- Discord Bot Token and Application ID
- OpenAI API Key with GPT-5 access

### 1. Create Discord Bot

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application
3. Go to "Bot" section and create a bot
4. Copy the bot token and application ID
5. Use this invite URL (replace YOUR_APP_ID):
   ```
   https://discord.com/api/oauth2/authorize?client_id=YOUR_APP_ID&permissions=2147485696&scope=bot%20applications.commands
   ```

### 2. Get OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Create an account and get an API key
3. Ensure you have access to GPT-5 model

### 3. Deploy with Docker (Recommended)

#### Option A: Automated Deployment Script

**Linux/macOS:**
```bash
# Clone the repository
git clone <repository-url>
cd discord-ai-bot

# Run deployment script
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

**Windows:**
```cmd
# Clone the repository
git clone <repository-url>
cd discord-ai-bot

# Run deployment script
scripts\deploy.bat
```

#### Option B: Manual Deployment

```bash
# Clone the repository
git clone <repository-url>
cd discord-ai-bot

# Copy environment file
cp env.example .env

# Edit .env with your credentials
nano .env

# Start the bot
docker-compose up -d

# Check logs
docker-compose logs -f bot
```

### 4. Deploy Locally

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Copy environment file
cp env.example .env

# Edit .env with your credentials
nano .env

# Start the bot
npm start
```

## Environment Variables

### Required
- `DISCORD_BOT_TOKEN` - Your Discord bot token
- `DISCORD_APP_ID` - Your Discord application ID
- `OPENAI_API_KEY` - Your OpenAI API key

### Optional
- `LOG_LEVEL` - Log level (debug, info, warn, error) - Default: info
- `NODE_ENV` - Environment (development, production) - Default: production
- `PORT` - Health check port - Default: 3000

## Docker Commands

```bash
# Start the bot
docker-compose up -d

# Stop the bot
docker-compose down

# View logs
docker-compose logs -f bot

# Restart the bot
docker-compose restart bot

# Update and restart
docker-compose pull
docker-compose up -d
```

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Lint code
npm run lint

# Format code
npm run format
```

## Architecture

The bot follows a simple 3-layer architecture:

1. **Discord Layer**: Handles Discord connection and interactions
2. **Application Layer**: Command handling and business logic
3. **External Services**: OpenAI API integration

### Key Components

- **Bot Client** (`src/bot.ts`): Discord.js client setup and event handling
- **Command Handler**: Validates inputs and routes to appropriate commands
- **AI Service** (`src/services/ai.ts`): OpenAI integration with error handling
- **Logger** (`src/utils/logger.ts`): Structured JSON logging
- **Rate Limiter** (`src/utils/rateLimit.ts`): Per-user rate limiting

## Monitoring

### Health Check
The bot exposes a health check endpoint at `http://localhost:3000/health`

### Logs
All logs are structured JSON and include:
- Request ID for tracing
- User ID and Guild ID for context
- Response times and usage statistics
- Error details with stack traces

### Metrics
- Response time: P50 < 8s, P95 < 15s
- Uptime target: 99% for first month
- Rate limiting: 10 requests per user per minute

## Security

- Bot token and API keys stored as environment variables
- No sensitive data in logs
- Input validation on all commands
- Rate limiting per user
- Minimal Discord permissions required

## Troubleshooting

### Common Issues

1. **Bot not responding to commands**
   - Check if slash commands are registered: `/help`
   - Verify bot has proper permissions
   - Check logs for errors

2. **OpenAI API errors**
   - Verify API key is correct
   - Check if you have GPT-5 access
   - Monitor rate limits

3. **High latency**
   - Check Discord API latency with `/ping`
   - Monitor OpenAI response times in logs
   - Consider server location

### Log Analysis

```bash
# View recent errors
docker-compose logs bot | grep ERROR

# Monitor response times
docker-compose logs bot | grep "AI response generated"

# Check rate limiting
docker-compose logs bot | grep "Rate limit exceeded"
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review the logs for error details
3. Open an issue on GitHub

## Roadmap

### v1.1 (2 weeks after v1.0)
- Model switching commands
- Basic web search
- Response streaming

### v1.2 (Month 2)
- Channel summarization
- Image analysis
- Advanced configuration

### v2.0 (Month 3-4)
- Multiple reply modes
- Per-channel settings
- Personality presets
- Web search allowlisting

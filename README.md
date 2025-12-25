# Discord AI Bot

<!-- Build & Deploy -->
[![CI](https://img.shields.io/github/actions/workflow/status/MarkAC007/ai-discord-moderator/test.yml?branch=main&label=CI&logo=github)](https://github.com/MarkAC007/ai-discord-moderator/actions/workflows/test.yml)
[![Docker Build](https://img.shields.io/github/actions/workflow/status/MarkAC007/ai-discord-moderator/docker-build.yml?branch=main&label=Docker&logo=docker)](https://github.com/MarkAC007/ai-discord-moderator/actions/workflows/docker-build.yml)

<!-- Security -->
[![Security Scan](https://img.shields.io/github/actions/workflow/status/MarkAC007/ai-discord-moderator/security.yml?branch=main&label=Security&logo=github)](https://github.com/MarkAC007/ai-discord-moderator/actions/workflows/security.yml)
[![CodeQL](https://img.shields.io/github/actions/workflow/status/MarkAC007/ai-discord-moderator/codeql.yml?branch=main&label=CodeQL&logo=github)](https://github.com/MarkAC007/ai-discord-moderator/actions/workflows/codeql.yml)
[![Semgrep](https://img.shields.io/github/actions/workflow/status/MarkAC007/ai-discord-moderator/semgrep.yml?branch=main&label=Semgrep&logo=semgrep)](https://github.com/MarkAC007/ai-discord-moderator/actions/workflows/semgrep.yml)
[![Gitleaks](https://img.shields.io/github/actions/workflow/status/MarkAC007/ai-discord-moderator/gitleaks.yml?branch=main&label=Gitleaks&logo=git)](https://github.com/MarkAC007/ai-discord-moderator/actions/workflows/gitleaks.yml)
[![License Check](https://img.shields.io/github/actions/workflow/status/MarkAC007/ai-discord-moderator/license-check.yml?branch=main&label=Licenses&logo=github)](https://github.com/MarkAC007/ai-discord-moderator/actions/workflows/license-check.yml)

<!-- Tech Stack -->
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Docker Pulls](https://img.shields.io/docker/pulls/markac007/discord-ai-bot)](https://hub.docker.com/r/markac007/discord-ai-bot)
[![Docker Image Size](https://img.shields.io/docker/image-size/markac007/discord-ai-bot/latest)](https://hub.docker.com/r/markac007/discord-ai-bot)

<!-- Project Info -->
[![GitHub Release](https://img.shields.io/github/v/release/MarkAC007/ai-discord-moderator)](https://github.com/MarkAC007/ai-discord-moderator/releases/latest)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![Last Commit](https://img.shields.io/github/last-commit/MarkAC007/ai-discord-moderator)](https://github.com/MarkAC007/ai-discord-moderator/commits/main)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/MarkAC007/ai-discord-moderator/pulls)

A production-ready Discord AI bot with GPT-5 integration, built with TypeScript and deployable via Docker Compose. Features multi-turn conversations with memory and intelligent context management.

## Features

- 🤖 **AI-Powered Chat**: Ask questions and get intelligent responses using OpenAI's GPT-5
- 💬 **Conversation Memory**: Multi-turn conversations with context awareness
- ⚡ **Fast Response**: Median latency < 8 seconds for standard queries
- 🛡️ **Rate Limiting**: 10 requests per user per minute to prevent abuse
- 📊 **Usage Tracking**: Monitor token usage and response times
- 🐳 **Docker Ready**: Easy deployment with Docker Compose and Docker Hub
- 📝 **Structured Logging**: JSON logs for easy monitoring and debugging
- 🔧 **Minimal Permissions**: Only requires basic Discord bot permissions

## Commands

- `/ask [prompt]` - Ask the AI anything with conversation memory (max 2000 characters)
- `/conversation clear` - Clear your conversation history and start fresh
- `/conversation info` - Show information about your current conversation
- `/help` - Show available commands and usage
- `/ping` - Check bot responsiveness and latency
 - `/summarize` - Summarize channel history over a selected time window

## Quick Start

### Prerequisites

- Docker & Docker Compose (recommended) or Node.js 20+
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

#### Option A: Using Docker Hub Image (Fastest)

```bash
# Clone the repository
git clone <repository-url>
cd discord-ai-bot

# Copy environment file
cp .env.example .env

# Edit .env with your credentials
nano .env

# Start the bot using Docker Hub image
docker-compose up -d

# Check logs
docker-compose logs -f bot
```

#### Option B: Automated Deployment Script

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

#### Option C: Manual Docker Build

```bash
# Clone the repository
git clone <repository-url>
cd discord-ai-bot

# Copy environment file
cp .env.example .env

# Edit .env with your credentials
nano .env

# Build and start the bot
docker-compose up -d --build

# Check logs
docker-compose logs -f bot
```

### 4. Deploy Locally (Development)

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Copy environment file
cp .env.example .env

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
- `DEFAULT_COUNTRY_CODE` - Two-letter country code for web search localization (e.g., GB, US) - Default: GB
- `MAX_COMPLETION_TOKENS` - Max output tokens for responses (chat and web search) - Default: 4000

## Docker Information

### Docker Hub Image

The bot is available on Docker Hub: `markac007/discord-ai-bot`

```bash
# Pull the latest image
docker pull markac007/discord-ai-bot:latest

# Pull a specific version
docker pull markac007/discord-ai-bot:v1.0.0
```

### Docker Compose Configuration

The `docker-compose.yml` file includes:
- **Multi-stage build** for optimized production image
- **Health checks** for monitoring
- **Log rotation** (10MB max, 3 files)
- **Graceful shutdown** handling
- **Non-root user** for security

### Docker Commands

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

# Check container status
docker-compose ps

# View resource usage
docker stats
```

### Docker Image Details

- **Base Image**: Node.js 20 Alpine
- **Size**: ~150MB (optimized)
- **Architecture**: Multi-stage build
- **Security**: Non-root user, minimal permissions
- **Health Check**: HTTP endpoint on port 3000

## Conversation Features

### Multi-Turn Conversations

The bot now supports **true conversation memory**:

- **Per-user threads**: Each user has their own conversation thread
- **Context awareness**: AI remembers previous messages in the conversation
- **Smart truncation**: Keeps last 20 messages to stay within token limits
- **Auto-cleanup**: Conversations expire after 30 minutes of inactivity

### Example Conversation Flow

```
User: /ask prompt: What is Python?
Bot: Python is a programming language...

User: /ask prompt: What are its main features?
Bot: Based on our conversation about Python, its main features include...
```

### Channel Summary

The bot can summarize channel history with `/summarize`.

```
/summarize range: 24h channel: #general include_bots: false max_messages: 1000 visibility: ephemeral
```

Options:
- `range` (required): one of `1h`, `6h`, `24h`, `3d`, `7d`, `30d`
- `channel` (optional): defaults to current channel; text-based channels/threads only
- `include_bots` (optional, default `false`)
- `max_messages` (optional, default `1000`, min `100`, max `5000`)
- `visibility` (optional, default `ephemeral`): `ephemeral` or `public` (requires Manage Server)

Output includes an overview, key topics, and basic stats (messages scanned, participants).

### Conversation Management

- **`/conversation clear`** - Start a fresh conversation
- **`/conversation info`** - View conversation statistics
- **Automatic cleanup** - Old conversations are automatically removed
- **Memory limits** - Prevents token overflow with smart truncation

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
- **Conversation Manager** (`src/services/conversation.ts`): Multi-turn conversation handling
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
- Conversation information
- Error details with stack traces

### Metrics
- Response time: P50 < 8s, P95 < 15s
- Uptime target: 99% for first month
- Rate limiting: 10 requests per user per minute
- Conversation memory: Last 20 messages per user

## Security

- Bot token and API keys stored as environment variables
- No sensitive data in logs
- Input validation on all commands
- Rate limiting per user
- Minimal Discord permissions required
- Non-root Docker container
- Multi-stage Docker build for smaller attack surface

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

4. **Conversation not working**
   - Check if conversation memory is being used: `/conversation info`
   - Verify the bot is using conversation history in logs
   - Try clearing and restarting: `/conversation clear`

### Log Analysis

```bash
# View recent errors
docker-compose logs bot | grep ERROR

# Monitor response times
docker-compose logs bot | grep "AI response generated"

# Check rate limiting
docker-compose logs bot | grep "Rate limit exceeded"

# Monitor conversations
docker-compose logs bot | grep "Message added to conversation"

# Check conversation cleanup
docker-compose logs bot | grep "Cleaned up old conversations"
```

### Docker Troubleshooting

```bash
# Check container health
docker-compose ps

# View container logs
docker-compose logs bot

# Restart container
docker-compose restart bot

# Check resource usage
docker stats

# Verify image
docker images markac007/discord-ai-bot
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
- Discord thread creation for conversations
- Model switching commands
- Basic web search
- Response streaming

### v1.2 (Month 2)
- Channel summarization
- Image analysis
- Advanced configuration
- Conversation export/import

### v2.0 (Month 3-4)
- Multiple reply modes
- Per-channel settings
- Personality presets
- Web search allowlisting
- Conversation analytics

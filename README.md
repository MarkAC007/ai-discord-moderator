# Discord AI Knowledge Bot 🤖

A lightweight, production-ready Discord bot powered by OpenAI's GPT-5 that brings intelligent AI assistance to your server with minimal setup and maximum reliability.

## ✨ Features

**v1.0 (Current)**
- 🤖 **AI Chat**: Ask anything with `/ask` and get intelligent responses powered by GPT-5
- 🚀 **Lightning Fast**: Deploy in under 30 minutes with Docker
- 🛡️ **Production Ready**: Built-in error handling, rate limiting, and structured logging
- 🔧 **Simple Setup**: Just 3 environment variables and you're ready to go

**Coming Soon** 📅
- **v1.1**: Model switching and basic web search
- **v1.2**: Channel summarization and image analysis  
- **v2.0**: Advanced features and customization
- **v3.0**: RAG, moderation, and enterprise features

📋 **[View Full Roadmap →](docs/ROADMAP.md)**

## 🎯 Project Philosophy

This bot is built on three core principles:

1. **Simplicity First**: Start with what works, iterate on what matters
2. **Production Ready**: Every feature is designed for real-world reliability
3. **Developer Friendly**: Clear documentation, easy deployment, minimal complexity

We believe AI bots should be accessible to everyone, not just large organizations with dedicated DevOps teams.

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose installed
- Discord Bot Token and Application ID
- OpenAI API Key with GPT-5 access

### 1. Clone & Setup
```bash
git clone https://github.com/your-org/discord-ai-bot.git
cd discord-ai-bot
cp .env.example .env
```

### 2. Configure Environment
Edit `.env` with your credentials:
```bash
DISCORD_BOT_TOKEN=your_bot_token_here
DISCORD_APP_ID=your_app_id_here
OPENAI_API_KEY=your_openai_key_here
```

### 3. Deploy
```bash
docker-compose up -d
```

### 4. Invite to Server
Use this URL (replace `YOUR_APP_ID`):
```
https://discord.com/api/oauth2/authorize?client_id=YOUR_APP_ID&permissions=2147485696&scope=bot%20applications.commands
```

### 5. Test
Try `/ping` to verify the bot is working, then `/ask` to start chatting!

## 📋 Available Commands

| Command | Description | Example |
|---------|-------------|---------|
| `/ask` | Ask the AI anything | `/ask What's the weather like?` |
| `/help` | Show available commands | `/help` |
| `/ping` | Check bot status | `/ping` |

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Discord API   │───▶│   Bot Client    │───▶│  Command Handler│
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                       │
                                                       ▼
                                              ┌─────────────────┐
                                              │   AI Service    │
                                              └─────────────────┘
                                                       │
                                                       ▼
                                              ┌─────────────────┐
                                              │  OpenAI API     │
                                              └─────────────────┘
```

- **Simple & Reliable**: 3-layer architecture with clear separation of concerns
- **No Database**: Stateless design for easy scaling and deployment
- **Docker Native**: Containerized for consistent environments

## 🔧 Configuration

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DISCORD_BOT_TOKEN` | ✅ | - | Your Discord bot token |
| `DISCORD_APP_ID` | ✅ | - | Your Discord application ID |
| `OPENAI_API_KEY` | ✅ | - | Your OpenAI API key |
| `LOG_LEVEL` | ❌ | `info` | Logging level (debug, info, warn, error) |
| `NODE_ENV` | ❌ | `production` | Environment (development, production) |
| `PORT` | ❌ | `3000` | Health check port |

### Rate Limiting
- **Per User**: 10 requests per minute
- **Global**: Configurable via environment variables
- **Graceful Degradation**: Clear error messages when limits are hit

## 📊 Monitoring & Logs

### Health Checks
```bash
# Check if bot is running
curl http://localhost:3000/health

# View logs
docker-compose logs -f bot
```

### Log Format
All logs are structured JSON for easy parsing:
```json
{
  "timestamp": "2025-01-10T12:00:00.000Z",
  "level": "info",
  "message": "Command executed",
  "requestId": "abc123",
  "userId": "123456789",
  "guildId": "987654321",
  "command": "ask"
}
```

## 🛠️ Development

### Local Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

### Project Structure
```
discord-ai-bot/
├── src/
│   ├── index.ts           # Entry point
│   ├── bot.ts            # Discord client setup
│   ├── commands/         # Slash command handlers
│   ├── services/         # External service integrations
│   └── utils/            # Utilities and helpers
├── Dockerfile
├── docker-compose.yml
└── README.md
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📈 Roadmap

Our development roadmap is designed to deliver value incrementally:

- **[v1.0]** 🎯 **Core AI Chat** (Current) - Reliable AI conversations
- **[v1.1]** 🔄 **Model Switching** - Choose your AI model
- **[v1.2]** 📊 **Summarization** - Channel and thread summaries  
- **[v2.0]** 🎨 **Advanced Features** - Customization and control
- **[v3.0]** 🏢 **Enterprise Ready** - RAG, moderation, and more

📋 **[View Detailed Roadmap →](docs/ROADMAP.md)**

## 🐛 Troubleshooting

### Common Issues

**Bot doesn't respond to commands**
- Check if the bot is online in your server
- Verify slash commands are registered: `/help` should work
- Check logs: `docker-compose logs bot`

**"Invalid token" error**
- Ensure `DISCORD_BOT_TOKEN` is correct and not expired
- Check that the bot has the required permissions

**OpenAI API errors**
- Verify your API key has GPT-5 access
- Check your OpenAI account for rate limits or billing issues

**High latency**
- Monitor logs for timeout errors
- Consider upgrading your OpenAI plan for higher rate limits

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [discord.js](https://discord.js.org/) and [OpenAI](https://openai.com/)
- Inspired by the need for simple, reliable AI bots
- Thanks to the Discord and OpenAI communities

---

**Ready to bring AI to your Discord server?** 🚀

Start with our [Quick Start Guide](#-quick-start) or check out the [detailed roadmap](docs/ROADMAP.md) to see what's coming next!

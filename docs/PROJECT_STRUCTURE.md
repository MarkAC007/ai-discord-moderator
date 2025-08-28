## Project Structure

A production-ready Discord AI bot with GPT-5 integration. Built in TypeScript, compiled to `dist/`, containerized via Docker, and shipped to Docker Hub with GitHub Actions.

### Tech Stack
- **Runtime**: Node.js 20
- **Language**: TypeScript 5
- **Discord SDK**: `discord.js@14`
- **AI**: `openai@4`
- **Logging**: `winston`
- **Testing**: Jest + ts-jest
- **Container**: Docker (multi-stage), Docker Compose

### Directory Layout
```text
.
├─ src/                       # TypeScript source
│  ├─ index.ts                # Process bootstrap + health server
│  ├─ bot.ts                  # Discord client, events, slash command registry
│  ├─ commands/               # Slash command implementations
│  │  ├─ ask.ts               # /ask (AI chat; optional web search)
│  │  ├─ conversation.ts      # /conversation (clear, info)
│  │  ├─ help.ts              # /help
│  │  ├─ model.ts             # /model (list/current/set)
│  │  └─ ping.ts              # /ping
│  ├─ services/
│  │  ├─ ai.ts                # OpenAI client + response generation
│  │  ├─ conversation.ts      # In-memory conversation manager
│  │  └─ modelManager.ts      # Per-guild model selection, persisted to disk
│  ├─ utils/
│  │  ├─ logger.ts            # Winston logger (JSON + console)
│  │  └─ rateLimit.ts         # 10 req/user/min rate limiter
│  └─ __tests__/              # Unit tests
│     └─ rateLimit.test.ts
├─ dist/                      # Transpiled JS, maps, and d.ts (build output)
├─ data/
│  └─ model-config.json       # Persisted model preferences (created/managed at runtime)
├─ docs/                      # Documentation
│  ├─ GITHUB_ACTIONS.md
│  ├─ PRD.md
│  └─ ROADMAP.md
├─ scripts/
│  ├─ deploy.sh               # Optional helper (Linux/macOS)
│  └─ deploy.bat              # Optional helper (Windows)
├─ Dockerfile                 # Multi-stage image (builder + runtime)
├─ docker-compose.yml         # One-service stack, healthcheck, logging
├─ jest.config.js             # Jest configuration
├─ tsconfig.json              # TypeScript config
├─ env.example                # Required/optional environment variables
└─ package.json               # Scripts and dependencies
```

## Runtime Flow
1. **Process bootstrap**: `src/index.ts`
   - Loads `.env` with `dotenv`
   - Validates required vars: `DISCORD_BOT_TOKEN`, `DISCORD_APP_ID`, `OPENAI_API_KEY`
   - Starts a lightweight HTTP health server on `PORT` (default 3000)
   - Instantiates `Bot` and calls `start()`; handles graceful shutdown (SIGINT/SIGTERM)

2. **Discord client**: `src/bot.ts`
   - Creates `discord.js` `Client` with `Guilds` intent (slash commands only)
   - Registers in-memory command map from `src/commands/*`
   - On startup: tests OpenAI connectivity, logs in to Discord, then registers slash commands globally
   - Handles `InteractionCreate` and dispatches to `execute()` per command with error handling

3. **Commands**: `src/commands/*`
   - `/ask` → rate limit check → conversation history → `AIService` generate response → embed reply; optional web search path
   - `/conversation` → `clear` and `info` using `ConversationManager`
   - `/model` → list/current/set per-guild model via `modelManager` (admin gated)
   - `/help`, `/ping` → information and latency

4. **Services**
   - `AIService` (`src/services/ai.ts`): wraps OpenAI; supports chat completions and an alternative web-search flow; returns content + token usage
   - `ConversationManager` (`src/services/conversation.ts`): per-user threads, last-20 messages, 30m expiry, background cleanup
   - `modelManager` (`src/services/modelManager.ts`): supported models, default model, per-guild override persisted to `data/model-config.json`

5. **Utilities**
   - `logger` (`src/utils/logger.ts`): Winston JSON logger with console transport; `createRequestLogger()` for request-scoped metadata
   - `rateLimiter` (`src/utils/rateLimit.ts`): fixed-window (1m) in-memory limiter; background cleanup

## Configuration
- **Environment variables** (see `env.example`):
  - `DISCORD_BOT_TOKEN` (required)
  - `DISCORD_APP_ID` (required)
  - `OPENAI_API_KEY` (required)
  - `LOG_LEVEL` (default `info`)
  - `NODE_ENV` (default `production`)
  - `PORT` (default `3000`)
  - `DEFAULT_COUNTRY_CODE` (default `GB`) for web search localization
  - `MAX_COMPLETION_TOKENS` (default `4000`)

## Build, Run, and Scripts
- **Build output**: `tsc` compiles `src/**/*` → `dist/**/*` (with `.d.ts` and sourcemaps)
- **Entrypoint**: `package.json` sets `main`/`start` to `dist/index.js`
- **Scripts**:
  - `npm run build`: TypeScript compile
  - `npm start`: Node run built app
  - `npm run dev`: `ts-node` for local development
  - `npm test`: Jest test suite

## Docker & Deploy
- **Dockerfile**: multi-stage build on `node:20-alpine`
  - Builder installs dev deps and runs `npm run build`
  - Runtime installs prod deps only; copies `dist/`; runs as non-root user; exposes `3000`; healthcheck on `/health`
- **docker-compose.yml**:
  - Single `bot` service using published image `markac007/discord-ai-bot:latest`
  - Env passthrough for required keys
  - Healthcheck and JSON-file log rotation
  - Port map `${PORT:-3000}:3000` for health endpoint

## CI/CD
- **GitHub Actions**: `.github/workflows/docker-build.yml`
  - Builds multi-arch images (amd64, arm64)
  - Tags on PRs (`pr-<number>`), pushes to `latest` on main, and semver tags on releases
  - Pushes to Docker Hub `markac007/discord-ai-bot`

## Testing
- **Jest** (`jest.config.js`):
  - `ts-jest` preset, Node environment
  - Tests under `src/__tests__/`
  - Coverage reports to `coverage/`
  - Sample test: `rateLimit.test.ts`

## Observability & Operations
- **Health**: `GET /health` on `PORT` returns `{ status: "ok", timestamp }`
- **Logging**: Structured JSON (timestamp, level, message, requestId, userId, guildId)
- **Metrics (via logs)**: response times, token usage, conversation stats
- **Rate limits**: 10 requests per user per minute; feedback embedded in `/ask` replies

## Data Persistence
- `data/model-config.json` stores:
  - `version`, `defaultModel`, and `guildModels` map
  - Created/updated by `modelManager` with atomic write (`*.tmp` then rename)

## Security Notes
- Secrets via environment variables only; no secrets in repo
- Non-root Docker user; minimal Discord intents; input validation on commands



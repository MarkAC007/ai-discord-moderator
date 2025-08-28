# Tech Stack

## Context

Global tech stack defaults for Agent OS projects, overridable in project-specific `.agent-os/product/tech-stack.md`.

## Full-Scale Applications (Traditional)

### Frontend Stack
- Frontend Framework: React 18+ with TypeScript
- Meta Framework: Next.js 14+ (App Router)
- Build Tool: Vite (for pure React) or Next.js built-in (for Next.js projects)
- Language: TypeScript 5.0+
- Package Manager: npm
- Node Version: 22 LTS
- CSS Framework: TailwindCSS 4.0+
- UI Components: shadcn/ui or Instrumental Components
- Icons: Lucide React components
- Font Provider: Google Fonts via Next.js font optimization
- Component Library: Leverages React ecosystem
- Styling: TailwindCSS for rapid iteration

### Backend Stack
- Backend Service: Supabase
- Database: PostgreSQL (via Supabase)
- Authentication: Supabase Auth
- File Storage: Supabase Storage
- Real-time: Supabase Realtime
- Edge Functions: Supabase Edge Functions (Deno)
- API: Auto-generated REST + GraphQL from Supabase

### Development & Deployment
- Development Environment: Local with Supabase CLI
- Hosting Options: Netlify
- Database Hosting: Supabase Cloud
- CDN: Integrated with hosting platform
- CI/CD Platform: GitHub Actions or Netlify/platform-native
- Environment Management: Supabase projects (dev/staging/prod)


## Desktop Applications (Electron)

### Frontend Stack
- Electron Framework: Electron 28+
- Frontend Framework: React 18+ with TypeScript
- Build Tool: Vite with Electron integration
- Language: TypeScript 5.0+
- Package Manager: npm
- Node Version: 22 LTS
- CSS Framework: TailwindCSS 4.0+
- UI Components: shadcn/ui or Instrumental Components
- Icons: Lucide React components
- State Management: Zustand or Redux Toolkit

### Electron-Specific Tools
- Electron Builder: For packaging and distribution
- Electron Forge: Alternative build and packaging toolchain
- Main Process: Node.js with TypeScript
- Renderer Process: React + TypeScript
- IPC Communication: Electron's contextBridge API
- Auto-updater: electron-updater
- Security: Context isolation enabled, nodeIntegration disabled

### Backend Integration
- API Communication: REST/GraphQL clients to existing backends
- Database: Local SQLite (via better-sqlite3) or remote via API
- Authentication: Token-based with secure storage
- File System: Native file operations via Electron APIs
- System Integration: Native notifications, menu bars, system tray

### Development & Distribution
- Development Environment: Hot reload with Vite + Electron
- Testing: Playwright for E2E, Jest for unit tests
- Code Signing: Platform-specific certificates
- Distribution Platforms:
  - Windows: Microsoft Store, direct download
  - macOS: Mac App Store, direct download (.dmg)
  - Linux: AppImage, Snap, direct download
- Update Strategy: Auto-update with delta patching
- CI/CD: GitHub Actions with matrix builds for all platforms

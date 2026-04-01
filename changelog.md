# Changelog - VPN User Frontend

## [Unreleased]

### Added
- Multi-theme system (Violet, Teal, Telegram, Light themes)
- Telegram WebApp SDK integration (@tma.js/sdk)
- Framer-motion animations for pages and components
- ThemeSelector component for theme switching
- Auto-detection of Telegram environment
- Support chat page with 2 UI variants (Telegram-like and modern cards)
- Support navigation link in Layout
- Register.tsx password fields for non-Telegram registration
- Email registration verification flow (enter username + email, enter 4-digit code)
- Email link verification via URL param (?verify=token)
- Delete conversation functionality for support chat
- "Обещанный платёж" (promised payment) option: creates connection with grace period without immediate payment
- Warning alert shown when user without paid connections tries to create new connection

### Fixed
- Docker file watcher issue (ENOSPC) by increasing fs.inotify.max_user_watches
- Registration now points to correct bot (@Myth_vpnbot)
- Support route registered in App.tsx
- Badge logic: removed from Support icon, only shows on profile avatar when NOT verified
- Persist telegram_verified in localStorage/sessionStorage
- Support chat unread indicator not updating on refresh
- Support chat closed conversation icon color (was gray for all read, now only closed)
- Support badge "!" not removed when all messages read (now dispatches event to update Layout)
- Backend: Add read_at column migration for support_messages table

### Known Issues
- Bot doesn't use /auth/telegram/callback - breaks registration flow
- No seamless integration between frontend and @Myth_vpnbot bot
- SMTP not configured - verification emails logged to console if SMTP not set

## [2026-03-29] UI Enhancements
- Added ESLint and Prettier configuration
- Updated product.md documentation
- Committed UI improvements (commit 90c9ca9)

## [2026-03-24] Documentation & Tooling
- Added ESLint and Prettier configuration
- Updated product.md documentation

## [2026-03-15] Feature Complete
- Full authentication flow (register, login, restore)
- Connection management UI
- Payment initiation
- Responsive design
- Telegram WebView optimization

## [2026-03-01] Initial Release
- Basic React + TypeScript setup
- Material-UI components
- Mock data services
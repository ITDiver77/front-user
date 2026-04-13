# Changelog - VPN User Frontend

## [2026-04-13] Backend-Calculated Pricing

### Added
- `calculatePrice()` method in paymentService — calls POST /payments/calculate-price
- Per-connection price breakdown display in PaymentInitiationModal and MakePaymentModal

### Changed
- PaymentInitiationModal: removed client-side discount/price logic, uses backend breakdown
- MakePaymentModal: removed DISCOUNTS/getPrice, uses backend calculation
- NewConnectionModal: removed amount from initiatePayment call
- Dashboard, PaymentHistory: removed currentPrice prop from PaymentInitiationModal
- Frontend never sends `amount` — backend is sole source of truth for pricing

## [Unreleased]

### 2026-04-10
- PaymentInitiationModal: use `connection.price` from backend instead of calculating locally
- getDaysRemaining: now returns 1 decimal precision (e.g., 29.9 instead of 29)
- ConnectionCard: displays days remaining with 1 decimal
- Test infrastructure: fixed axios crash in happy-dom via window.location mock fix
- Test infrastructure: replaced MSW HTTP interception with vi.mock() due to MSW/axios v1.7 incompatibility
- Types: `short_id` replaced with `client_uuid` in Connection type (backend API change)
- Types: removed `price` from ConnectionCreateRequest (backend no longer accepts it)

### 2026-04-08
- Aligned all frontend types and API services with central_manager backend contract after gRPC agent migration
- Connection type: added `subscription_url`, `subscription_token`, `status` fields from backend response
- Copy button: now uses `subscription_url` (always available) instead of `connection_string` (often null during async ops)
- ConnectionDetailsModal: shows subscription URL section when available
- connectionService: fixed `changeServer` to use user-scoped endpoint (`/connections/my/{name}/change-server`)
- connectionService: aligned all methods to user-scoped routes (`/connections/my/...`) instead of admin routes
- Types: `PendingEmailChangeResponse` now uses `has_pending_change`/`new_email` matching backend field names
- Types: `TelegramRebindResponse` now only has `link` (backend doesn't return `success`/`rebind_token`)
- Types: `ConversationListItem` added `username`, `first_name`, `last_name`, `deleted_for_user`; removed non-existent `last_message_at`
- Types: removed `price` from `ConnectionUpdateRequest` (only admin can set price)
- Types: removed `telegram_id` from `UserUpdateRequest` (uses dedicated rebind flow)
- Types: added `max_connections` to `ConnectionCreateRequest`; removed `username`/`index` from `ConnectionUpdateRequest`
- Types: `StartEmailChangeResponse` field renamed `email` → `new_email` to match backend
- Profile.tsx: cleaned up dead `rebindToken` polling code (backend rebind no longer uses token-based status)
- MSW mocks: fixed `connections-used` response to use `used` instead of `connections_used`; added `subscription_token`, `subscription_url`, `status` to mock connections

### 2026-04-09
- Added `reenableConnection` service method (POST /connections/my/{name}/reenable)
- Added `getAvailableInbounds` service method (GET /connections/my/{name}/available-inbounds)
- Added `switchInbound` service method (POST /connections/my/{name}/switch-inbound)
- Added `getReferrals` service method (GET /users/me/referrals)
- Added types: Inbound, SwitchInboundRequest, SwitchInboundResponse, ReenableConnectionResponse, ReferralsResponse
- Added MSW mock handlers for all 4 new endpoints
- ConnectionDetailsModal: added re-enable button for disabled connections
- ConnectionDetailsModal: added available inbounds section showing protocol/tag/port for active connections
- ConnectionDetailsModal: added switch inbound button per inbound
- Added 10 new i18n keys (en + ru) for re-enable and inbound features

### 2026-04-05
- Implemented save credentials feature on Login page — checkbox defaults to enabled, saves username+password to localStorage (base64 encoded) on successful login, auto-fills on next visit. Unchecking clears stored credentials.
- Fixed hardcoded colors in Support.tsx — replaced #e8f0fe with grey.100, grey.300/500 with action.disabled tokens, grey.50 with grey.100 for dark theme compatibility
- Fixed getContrastText() hex color parsing bug in Support.tsx — substring indices for green and blue channels were wrong, causing incorrect text contrast on chat bubbles
- Added /auth/callback public route to App.tsx — lazy-loaded AuthCallback page for token-based auto-login
- Created AuthCallback.tsx page — reads token from URL params, exchanges for JWT via loginByToken, sets auth state and redirects to dashboard
- Added `loginByToken()` method to authService.ts — calls POST /auth/login-by-token, returns LoginByTokenResponse

### Security & Code Quality (2026-04-05)

#### Security
- nginx.conf: Repeated all security headers (X-Frame-Options, X-Content-Type-Options, X-XSS-Protection, Referrer-Policy, Content-Security-Policy) in static assets location block to prevent header override by nginx location inheritance
- nginx.conf: Added HSTS header (Strict-Transport-Security)
- Dockerfile: Fixed healthcheck from `localhost` to `127.0.0.1` (Alpine IPv6 resolution issue)

#### Error Handling & Type Safety
- src/services/api.ts: Added `ApiError` class, DEV-only logging, `isRedirecting` flag to prevent 401 race condition
- All service files (authService, userService, paymentService): Replaced `error: any` / `error as any` with `unknown` type and proper `instanceof Error` checks
- All modal components (ChangeServer, NewConnection, EditConnection, PaymentInitiation): Replaced `err: any` with typed error handling
- Dashboard, Support, PaymentHistory, useConnectionStatus: Replaced `err: any` with typed error handling

#### Shared Validation
- src/utils/validation.ts: Extracted shared `passwordSchema` (8 chars min + uppercase + lowercase + number), `emailRegistrationSchema`, `newPasswordSchema`, `profileSchema`
- Register.tsx: Replaced inline schema with shared `emailRegistrationSchema`
- ForgotPassword.tsx: Replaced inline schema with shared `newPasswordSchema`
- Profile.tsx: Added `profileSchema` with zodResolver to profile form

#### i18n
- en.ts: Added 12 new translation keys for profile/dashboard notifications
- ru.ts: Added matching Russian translations for all 12 keys
- Profile.tsx: Replaced hardcoded English strings with `t()` calls
- Support.tsx: Fixed i18n import path

#### React Best Practices
- AuthContext.tsx: Memoized provider value with `useMemo`, imported `User` type instead of duplicating interface
- Dashboard.tsx: Replaced 4 `alert()` calls with Snackbar notification system, memoized `hasPaidConnections` with `useMemo`
- Profile.tsx: Wrapped `fetchProfile` in `useCallback`
- Support.tsx: Wrapped `fetchConversations` in `useCallback`, fixed `substr` → `substring`
- ChangeServerModal.tsx: Wrapped `fetchServers` in `useCallback`, fixed `useEffect` dependency order
- useTelegramWebApp.ts: Added `offClick()` cleanup in `hideMainButton` and `hideBackButton`
- main.tsx: Replaced non-null assertion with explicit null check for root element

#### Code Cleanup
- Register.tsx: Removed unused `_verifyCodeResponse` watcher, removed unused import
- ForgotPassword.tsx: Removed unused `useEffect` import
- EditConnectionModal.tsx: Removed unused `connectionService` import
- PaymentInitiationModal.tsx: Removed unused `currentPrice` prop, renamed unused `errors` destructure
- Removed 5 unused npm dependencies: `@tma.js/sdk`, `js-cookie`, `react-helmet-async`, `@mui/x-data-grid`, `@types/js-cookie`
- vite.config.ts: Moved hardcoded origin URL to `VITE_ORIGIN` env variable, moved allowedHosts to `VITE_ALLOWED_HOSTS` env variable
- public/vite.svg: Created VPN-themed SVG favicon (was missing, causing 404)

### Added
- Multi-theme system with 25 themes (13 dark, 12 light)
- New light themes: honey, ocean, lavender, sunset, coral, skyBlue, peach, sage
- Restored violet and teal as light themes
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
- Connection management: max_connections slider (1-5 slots), slot-based pricing formula, soft delete with marked_for_deletion flag
- NewConnectionModal: max_connections slider with real-time price calculation based on slot formula
- Email change/update feature in Profile page: users can add or change email with 4-digit verification (API: POST /users/me/email/start, POST /users/me/email/verify, POST /users/me/email/cancel, GET /users/me/email/pending)

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
- Check for paid connections now verifies paydate in future, not just completed payments
- Auto-renew toggle now uses dedicated endpoint (does NOT affect VPN connection enabled state)
- AuthContext: Removed client-side JWT parsing, now uses /users/me API for session restoration
- Register.tsx: Fixed polling race condition by using ref to track pollingStatus without triggering effect re-runs
- Profile.tsx: Wired Telegram relink dialog to backend endpoint (POST /users/me/telegram/rebind)
- NewConnectionModal: Dynamic pricing fetched from API (GET /users/me/price) instead of hardcoded
- PaymentInitiationModal: Fixed first-connection detection using firstConnectionName instead of index===1

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
# Changelog - VPN User Frontend

## [2026-04-30] Rework: Unified Auth Page

### Changed
- Replaced separate `/login` (Login.tsx) and `/register` (Register.tsx) pages with a single unified `AuthPage.tsx`
- Both `/login` and `/register` routes now render `AuthPage` with path-based initial mode detection
- New auth flow: Landing → Login or Register → Method selection → Form
- Login methods: Telegram OAuth (PKCE popup), Telegram Bot (polling), Username & Password (form with remember me + forgot password)
- Register methods: Telegram OAuth (PKCE popup), Telegram Bot (polling), Email (username/email/password form with 4-digit verification code)
- Telegram OAuth and Telegram Bot buttons perform the same action for both login and register (backend auto-detects)
- Referrer ID (`?ref=`) auto-advances to register mode
- Session restore for in-progress registrations (telegram wait, email verify code) preserved via sessionStorage
- Temp credentials display after registration preserved
- Remember me checkbox defaults to checked, credential saving to localStorage preserved

### Files
- `src/pages/AuthPage.tsx` — New unified auth page (replaces Login.tsx + Register.tsx)
- `src/pages/Login.tsx` — Deleted
- `src/pages/Register.tsx` — Deleted
- `src/App.tsx` — Both /login and /register routes render AuthPage
- `src/i18n/translations/en.ts` — 9 new auth keys
- `src/i18n/translations/ru.ts` — 9 new auth keys

## [2026-04-29] Fix: Registration Password Not Saved

### Fixed
- Users could not login after email+password registration because the chosen password was never sent to the backend. The frontend only sent `{ username, email }` during registration start and `{ code }` during verification — the password was silently dropped.

### Changed
- `authService.verifyEmailCode()` now accepts and sends optional `password` parameter
- `Register.tsx` stores password in component state and `sessionStorage`, passes it to `verifyEmailCode()` when verifying email code
- Session restore on page reload also preserves the password
- Backend now uses the user's chosen password instead of generating a random one
- Credentials email with username + password is sent to user after registration

### Files
- `src/services/authService.ts` — Updated `verifyEmailCode(code, password?)`
- `src/pages/Register.tsx` — Added `password` to `EmailVerificationState`, sessionStorage, and verification call

## [2026-04-15] About Service Page — Legal Documents

### Added
- About Service page (`/about`) with links to legal documents
- User Agreement link: https://telegra.ph/Polzovatelskoe-soglashenie-04-08-39
- Privacy Policy link: https://telegra.ph/Politika-konfidencialnosti-04-08-57
- Public `/about` route accessible with or without authentication (uses OptionalAuthRoute)
- Navigation link to About page in footer (both Layout and PublicLayout)
- i18n translations (EN + RU) for about page: title, subtitle, document titles/descriptions, navigation link
- Animated card layout with hover effects for legal document links

### Changed
- Added `About` component import to App.tsx
- Added `/about` route with OptionalAuthRoute wrapper
- Updated Layout.tsx footer to include "About Service" link
- Updated PublicLayout.tsx footer to include "About Service" link
- Removed unused `IconButton` import from PublicLayout.tsx

### Files
- `front-user/src/pages/About.tsx` — New About Service page component
- `front-user/src/App.tsx` — Added About import and /about route
- `front-user/src/components/Layout/Layout.tsx` — Added footer link
- `front-user/src/components/Layout/PublicLayout.tsx` — Added footer link
- `front-user/src/i18n/translations/en.ts` — Added about translations (8 keys)
- `front-user/src/i18n/translations/ru.ts` — Added about translations (8 keys)

## [2026-04-14] Payment Window Enhancement — Single-Connection Pay + Date Preview

### Added
- Date preview: "Paid until: ..." displayed prominently when user changes months
- "Pay for all connections" checkbox: toggles between single and multi-connection payment
- Single-connection pricing: backend calculates price for one connection (simple +N months, no alignment)
- Single-connection payment processing: on callback, only the specified connection is extended
- `connection_name` column on Payment model (nullable, null = all connections)
- `target_date` field in `PriceBreakdown` interface and API response
- `connection_name` parameter in `CalculatePriceRequest` schema
- Translation keys: `paidUntil`, `payForSingleConnection`, `allConnectionsPaidAhead`, `priceCalculationFailed` (EN + RU)
- `period_days` stored at payment initiation for accurate months calculation on callback

### Changed
- PaymentInitiationModal: reorganized layout — date and price at top, breakdown, slider, checkbox at bottom
- `paymentService.calculatePrice()` accepts optional `connectionName` parameter
- `calculate_user_payment()` accepts optional `connection_name` for single-connection calculation
- `_process_completed_payment()` uses stored `period_days` for months instead of lossy reverse-calculation
- `initiate_payment` stores `connection_name` and `period_days` on Payment record

### Files
- `central_manager/database/models.py` — Added `connection_name` column to Payment
- `central_manager/schemas/payment.py` — Added `connection_name` to CalculatePriceRequest
- `central_manager/services/pricing_service.py` — Single-connection pricing branch
- `central_manager/api/v1/endpoints/payments.py` — Pass connection_name, store on payment
- `central_manager/services/payment_service.py` — Single-connection processing + period_days fix
- `front-user/src/services/paymentService.ts` — calculatePrice with connectionName + target_date
- `front-user/src/components/forms/PaymentInitiationModal.tsx` — UI rework
- `front-user/src/i18n/translations/en.ts` — 4 new keys
- `front-user/src/i18n/translations/ru.ts` — 4 new keys

### Review
- Reviewer: ISSUES_FOUND → APPROVED after 1 fix round
- P1 Fix: Months reverse-calculation was lossy under bulk discount — now uses stored period_days
- P2 Fix: Missing translation keys added

## [2026-04-13] Public Instructions Page Rebuild

### Added
- Public `/instructions` route accessible without login, rendered via new `PublicLayout` component
- `PublicLayout` component: sticky header (logo, theme selector, EN/RU toggle, Login & Register buttons), content area, footer
- Instructions page rebuilt with 6 collapsible sections:
  1. Registration guide — 6 step-by-step instructions (RU)
  2. VPN setup — tab-based per-OS guides (Windows, Android, iOS, Linux)
  3. Changing color theme — 3 steps
  4. Changing VPN server — 3 steps
  5. Managing connections — creating new connections + changing slot count
  6. FAQ — nested accordion Q&A
- Card-grid TOC (2-col mobile, 3-col desktop) with icons for quick section jumping
- Screenshots hidden behind toggleable "show screenshot" buttons (collapsed by default)
- One section expanded at a time via Accordion pattern — no endless scrolling
- Compact step indicators: numbered circles with title + description inline
- ~40 new i18n translation keys (EN + RU) for all instruction sections

### Changed
- `/instructions` route exists as both public (PublicLayout) and authenticated (Layout)
- TOC cards auto-expand the target section and smooth-scroll to it

### Files
- `src/components/Layout/PublicLayout.tsx` — new
- `src/pages/Instructions.tsx` — rewritten
- `src/App.tsx` — added public route + PublicLayout import
- `src/i18n/translations/en.ts` — 40+ new keys
- `src/i18n/translations/ru.ts` — 40+ new keys

## [2026-04-13] Debt Feature + Bugfixes

### Added
- Debt (долг) display: per-connection red warning on ConnectionCard when `debt > 0`
- Dashboard debt summary panel showing total user debt with per-connection breakdown
- "Погасить долг" button: initiates payment for debt amount via paymentService
- "Обжаловать долг" button: creates support conversation with admin and navigates to /support
- `debt?: number` field on Connection type
- Russian and English translations for all debt-related UI strings

### Fixed
- PaymentInitiationModal: uses `connection.price` from backend instead of local `calculateConnectionPrice()`
- `getDaysRemaining()`: returns 1 decimal precision (e.g., 29.9 instead of 29)
- Test infrastructure: fixed `window.location` mock crash in happy-dom (axios import-time error)
- Test infrastructure: replaced MSW with `vi.mock()` due to MSW v1 / axios v1.7 incompatibility
- Types: `short_id` → `client_uuid` in Connection type (backend API change)
- Types: removed `price` from ConnectionCreateRequest (backend no longer accepts it)

### Changed
- All 49 service tests now pass (previously all broken)

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
# TODO - VPN User Frontend

Current tasks, planned features, and deferred work.

## High Priority

### Auth Page Rework
- [x] Create unified AuthPage.tsx replacing Login.tsx + Register.tsx
- [x] Landing view with Sign In / Create Account buttons
- [x] Login methods: Telegram OAuth, Telegram Bot, Username & Password
- [x] Register methods: Telegram OAuth, Telegram Bot, Email
- [x] Telegram OAuth/Bot buttons do the same for login and register
- [x] Password login with remember me (checked by default) and forgot password link
- [x] Email registration with verification code and temp credentials display
- [x] Referrer ID auto-advance to register mode
- [x] Session restore for in-progress registrations
- [x] i18n translations (EN + RU) for new keys
- [x] Update App.tsx routing (/login and /register → AuthPage)
- [x] Delete old Login.tsx and Register.tsx

### About Service Page
- [x] Create About page component with legal document links
- [x] Add /about route to App.tsx (public access via OptionalAuthRoute)
- [x] Add navigation link to footer (Layout.tsx and PublicLayout.tsx)
- [x] Add i18n translations (EN + RU) for about page
- [x] Legal docs: User Agreement (https://telegra.ph/Polzovatelskoe-soglashenie-04-08-39) and Privacy Policy (https://telegra.ph/Politika-konfidencialnosti-04-08-57)

### Public Instructions Page
- [x] Create PublicLayout component (header with login/register, footer)
- [x] Rebuild Instructions page with 6 sections (registration, VPN setup, theme, server, connections, FAQ)
- [x] Move /instructions route outside PrivateRoute (public access)
- [x] Add ~40 i18n keys (EN + RU) for all instruction sections
- [x] Add screenshot placeholders for future image insertion
- [ ] Replace screenshot placeholders with actual screenshots

### Debt Feature
- [x] Add `debt?: number` to Connection type
- [x] Display per-connection debt on ConnectionCard (red warning)
- [x] Dashboard debt summary panel with total user debt
- [x] "Погасить долг" button — initiates payment via paymentService
- [x] "Обжаловать долг" button — creates support conversation and navigates to /support
- [x] RU/EN translations for all debt strings

### Token-Based Auto-Login
- [ ] Add `LoginByTokenResponse` type to `src/types/user.ts` — `{ access_token: string; username: string }`
- [x] Add `loginByToken(loginToken)` method to `src/services/authService.ts` — POST `/auth/login-by-token`
- [x] Create `src/pages/AuthCallback.tsx` — read `?token=` from URL, call `loginByToken`, on success `setAuthFromToken` + redirect `/`, on failure redirect `/login`
- [x] Add `/auth/callback` route to `src/App.tsx` — lazy-loaded AuthCallback page

### Security Fixes (P0/P1)
- [x] AuthContext: Remove client-side JWT parsing, use /users/me API instead
- [x] Register.tsx: Fix polling race condition
- [x] Profile.tsx: Wire relink dialog to backend (backend endpoint: POST /users/me/telegram/rebind)
- [x] NewConnectionModal: Fetch price dynamically (backend endpoint: GET /users/me/price)

### Registration Flow Fix
- [x] Implement seamless registration between frontend and bot
- [ ] Test registration flow end-to-end

### API Contract Alignment (2026-04-08)
- [x] Connection type: added subscription_url, subscription_token, status fields
- [x] Copy button: use subscription_url (always available) instead of connection_string
- [x] ConnectionDetailsModal: show subscription URL section
- [x] connectionService: all methods use user-scoped /connections/my/ routes
- [x] Types aligned: PendingEmailChangeResponse, TelegramRebindResponse, ConversationListItem
- [x] Types cleaned: removed price from ConnectionUpdateRequest, telegram_id from UserUpdateRequest
- [x] Types: StartEmailChangeResponse field renamed email → new_email
- [x] Profile.tsx: cleaned up dead rebindToken polling code
- [x] MSW mocks: aligned with backend response shapes

### Completed
- [x] Fix registration to point to correct bot (@Myth_vpnbot)
- [x] Register.tsx - add password fields + toggle for Telegram vs password registration
- [x] Backend integration when `/connections/my` and `/users/me` are ready
- [x] Connection string copy functionality (now uses subscription_url)
- [x] Auto-renew toggle UI (after backend adds field)
- [x] Server change functionality (after backend endpoint ready)
- [x] Multi-theme system (Violet, Teal, Telegram, Light)
- [x] Telegram WebApp SDK integration
- [x] Framer-motion animations
- [x] ConnectionCard hover animations and status icons
- [x] Auto-detection of Telegram environment
- [x] AuthContext: Remove client-side JWT parsing, use /users/me API
- [x] Register.tsx: Fix polling race condition
- [x] Profile.tsx: Wire relink dialog to backend (POST /users/me/telegram/rebind)
- [x] NewConnectionModal: Dynamic pricing from API (GET /users/me/price)
- [x] Profile page: Email change/update with verification (POST /users/me/email/start, /verify, /cancel, GET /pending)

### Support Chat
- [x] Support page with 2 UI variants (Telegram-like and modern cards)
- [x] Support service for API calls
- [x] Support navigation link in Layout
- [x] Support route registered in App.tsx

## Medium Priority

- [x] Payment history with filtering
- [x] Push notifications for payment reminders
- [x] Connection status real-time updates

### Registration Flow Fix
- [x] Implement seamless registration between frontend and bot
- [x] Backend: Add registration status polling endpoint
- [x] Frontend: Add polling for Telegram verification
- [x] Frontend: Auto-login after site registration
- [x] Frontend: Auto-login after Telegram verification
- [ ] Test registration flow end-to-end

### Conversation Visibility
- [x] Backend: Add user_viewed_at field for unread tracking
- [x] Backend: Calculate has_unread_answers in list_my_conversations
- [x] Frontend: Green dot indicator for unread answers
- [x] Frontend: Remove green dot when conversation is viewed
- [x] Fix dark theme conversation sidebar styling

### Theme System
- [x] Two-column theme selector layout (dark left, light right)
- [x] Fixed double open/close bug in theme selector
- [x] Default theme changed to greySteel (dark steel)
- [x] Telegram users auto-use Telegram theme colors
- [x] Equal theme count: 13 dark + 12 light themes
- [x] Added light themes: honey, ocean, lavender, sunset, coral, skyBlue, peach, sage
- [x] Restored violet and teal as light themes
- [x] Removed "Classic Light" theme
- [x] Removed duplicate themes (matcha too similar to limeGreen, mint too similar to ocean)

## Low Priority / Backlog

- [ ] Mobile app (PWA)
- [ ] Re-enable connection UI (service method ready: POST /connections/my/{name}/reenable)
- [ ] Available inbounds UI (service method ready: GET /connections/my/{name}/available-inbounds)
- [ ] Switch inbound protocol UI (service method ready: POST /connections/my/{name}/switch-inbound)
- [ ] Referral program UI (service method ready: GET /users/me/referrals)
- [ ] Multi-language support

## Dependencies

- Completed: central_manager endpoints now available
- Registration: Needs coordination with tgvpnbot bot

## Cross-Project Tasks

- Registration flow requires coordination with tgvpnbot (Telegram bot)

## Testing

- See [TEST_PLAN.md](TEST_PLAN.md) for manual test scenarios
- Mock mode available for development without backend
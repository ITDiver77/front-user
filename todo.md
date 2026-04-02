# TODO - VPN User Frontend

Current tasks, planned features, and deferred work.

## High Priority

### Security Fixes (P0/P1)
- [x] AuthContext: Remove client-side JWT parsing, use /users/me API instead
- [x] Register.tsx: Fix polling race condition
- [x] Profile.tsx: Wire relink dialog to backend (backend endpoint: POST /users/me/telegram/rebind)
- [x] NewConnectionModal: Fetch price dynamically (backend endpoint: GET /users/me/price)

### Registration Flow Fix
- [x] Implement seamless registration between frontend and bot
- [ ] Test registration flow end-to-end

### Completed
- [x] Fix registration to point to correct bot (@Myth_vpnbot)
- [x] Register.tsx - add password fields + toggle for Telegram vs password registration
- [x] Backend integration when `/connections/my` and `/users/me` are ready
- [x] Connection string copy functionality (after backend adds field)
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
- [ ] Referral program UI
- [ ] Multi-language support

## Dependencies

- Completed: central_manager endpoints now available
- Registration: Needs coordination with tgvpnbot bot

## Cross-Project Tasks

- Registration flow requires coordination with tgvpnbot (Telegram bot)

## Testing

- See [TEST_PLAN.md](TEST_PLAN.md) for manual test scenarios
- Mock mode available for development without backend
# TODO - VPN User Frontend

Current tasks, planned features, and deferred work.

## High Priority

### Registration Flow Fix
- [ ] Implement seamless registration between frontend and bot
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

### Support Chat
- [x] Support page with 2 UI variants (Telegram-like and modern cards)
- [x] Support service for API calls
- [x] Support navigation link in Layout
- [x] Support route registered in App.tsx

## Medium Priority

- [ ] Payment history with filtering
- [ ] Push notifications for payment reminders
- [ ] Connection status real-time updates

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
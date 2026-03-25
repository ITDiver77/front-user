# TODO - VPN User Frontend

Current tasks, planned features, and deferred work.

## High Priority

- [ ] Backend integration when `/connections/my` and `/users/me` are ready
- [ ] Connection string copy functionality (after backend adds field)
- [ ] Auto-renew toggle UI (after backend adds field)
- [ ] Server change functionality (after backend endpoint ready)

## Medium Priority

- [ ] Payment history with filtering
- [ ] Telegram WebView optimization
- [ ] Push notifications for payment reminders
- [ ] Connection status real-time updates

## Low Priority / Backlog

- [ ] Mobile app (PWA)
- [ ] Referral program UI
- [ ] Multi-language support

## Dependencies

- Waiting on central_manager:
  - `/users/me` endpoint
  - `/connections/my` endpoint
  - `/connections/{name}/change-server` endpoint
  - `connection_string` in connection response
  - `auto_renew` in connection model

## Testing

- See [TEST_PLAN.md](TEST_PLAN.md) for manual test scenarios
- Mock mode available for development without backend

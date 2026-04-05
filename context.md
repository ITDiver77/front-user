# Context - VPN User Frontend

Project-specific patterns, conventions, and architectural decisions.

## Tech Stack

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **UI Library**: Material-UI (MUI) v5
- **Routing**: React Router v6
- **HTTP Client**: Axios with interceptors
- **Forms**: React Hook Form + Zod
- **State**: React Context + useReducer
- **Animations**: Framer Motion
- **Telegram**: @tma.js/sdk

## Project Structure

```
src/
├── components/
│   ├── common/           # ConnectionCard, PaymentCard
│   ├── forms/            # Modals (NewConnection, Payment, ChangeServer)
│   └── Layout/           # Navigation, Footer
├── contexts/             # AuthContext, ThemeContext
├── hooks/                # Custom hooks (useTelegramWebApp)
├── pages/                # Route pages
├── services/             # API service layer (mock-ready)
├── theme/                # Theme configurations (violet, teal, telegram, light)
├── types/                # TypeScript interfaces
└── utils/                # Validation schemas
```

## Theme System

Located in `src/theme/`:
- `violet.ts` - Default purple theme
- `teal.ts` - Teal/green alternative
- `telegram.ts` - Telegram-inspired dark theme
- `light.ts` - Light mode theme
- `ThemeContext.tsx` - Theme provider with persistence
- `ThemeSelector.tsx` - Theme switching component

Theme features:
- Soft colors with rounded corners
- Custom MUI theme overrides
- Auto-detects Telegram environment

## Telegram Integration

- `@tma.js/sdk` for Telegram WebApp API
- `useTelegramWebApp` hook in `src/hooks/`
- Auto-adapts to Telegram environment
- Telegram-specific UI adjustments in Layout

## Animations

- Framer Motion for page transitions
- ConnectionCard hover animations
- Status icons with subtle animations
- Page-level enter/exit animations

## API Integration

### Authentication
- JWT Bearer token in `Authorization` header
- Token stored in localStorage
- Mock mode available (`VITE_MOCK_AUTH=true`)

### Base URL
Configured via `VITE_API_BASE_URL` (default: `/api/v1` - proxied through Vite)

### Mock Mode
When `VITE_MOCK_AUTH=true`:
- Auth always succeeds
- Sample connection/server data
- Simulated payments

## Routing

```
/login              # Login page
/register           # Registration
/restore            # Password reset
/dashboard          # Connection list (protected)
/profile            # User profile (protected)
/payments           # Payment history (protected)
/instructions       # VPN setup guides
/payment/success    # Payment success callback
/payment/fail       # Payment failure callback
```

## Component Patterns

### ConnectionCard
- Displays connection status, server, expiration
- Copy button for connection string
- Toggle for auto-renew
- Pay button for expired connections
- Hover animations with framer-motion

### Payment Modal
- Amount selection
- Payment method (SBP QR)
- Redirect to payment gateway

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_BASE_URL` | `/api/v1` | Backend API URL |
| `VITE_MOCK_AUTH` | `false` | Use mock data |
| `VITE_PAYMENT_SUCCESS_URL` | - | Payment redirect |
| `VITE_PAYMENT_FAIL_URL` | - | Payment redirect |

## Testing

```bash
npm test           # Run Vitest
npm run test:coverage  # With coverage
```

## Development

```bash
npm install
npm run dev        # Start on port 9556
npm run build      # Production build
npm run lint       # Biome check
```

## Troubleshooting

### "Blocked request. This host is not allowed"

Vite 5+ blocks requests to unknown hosts (DNS rebinding protection). When accessing via hostname (e.g., `*.abrdns.com`, `*.duckdns.org`):

**Solution:** Add hostname to `allowedHosts` in `vite.config.ts`:
```typescript
server: {
  allowedHosts: ['srv9.mythservers.abrdns.com']
}
```

### "Connection refused" to backend

1. Backend running on port 8000
2. Proxy configured in vite.config.ts
3. CORS settings on backend

### Docker ENOSPC error

Increase fs.inotify.max_user_watches:
```bash
echo 524288 | sudo tee /proc/sys/fs/inotify/max_user_watches
```

## Maintenance Tasks

### Adding New Allowed Host
Edit `vite.config.ts`:
```typescript
server: {
  allowedHosts: [
    'srv9.mythservers.abrdns.com',  // existing
    'new-host.ddns.net'              // add here
  ]
}
```

### Changing Port (9556)
1. Update `vite.config.ts` → `server.port`
2. Update `nginx.conf` → `listen 9556`
3. Update `docker-compose.yml` → port mappings

## Deployment Rules

**CRITICAL: NEVER use `docker run` directly. Always use master compose.**

```bash
# Rebuild after code changes
cd /root/vpn-manager && docker compose build --no-cache front-user && docker compose up -d --force-recreate front-user

# Restart only (no code changes)
cd /root/vpn-manager && docker compose restart front-user
```

## Deployment Rules

**CRITICAL: NEVER use `docker run` directly. ALWAYS use master compose.**

### Rebuild and rede user portal
```bash
cd /root/vpn-manager && docker compose build --no-cache front-user && docker compose up -d --force-recreate front-user
```

### Restart only (no code changes)
```bash
cd /root/vpn-manager && docker compose restart front-user
```

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

## Project Structure

```
src/
├── components/
│   ├── common/           # ConnectionCard, PaymentCard
│   ├── forms/            # Modals (NewConnection, Payment, ChangeServer)
│   └── Layout/           # Navigation, Footer
├── contexts/             # AuthContext
├── hooks/                # Custom hooks
├── pages/                # Route pages
├── services/             # API service layer (mock-ready)
├── types/                # TypeScript interfaces
└── utils/                # Validation schemas
```

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
npm run lint       # ESLint check
npm run test       # Run tests
```

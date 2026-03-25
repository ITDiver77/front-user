# PRODUCT.md - VPN User Frontend

## Project Overview

**Project Name**: VPN User Panel  
**Type**: Single Page Application (React)  
**Purpose**: Self-service portal for VPN users to manage connections and payments  
**Target Users**: VPN service customers

## Core Features

- **Authentication**: Register, login, password reset with JWT
- **Connection Management**: View VPN connections, copy config, change server
- **Payments**: Pay for connection extension, view history
- **Profile**: Update info, change password, link Telegram
- **Instructions**: VPN setup guides for various OS

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | React 18 + TypeScript |
| Build | Vite |
| UI | Material-UI v5 |
| Routing | React Router v6 |
| HTTP | Axios |
| Forms | React Hook Form + Zod |
| Container | Docker + Nginx |

## Architecture

```
┌─────────────────┐     ┌────────────────────┐
│   User Browser  │────▶│   Vite Dev Server  │
│   or Telegram   │     │   (port 9556)      │
│   WebView       │     └─────────┬──────────┘
└─────────────────┘              │ HTTPS
                                 ▼
                        ┌────────────────────┐
                        │  Nginx (production) │
                        └─────────┬──────────┘
                                  │ HTTP
                                  ▼
                        ┌────────────────────┐
                        │  Central Manager   │
                        │  (port 8000)       │
                        └────────────────────┘
```

## Deployment

### Docker
```bash
docker-compose up --build
# Available at http://localhost:9556
```

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_BASE_URL` | `/api/v1` | Backend API URL |
| `VITE_MOCK_AUTH` | `false` | Use mock data |
| `VITE_PAYMENT_SUCCESS_URL` | - | Redirect after payment |
| `VITE_PAYMENT_FAIL_URL` | - | Redirect on failure |

## Mock Mode

Enable `VITE_MOCK_AUTH=true` for development without backend:
- All auth operations succeed
- Sample connections and servers displayed
- Payment flow simulated

## Success Criteria

1. Users can register and login
2. View and manage VPN connections
3. Make payments to extend service
4. Works in Telegram WebView
5. Mobile responsive

## Related Projects

- [central_manager](../central_manager/) - Backend API
- [front-admin](../front-admin/) - Admin dashboard
- [tgvpnbot](../tgvpnbot/) - Telegram bot interface

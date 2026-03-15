# VPN Manager Frontend - Project Maintenance Guide

## Overview

This is the frontend user interface for a VPN management system. It allows users to:
- Register, login, and manage their accounts
- View and manage VPN connections
- Make payments to extend VPN service
- View instructions and guides for VPN setup

---

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   User Browser  │────▶│  Vite Dev Server │────▶│  Backend API    │
│ (or Telegram)   │     │   (port 9556)    │     │ (port 8000)     │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                               │
                               ▼ (Production)
                        ┌──────────────────┐
                        │  Nginx (port 9556)│
                        └──────────────────┘
```

### Technology Stack
| Layer | Technology |
|-------|------------|
| Framework | React 18 + TypeScript |
| Build Tool | Vite 5.x |
| UI Components | Material-UI (MUI) 5.x |
| Routing | React Router 6.x |
| State Management | React Context + useReducer |
| HTTP Client | Axios |
| Form Validation | React Hook Form + Zod |
| Container | Docker + Nginx |

---

## Development Server Configuration

### Vite Config (`vite.config.ts`)

The Vite development server runs on port 9556 with the following key settings:

```typescript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 9556,
    host: true,                    // Bind to all network interfaces
    allowedHosts: [                // ⚠️ REQUIRED for remote access
      'srv9.mythservers.abrdns.com'
    ],
    proxy: {
      '/api/v1': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/v1/, '/api/v1'),
      }
    }
  }
})
```

### Understanding `allowedHosts`

**The Error You Just Fixed:**
```
Blocked request. This host ("srv9.mythservers.abrdns.com") is not allowed.
To allow this host, add "srv9.mythservers.abrdns.com" to `server.allowedHosts` in vite.config.js.
```

**Why This Happens:**
- Vite 5+ includes security that blocks requests to unknown hosts
- When accessing via a hostname (like dynamic DNS services: `*.abrdns.com`, `*.duckdns.org`, `*.no-ip.org`), Vite blocks the request by default
- This prevents DNS rebinding attacks during development

**How to Add New Hosts:**

1. **Single host:**
   ```typescript
   allowedHosts: ['srv9.mythservers.abrdns.com']
   ```

2. **Multiple hosts:**
   ```typescript
   allowedHosts: [
     'srv9.mythservers.abrdns.com',
     'my-vpn.ddns.net',
     'vpn-server.example.com'
   ]
   ```

3. **Allow all hosts (development only - NOT RECOMMENDED):**
   ```typescript
   allowedHosts: true
   ```

### Dynamic DNS Services Commonly Used

| Service | Example Hostname |
|---------|-----------------|
| AbrdnDNS | `srv9.mythservers.abrdns.com` |
| DuckDNS | `myvpn.duckdns.org` |
| No-IP | `myvpn.ddns.net` |
| Cloudflare | Custom domain |

---

## Nginx Configuration

### Production Deployment (`nginx.conf`)

Nginx serves the built application and can proxy API requests:

```nginx
server {
    listen 9556;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    # Handle React Router (SPA routing)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API proxy (uncomment for production)
    location /api/ {
        proxy_pass http://backend:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### Building for Nginx

```bash
# Build the application
npm run build

# The output is in dist/ folder
# Copy dist contents to nginx html folder
```

---

## Environment Configuration

### Development (.env.local)
```env
VITE_API_BASE_URL=/api/v1
VITE_PAYMENT_SUCCESS_URL=http://localhost:9556/payment/success
VITE_PAYMENT_FAIL_URL=http://localhost:9556/payment/fail
VITE_APP_TITLE=VPN User Panel
VITE_MOCK_AUTH=true
```

### Production (.env.production)
```env
VITE_API_BASE_URL=http://backend:8000/api/v1
VITE_PAYMENT_SUCCESS_URL=https://your-domain.com/payment/success
VITE_PAYMENT_FAIL_URL=https://your-domain.com/payment/fail
VITE_APP_TITLE=VPN User Panel
VITE_MOCK_AUTH=false
```

---

## Running the Application

### Development Mode (Local)
```bash
npm install
npm run dev
# Access at http://localhost:9556
```

### Development Mode (Remote/Dynamic DNS)
```bash
# Ensure hostname is added to allowedHosts in vite.config.ts
npm run dev
# Access at http://srv9.mythservers.abrdns.com:9556
```

### Docker (Development)
```bash
docker-compose up -d
# Access at http://localhost:9556
```

### Production Build
```bash
npm run build
# Output in dist/
```

---

## Project Structure

```
front-user/
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── common/
│   │   │   └── ConnectionCard.tsx
│   │   ├── forms/
│   │   │   ├── NewConnectionModal.tsx
│   │   │   ├── ChangeServerModal.tsx
│   │   │   └── PaymentInitiationModal.tsx
│   │   └── Layout/
│   │       └── Layout.tsx
│   ├── contexts/
│   │   └── AuthContext.tsx   # Authentication state
│   ├── pages/
│   │   ├── Dashboard.tsx
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   ├── Profile.tsx
│   │   ├── PaymentHistory.tsx
│   │   └── Instructions.tsx
│   ├── services/
│   │   ├── api.ts            # Axios instance with interceptors
│   │   ├── authService.ts
│   │   ├── connectionService.ts
│   │   ├── serverService.ts
│   │   ├── userService.ts
│   │   └── paymentService.ts
│   ├── types/
│   │   ├── index.ts
│   │   ├── user.ts
│   │   ├── connection.ts
│   │   ├── server.ts
│   │   └── payment.ts
│   ├── utils/
│   │   ├── validation.ts     # Zod schemas
│   │   └── dateHelpers.ts
│   ├── App.tsx
│   └── main.tsx
├── vite.config.ts            # ⚠️ Contains allowedHosts
├── nginx.conf
├── docker-compose.yml
└── package.json
```

---

## Common Maintenance Tasks

### 1. Adding a New Environment Variable

1. Add to `.env.example` and `.env.production.example`
2. Use via `import.meta.env.VITE_VARIABLE_NAME` in code
3. Update README.md environment table

### 2. Adding a New API Endpoint

1. Create/update service in `src/services/`
2. Add TypeScript types in `src/types/`
3. Update README.md API section

### 3. Adding a New Page

1. Create component in `src/pages/`
2. Add route in `src/App.tsx`
3. Add navigation link in Layout if needed

### 4. Changing the Port

If you need to change from port 9556:

1. Update `vite.config.ts` → `server.port`
2. Update `nginx.conf` → `listen 9556`
3. Update `docker-compose.yml` → port mappings
4. Update README.md
5. Update this document

### 5. Adding a New Allowed Host

Edit `vite.config.ts`:

```typescript
server: {
  allowedHosts: [
    'srv9.mythservers.abrdns.com',  // existing
    'new-host.ddns.net'              // add here
  ]
}
```

---

## Troubleshooting

### Error: "Blocked request. This host is not allowed"

**Solution:** Add the hostname to `allowedHosts` in `vite.config.ts`

### Error: "Connection refused" to backend

**Check:**
1. Backend is running on port 8000
2. Proxy configuration in vite.config.ts
3. CORS settings on backend

### Error: "Page not found" on refresh (Nginx)

**Solution:** Ensure `try_files $uri $uri/ /index.html;` is in nginx config for SPA routing.

---

## API Endpoints Expected from Backend

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/auth/register` | POST | User registration |
| `/api/v1/auth/login` | POST | User login |
| `/api/v1/auth/restore` | POST | Password reset request |
| `/api/v1/auth/reset` | POST | Password reset completion |
| `/api/v1/auth/change-password` | POST | Change password |
| `/api/v1/users/me` | GET | Get current user |
| `/api/v1/users/me` | PUT | Update user profile |
| `/api/v1/connections/my` | GET | Get user connections |
| `/api/v1/connections/{name}/change-server` | POST | Change server |
| `/api/v1/payments/` | GET | Get payment history |
| `/api/v1/payments/initiate` | POST | Initiate payment |

---

## Security Notes

1. **allowedHosts**: Only add hosts you trust. Never use `allowedHosts: true` in production.
2. **JWT Tokens**: Stored in localStorage. Consider httpOnly cookies for higher security.
3. **Environment Variables**: Never commit `.env` files with secrets.
4. **Nginx Headers**: Security headers are configured in nginx.conf.

---

## Contact & Support

For issues:
1. Check this maintenance guide
2. Review README.md troubleshooting section
3. Check API_CHANGE_REQUEST.md for backend specs
4. Review docker-compose.yml and nginx.conf

---

*Last updated: 2026-03-12*
*Document maintained by: Development Team*

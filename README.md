# VPN User Frontend Application

A React-based web application for VPN service users to manage connections, make payments, view guides, and update profiles. Designed for use both as a standalone website and within Telegram's in-app browser.

## Features

- **User Authentication**: Register, login, password reset with JWT tokens
- **Connection Management**: View VPN connections with status, copy configuration, toggle auto-renew, change servers
- **Payment Processing**: Initiate payments for connection extension, view payment history
- **User Profile**: Update profile information, change password, link Telegram account
- **Instructions & Guides**: Static help pages for VPN setup and troubleshooting
- **Responsive Design**: Optimized for mobile devices and Telegram WebView
- **Accessibility**: WCAG 2.1 AA compliant

## Technology Stack

- **Frontend**: React 18+ with TypeScript
- **Build Tool**: Vite
- **UI Framework**: Material-UI (MUI) v5
- **Routing**: React Router v6
- **State Management**: React Context + useReducer
- **HTTP Client**: Axios with interceptors
- **Form Handling**: React Hook Form + Zod validation
- **Date Handling**: date-fns
- **Containerization**: Docker + Nginx

## Prerequisites

- Node.js 18+ and npm
- Docker and Docker Compose (for containerized deployment)
- Backend API server (VPN Central Manager)

## Quick Start

### Development

```bash
# Clone the repository
git clone <repository-url>
cd front-user

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your settings

# Start development server
npm run dev
```

The application will be available at `http://localhost:9556`.

### Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## Environment Configuration

### Development (.env.local)

```env
VITE_API_BASE_URL=/api/v1           # Proxied to backend via Vite
VITE_PAYMENT_SUCCESS_URL=http://localhost:9556/payment/success
VITE_PAYMENT_FAIL_URL=http://localhost:9556/payment/fail
VITE_APP_TITLE=VPN User Panel
VITE_MOCK_AUTH=true                 # Enable mock authentication for development
```

### Production (.env.production)

```env
VITE_API_BASE_URL=http://backend:8000/api/v1  # Actual backend URL
VITE_PAYMENT_SUCCESS_URL=https://your-domain.com/payment/success
VITE_PAYMENT_FAIL_URL=https://your-domain.com/payment/fail
VITE_APP_TITLE=VPN User Panel
VITE_MOCK_AUTH=false                # Disable mock, use real backend
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend API base URL | `/api/v1` |
| `VITE_PAYMENT_SUCCESS_URL` | Payment success redirect URL | `http://localhost:9556/payment/success` |
| `VITE_PAYMENT_FAIL_URL` | Payment failure redirect URL | `http://localhost:9556/payment/fail` |
| `VITE_APP_TITLE` | Application title in browser tab | `VPN User Panel` |
| `VITE_MOCK_AUTH` | Enable mock authentication (development only) | `false` |

## Docker Deployment

### Building the Image

```bash
docker build -t vpn-user-frontend .
```

### Running with Docker Compose

```bash
# Start the application
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the application
docker-compose down
```

### Docker Compose Configuration

The `docker-compose.yml` file includes:
- Frontend service on port 9556
- Health checks
- Environment variable configuration
- Optional backend service (commented out)

### Nginx Configuration

The application uses Nginx with:
- React Router support (HTML5 history mode)
- Gzip compression
- Security headers
- Static asset caching
- Configurable API proxy (see `nginx.conf` comments)

To enable API proxying through Nginx, uncomment and configure the proxy sections in `nginx.conf`.

## API Integration

### Backend Requirements

The frontend requires the following backend endpoints:

#### Authentication (High Priority)
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/restore` - Password reset initiation
- `POST /auth/reset` - Password reset completion
- `POST /auth/change-password` - Password change

#### User Management (High Priority)
- `GET /users/me` - Current user profile
- `PUT /users/me` - Update user profile

#### Connection Management (Medium Priority)
- `GET /connections/my` - User's connections
- `POST /connections/{name}/change-server` - Change server for connection

#### Payment System (Medium Priority)
- `GET /payments/` with JWT user filtering
- `POST /payments/initiate` with connection awareness

See product.md for full project overview.

### Mock Mode

When `VITE_MOCK_AUTH=true`, the application uses mock data for:
- User authentication (always succeeds)
- Connection listings (sample data)
- Server listings (sample servers)
- Payment processing (simulated)

This allows frontend development without a backend.

## Development

### Project Structure

```
src/
├── components/     # Reusable UI components
│   ├── common/     # Shared components (ConnectionCard, etc.)
│   ├── forms/      # Form modals (NewConnection, ChangeServer, Payment)
│   └── Layout/     # Main layout with navigation
├── contexts/       # React contexts (AuthContext)
├── hooks/          # Custom React hooks
├── pages/          # Page components
│   ├── Dashboard.tsx
│   ├── Login.tsx
│   ├── Profile.tsx
│   └── ...
├── services/       # API service layers
│   ├── api.ts      # Axios instance with interceptors
│   ├── authService.ts
│   ├── connectionService.ts
│   └── ...
├── types/          # TypeScript type definitions
└── utils/          # Utility functions
    ├── validation.ts  # Zod validation schemas
    └── dateHelpers.ts
```

### Code Quality

```bash
# Type checking
npx tsc --noEmit

# Linting
npm run lint

# Building
npm run build
```

## Testing

### Manual Testing Scenarios

1. **Authentication Flow**
   - Register new user
   - Login with credentials
   - Forgot password flow
   - Change password

2. **Connection Management**
   - View connection list
   - Copy connection string
   - Toggle auto-renew
   - Change server (when backend supports)
   - Create new connection

3. **Payment Flow**
   - Initiate payment for connection
   - View payment history
   - Handle payment success/failure

4. **Responsive Testing**
   - Mobile view (375px width)
   - Tablet view
   - Desktop view
   - Telegram WebView simulation

### Automated Testing

*To be implemented*

## Accessibility

The application follows WCAG 2.1 AA guidelines:
- Semantic HTML structure
- ARIA labels where needed
- Keyboard navigation support
- Sufficient color contrast
- Screen reader compatibility

Run accessibility audit using browser dev tools or axe extension.

## Performance

- Code splitting with React.lazy()
- Lazy loading of routes
- Optimized bundle size
- Nginx compression and caching
- Image optimization

## Troubleshooting

### Common Issues

1. **API Connection Errors**
   - Verify backend is running and accessible
   - Check `VITE_API_BASE_URL` configuration
   - Ensure CORS is configured on backend

2. **Docker Container Fails to Start**
   - Check nginx configuration syntax
   - Verify port 9556 is not in use
   - Check Docker logs: `docker-compose logs`

3. **Authentication Issues**
   - Verify JWT token storage (localStorage/sessionStorage)
   - Check backend authentication endpoints
   - Enable mock mode for testing

4. **Payment Redirect Issues**
   - Configure correct payment redirect URLs
   - Ensure payment gateway integration

### Debugging

```bash
# Development server with verbose output
npm run dev 2>&1 | tee dev.log

# Docker container logs
docker-compose logs -f front-user

# Check build errors
npm run build -- --debug
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes with appropriate tests
4. Submit a pull request

### Code Style

- Follow TypeScript strict mode
- Use functional components with hooks
- Implement proper error handling
- Add JSDoc comments for public APIs
- Maintain consistent formatting (Prettier)

## License

*To be determined*

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review product.md and context.md for project info
3. Check existing GitHub issues
4. Contact the development team
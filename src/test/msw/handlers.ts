import { rest } from 'msw'
import { setupServer } from 'msw/node'

// Types for test data
interface LoginRequest {
  username: string
  password: string
}

interface RegisterStartRequest {
  username: string
}

interface ForgotPasswordRequest {
  username: string
}

interface ResetPasswordRequest {
  token: string
  new_password: string
}

interface ChangePasswordRequest {
  old_password: string
  new_password: string
}

interface PaymentInitiationRequest {
  connection_name?: string
  server_name?: string
  months: number
  payment_method?: string
}

interface User {
  id: number
  username: string
  telegram_id: number | null
  telegram_verified: boolean
  created_at: string
}

interface Connection {
  id: number
  username: string
  index: number
  connection_name: string
  short_id: string
  price: number
  paydate: string
  enabled: boolean
  is_active: boolean
  created_at: string
  connection_string: string
  auto_renew: boolean
  server_name: string
}

interface Server {
  id: number
  name: string
  host: string
  port: number
  api_key: string
  region: string
  is_default: boolean
  max_users: number
  is_active: boolean
  created_at: string
}

interface Payment {
  id: number
  user_id: number
  amount: number
  payment_date: string
  period_days: number
  payment_method: string
  notes: string | null
  status: string
}

interface PaymentListResponse {
  payments: Payment[]
  total: number
  total_amount: number
  limit: number
  offset: number
}

// Mock data
const mockUser: User = {
  id: 1,
  username: 'testuser',
  telegram_id: 123456789,
  telegram_verified: true,
  created_at: '2025-01-01T00:00:00Z',
}

const mockConnections: Connection[] = [
  {
    id: 1,
    username: 'testuser',
    index: 0,
    connection_name: 'testuser-1',
    short_id: 'abc123',
    price: 5,
    paydate: '2026-04-01',
    enabled: true,
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
    connection_string: 'vless://abc123@testserver.com:443',
    auto_renew: true,
    server_name: 'US-West',
  },
]

const mockServers: Server[] = [
  { id: 1, name: 'US-West', host: 'us.example.com', port: 51820, api_key: '', region: 'US', is_default: true, max_users: 100, is_active: true, created_at: '' },
  { id: 2, name: 'EU-Central', host: 'eu.example.com', port: 51820, api_key: '', region: 'EU', is_default: false, max_users: 100, is_active: true, created_at: '' },
]

const mockPayments: Payment[] = [
  { id: 1, user_id: 1, amount: 1000, payment_date: '2026-01-15T10:30:00Z', period_days: 30, payment_method: 'card', notes: null, status: 'COMPLETED' },
  { id: 2, user_id: 1, amount: 1500, payment_date: '2026-02-10T14:20:00Z', period_days: 30, payment_method: 'card', notes: 'Renewal', status: 'COMPLETED' },
]

// Request body storage for verification
let capturedRequests: Record<string, unknown> = {}

// API handlers using older msw v1 API
const handlers = [
  // Auth endpoints
  rest.post('/api/v1/auth/login', (req, res, ctx) => {
    capturedRequests.login = req.body as LoginRequest
    return res(ctx.json({ access_token: 'mock-jwt-token', token_type: 'bearer' }))
  }),

  rest.post('/api/v1/auth/register/start', (req, res, ctx) => {
    const body = req.body as RegisterStartRequest
    capturedRequests.registerStart = body
    return res(ctx.json({
      telegram_link: `https://t.me/MyVPNBot?start=${body.username}_token`,
      registration_token: `${body.username}_token`,
      message: 'Please verify your account via Telegram bot',
    }))
  }),

  rest.post('/api/v1/auth/restore', (req, res, ctx) => {
    const body = req.body as ForgotPasswordRequest
    capturedRequests.forgotPassword = body
    return res(ctx.json({ message: 'Password reset instructions will be sent if account exists' }))
  }),

  rest.post('/api/v1/auth/reset', (req, res, ctx) => {
    const body = req.body as ResetPasswordRequest
    capturedRequests.resetPassword = body
    return res(ctx.json({ message: 'Password reset successful' }))
  }),

  rest.post('/api/v1/auth/change-password', (req, res, ctx) => {
    const body = req.body as ChangePasswordRequest
    capturedRequests.changePassword = body
    return res(ctx.json({ message: 'Password changed successfully' }))
  }),

  // User endpoints
  rest.get('/api/v1/users/me', (req, res, ctx) => {
    return res(ctx.json(mockUser))
  }),

  rest.put('/api/v1/users/me', (req, res, ctx) => {
    capturedRequests.updateProfile = req.body
    return res(ctx.json({ ...mockUser, ...req.body }))
  }),

  rest.delete('/api/v1/users/me', (req, res, ctx) => {
    capturedRequests.deleteAccount = true
    return res(ctx.status(204))
  }),

  // Connection endpoints
  rest.get('/api/v1/connections/my', (req, res, ctx) => {
    return res(ctx.json(mockConnections))
  }),

  rest.get('/api/v1/connections/:connectionName', (req, res, ctx) => {
    const conn = mockConnections.find(c => c.connection_name === req.params.connectionName)
    if (!conn) return res(ctx.json({ detail: 'Not found' }), ctx.status(404))
    return res(ctx.json(conn))
  }),

  rest.post('/api/v1/connections/', (req, res, ctx) => {
    capturedRequests.createConnection = req.body
    return res(ctx.json({ ...mockConnections[0], ...req.body }))
  }),

  rest.put('/api/v1/connections/:connectionName', (req, res, ctx) => {
    capturedRequests.updateConnection = { name: req.params.connectionName, ...req.body }
    return res(ctx.json({ ...mockConnections[0], ...req.body }))
  }),

  rest.delete('/api/v1/connections/:connectionName', (req, res, ctx) => {
    capturedRequests.deleteConnection = req.params.connectionName
    return res(ctx.status(204))
  }),

  rest.post('/api/v1/connections/:connectionName/change-server', (req, res, ctx) => {
    const body = req.body as { new_server_name: string }
    capturedRequests.changeServer = { name: req.params.connectionName, ...body }
    return res(ctx.json({ ...mockConnections[0], server_name: body.new_server_name }))
  }),

  // Server endpoints
  rest.get('/api/v1/servers/', (req, res, ctx) => {
    const activeOnly = req.url.searchParams.get('active_only')
    const servers = activeOnly === 'true' ? mockServers.filter(s => s.is_active) : mockServers
    return res(ctx.json(servers))
  }),

  rest.get('/api/v1/servers/:serverName', (req, res, ctx) => {
    const server = mockServers.find(s => s.name === req.params.serverName)
    if (!server) return res(ctx.json({ detail: 'Not found' }), ctx.status(404))
    return res(ctx.json(server))
  }),

  // Payment endpoints
  rest.get('/api/v1/payments/', (req, res, ctx) => {
    const limit = parseInt(req.url.searchParams.get('limit') || '100')
    const offset = parseInt(req.url.searchParams.get('offset') || '0')
    capturedRequests.getPayments = { limit, offset }
    return res(ctx.json({
      payments: mockPayments.slice(offset, offset + limit),
      total: mockPayments.length,
      total_amount: mockPayments.reduce((sum, p) => sum + p.amount, 0),
      limit,
      offset,
    } as PaymentListResponse))
  }),

  rest.post('/api/v1/payments/initiate', (req, res, ctx) => {
    const body = req.body as PaymentInitiationRequest
    capturedRequests.initiatePayment = body
    return res(ctx.json({
      payment_id: 123,
      redirect_url: 'https://payment-gateway.example.com/pay?id=123',
    }))
  }),

  rest.get('/api/v1/payments/transaction/:paymentId/status', (req, res, ctx) => {
    const payment = mockPayments.find(p => p.id === parseInt(req.params.paymentId as string))
    if (!payment) return res(ctx.json({ detail: 'Not found' }), ctx.status(404))
    capturedRequests.paymentStatus = req.params.paymentId
    return res(ctx.json(payment))
  }),
]

// Create and export server
export const server = setupServer(...handlers)

// Utility to reset captured requests
export const resetCapturedRequests = () => {
  capturedRequests = {}
}

// Utility to get captured requests
export const getCapturedRequests = () => capturedRequests

import api from './api'

export interface LoginRequest {
  username: string
  password: string
}

export interface RegisterRequest {
  username: string
  password: string
  telegram_id?: number
}

export interface AuthResponse {
  access_token: string
  token_type: string
}

export interface ForgotPasswordRequest {
  username: string
}

export interface ResetPasswordRequest {
  token: string
  new_password: string
}

export interface ChangePasswordRequest {
  old_password: string
  new_password: string
}

// Mock authentication flag
const MOCK_AUTH = import.meta.env.VITE_MOCK_AUTH === 'true'

export const authService = {
  /**
   * Authenticate user with username and password
   * @param data Login credentials
   * @returns Authentication token response
   * @throws {Error} On network or API error with descriptive message
   */
  async login(data: LoginRequest): Promise<AuthResponse> {
    if (MOCK_AUTH) {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 300))
      return {
        access_token: 'mock-jwt-token',
        token_type: 'bearer',
      }
    }
    try {
      const response = await api.post<AuthResponse>('/auth/login', data)
      return response.data
    } catch (error: any) {
      throw new Error(error.message || 'Login failed')
    }
  },

  /**
   * Register new user account
   * @param data Registration details
   * @returns Authentication token response
   * @throws {Error} On network or API error with descriptive message
   */
  async register(data: RegisterRequest): Promise<AuthResponse> {
    if (MOCK_AUTH) {
      await new Promise(resolve => setTimeout(resolve, 300))
      return {
        access_token: 'mock-jwt-token',
        token_type: 'bearer',
      }
    }
    try {
      const response = await api.post<AuthResponse>('/auth/register', data)
      return response.data
    } catch (error: any) {
      throw new Error(error.message || 'Registration failed')
    }
  },

  /**
   * Request password reset email/link for given username
   * @param data Username identifier
   * @throws {Error} On network or API error with descriptive message
   */
  async forgotPassword(data: ForgotPasswordRequest): Promise<void> {
    if (MOCK_AUTH) {
      await new Promise(resolve => setTimeout(resolve, 300))
      return
    }
    try {
      await api.post('/auth/restore', data)
    } catch (error: any) {
      throw new Error(error.message || 'Forgot password request failed')
    }
  },

  /**
   * Reset password using token from email
   * @param data Token and new password
   * @throws {Error} On network or API error with descriptive error message
   */
  async resetPassword(data: ResetPasswordRequest): Promise<void> {
    if (MOCK_AUTH) {
      await new Promise(resolve => setTimeout(resolve, 300))
      return
    }
    try {
      await api.post('/auth/reset', data)
    } catch (error: any) {
      throw new Error(error.message || 'Password reset failed')
    }
  },

  /**
   * Change password for authenticated user
   * @param data Old and new passwords
   * @throws {Error} On network or API error with descriptive message
   */
  async changePassword(data: ChangePasswordRequest): Promise<void> {
    if (MOCK_AUTH) {
      await new Promise(resolve => setTimeout(resolve, 300))
      return
    }
    try {
      await api.post('/auth/change-password', data)
    } catch (error: any) {
      throw new Error(error.message || 'Password change failed')
    }
  },
}
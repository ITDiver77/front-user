import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { authService } from '../services/authService'
import { LoginRequest, RegisterRequest, ForgotPasswordRequest, ResetPasswordRequest, ChangePasswordRequest } from '../services/authService'

interface User {
  username: string
  // Add other fields from JWT if needed
}

interface AuthContextType {
  isAuthenticated: boolean
  loading: boolean
  user: User | null
  login: (username: string, password: string, rememberMe: boolean) => Promise<boolean>
  register: (username: string, password: string, telegramId?: number) => Promise<boolean>
  logout: () => void
  forgotPassword: (username: string) => Promise<boolean>
  resetPassword: (token: string, newPassword: string) => Promise<boolean>
  changePassword: (oldPassword: string, newPassword: string) => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token') || sessionStorage.getItem('token')
    if (token) {
      // Decode token to get user info (simple parse)
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        setUser({ username: payload.sub || payload.username })
        setIsAuthenticated(true)
      } catch (e) {
        console.error('Invalid token', e)
        // Clear invalid token
        localStorage.removeItem('token')
        sessionStorage.removeItem('token')
      }
    }
    setLoading(false)
  }, [])

  const storeToken = (token: string, rememberMe: boolean) => {
    if (rememberMe) {
      localStorage.setItem('token', token)
    } else {
      sessionStorage.setItem('token', token)
    }
  }

  const clearToken = () => {
    localStorage.removeItem('token')
    sessionStorage.removeItem('token')
  }

  const login = async (username: string, password: string, rememberMe: boolean): Promise<boolean> => {
    try {
      const response = await authService.login({ username, password })
      storeToken(response.access_token, rememberMe)
      setIsAuthenticated(true)
      setUser({ username })
      return true
    } catch (error) {
      console.error('Login failed', error)
      return false
    }
  }

  const register = async (username: string, password: string, telegramId?: number): Promise<boolean> => {
    try {
      const response = await authService.register({ username, password, telegram_id: telegramId })
      storeToken(response.access_token, true) // default rememberMe true for registration
      setIsAuthenticated(true)
      setUser({ username })
      return true
    } catch (error) {
      console.error('Registration failed', error)
      return false
    }
  }

  const logout = () => {
    clearToken()
    setIsAuthenticated(false)
    setUser(null)
  }

  const forgotPassword = async (username: string): Promise<boolean> => {
    try {
      await authService.forgotPassword({ username })
      return true
    } catch (error) {
      console.error('Forgot password request failed', error)
      return false
    }
  }

  const resetPassword = async (token: string, newPassword: string): Promise<boolean> => {
    try {
      await authService.resetPassword({ token, new_password: newPassword })
      return true
    } catch (error) {
      console.error('Reset password failed', error)
      return false
    }
  }

  const changePassword = async (oldPassword: string, newPassword: string): Promise<boolean> => {
    try {
      await authService.changePassword({ old_password: oldPassword, new_password: newPassword })
      return true
    } catch (error) {
      console.error('Change password failed', error)
      return false
    }
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, loading, user, login, register, logout, forgotPassword, resetPassword, changePassword }}>
      {children}
    </AuthContext.Provider>
  )
}
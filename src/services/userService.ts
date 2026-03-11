import api from './api'
import { User, UserUpdateRequest } from '../types/user'

const MOCK_AUTH = import.meta.env.VITE_MOCK_AUTH === 'true'

export const userService = {
  /**
   * Get current user profile (requires JWT)
   * @returns {Promise<User>} Current user data
   * @throws {Error} When network error or API error occurs
   */
  getMyProfile: async () => {
    if (MOCK_AUTH) {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 300))
      // Return mock user
      return {
        id: 1,
        username: 'testuser',
        telegram_id: null,
        created_at: new Date().toISOString(),
      } as User
    }

    try {
      const response = await api.get<User>('/users/me')
      return response.data
    } catch (error) {
      // Enhance error message for better debugging
      const err = error as any
      throw new Error(`Failed to fetch user profile: ${err.message}`)
    }
  },

  /**
   * Update current user profile
   * @param {UserUpdateRequest} data - Profile update data (telegram_id)
   * @returns {Promise<User>} Updated user data
   * @throws {Error} When network error, API error, or validation fails
   */
  updateProfile: async (data: UserUpdateRequest) => {
    if (MOCK_AUTH) {
      await new Promise(resolve => setTimeout(resolve, 300))
      // Return mock updated user (same as getMyProfile but with updated telegram_id if provided)
      return {
        id: 1,
        username: 'testuser',
        telegram_id: data.telegram_id ?? null,
        created_at: new Date().toISOString(),
      } as User
    }

    try {
      const response = await api.put<User>('/users/me', data)
      return response.data
    } catch (error) {
      const err = error as any
      throw new Error(`Failed to update profile: ${err.message}`)
    }
  },
}
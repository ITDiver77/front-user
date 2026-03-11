import api from './api'
import { Server, ServerListResponse } from '../types/server'

// Mock authentication flag (shared with auth service)
const MOCK_AUTH = import.meta.env.VITE_MOCK_AUTH === 'true'

// Mock servers data (development fallback)
const MOCK_SERVERS: Server[] = [
  { id: 1, name: 'US-West', host: 'us.example.com', port: 51820, api_key: '', region: 'US', is_default: true, max_users: 100, is_active: true, created_at: '' },
  { id: 2, name: 'EU-Central', host: 'eu.example.com', port: 51820, api_key: '', region: 'EU', is_default: false, max_users: 100, is_active: true, created_at: '' },
  { id: 3, name: 'Asia-Pacific', host: 'ap.example.com', port: 51820, api_key: '', region: 'AP', is_default: false, max_users: 100, is_active: true, created_at: '' },
]

export const serverService = {
  /**
   * Get list of active servers.
   * Real endpoint: GET /servers/?active_only=true
   * Backend returns Server[] (array of servers).
   * Mock fallback when VITE_MOCK_AUTH=true
   * @returns Promise<Server[]> list of active servers
   * @throws {Error} on network or API error (404, 403, 500, etc.)
   */
  getActiveServers: async (): Promise<Server[]> => {
    if (MOCK_AUTH) {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 300))
      return MOCK_SERVERS.filter(s => s.is_active)
    }

    const response = await api.get<Server[]>('/servers/', {
      params: { active_only: true }
    })
    return response.data
  },

  /**
   * Get server by name.
   * Real endpoint: GET /servers/{name}
   * Mock fallback when VITE_MOCK_AUTH=true
   * @param serverName - server name identifier
   * @returns Promise<Server> server object
   * @throws {Error} when server not found (404) or other API errors
   */
  getServer: async (serverName: string): Promise<Server> => {
    if (MOCK_AUTH) {
      await new Promise(resolve => setTimeout(resolve, 300))
      const server = MOCK_SERVERS.find(s => s.name === serverName)
      if (!server) {
        throw new Error('Server not found')
      }
      return server
    }

    const response = await api.get<Server>(`/servers/${serverName}`)
    return response.data
  },
}
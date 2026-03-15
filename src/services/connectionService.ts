import api from './api'
import { Connection, ConnectionCreateRequest, ConnectionUpdateRequest, ChangeServerRequest } from '../types/connection'

export const connectionService = {
  // Get connections for the current user (requires JWT)
  getMyConnections: async () => {
    const response = await api.get<Connection[]>('/connections/my')
    return response.data
  },

  // Get connection by name (must belong to current user)
  getConnection: async (connectionName: string) => {
    const response = await api.get<Connection>(`/connections/${connectionName}`)
    return response.data
  },

  // Create connection for current user
  createConnection: async (connectionData: ConnectionCreateRequest) => {
    const response = await api.post<Connection>('/connections/', connectionData)
    return response.data
  },

  // Update connection (must belong to current user)
  updateConnection: async (connectionName: string, connectionData: ConnectionUpdateRequest) => {
    const response = await api.put<Connection>(`/connections/${connectionName}`, connectionData)
    return response.data
  },

  // Delete connection (must belong to current user)
  deleteConnection: async (connectionName: string) => {
    await api.delete(`/connections/${connectionName}`)
  },

  // Toggle auto-renew
  toggleAutoRenew: async (connectionName: string, autoRenew: boolean) => {
    const response = await api.put<Connection>(`/connections/${connectionName}`, { auto_renew: autoRenew })
    return response.data
  },

  // Toggle enabled/disabled state
  toggleEnabled: async (connectionName: string, enabled: boolean) => {
    const response = await api.put<Connection>(`/connections/${connectionName}`, { enabled })
    return response.data
  },

  // Change server for connection
  changeServer: async (connectionName: string, newServerName: string) => {
    const response = await api.post<Connection>(`/connections/${connectionName}/change-server`, { new_server_name: newServerName })
    return response.data
  },
}

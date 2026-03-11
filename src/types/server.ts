export interface Server {
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

export interface ServerListResponse {
  servers: Server[]
  total: number
}
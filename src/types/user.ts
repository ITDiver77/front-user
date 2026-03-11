export interface User {
  id: number
  username: string
  telegram_id: number | null
  created_at: string
}

export interface UserUpdateRequest {
  telegram_id?: number | null
}
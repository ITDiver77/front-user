export interface Payment {
  id: number
  user_id: number
  amount: number
  payment_date: string
  period_days: number
  payment_method: string
  notes: string | null
}

export interface PaymentListResponse {
  payments: Payment[]
  total: number
  total_amount: number
  limit: number
  offset: number
}

export interface PaymentCreateRequest {
  user_id: number
  amount: number
  period_days: number
  payment_method?: string
  notes?: string | null
}

export interface PaymentInitiationRequest {
  connection_name: string
  months: number
  payment_method?: string
}

export interface PaymentInitiationResponse {
  payment_id: number
  redirect_url: string
}
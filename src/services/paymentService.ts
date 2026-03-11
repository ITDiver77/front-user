import api from './api'
import { Payment, PaymentListResponse, PaymentInitiationRequest, PaymentInitiationResponse } from '../types/payment'
const MOCK_AUTH = import.meta.env.VITE_MOCK_AUTH === 'true'

export const paymentService = {
  /**
   * Get payments for the current user.
   * @param limit - Maximum number of payments to return (default 100)
   * @param offset - Number of payments to skip (default 0)
   * @returns Payment list with totals
   * @throws {Error} If API request fails or payment gateway error
   */
  getMyPayments: async (limit = 100, offset = 0) => {
    if (MOCK_AUTH) {
      await new Promise(resolve => setTimeout(resolve, 300))
      const mockPayments: Payment[] = [
        { id: 1, user_id: 1, amount: 1000, payment_date: '2025-01-15T10:30:00Z', period_days: 30, payment_method: 'SBPQR', notes: null },
        { id: 2, user_id: 1, amount: 1500, payment_date: '2025-02-10T14:20:00Z', period_days: 30, payment_method: 'SBPQR', notes: 'Renewal' },
      ]
      return {
        payments: mockPayments.slice(offset, offset + limit),
        total: mockPayments.length,
        total_amount: mockPayments.reduce((sum, p) => sum + p.amount, 0),
        limit,
        offset,
      }
    }
    try {
      const response = await api.get<PaymentListResponse>('/payments/', {
        params: { limit, offset }
      })
      return response.data
    } catch (error) {
      console.error('Failed to fetch payments', error)
      throw new Error(`Failed to fetch payments: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  },

  /**
   * Initiate a new payment for connection renewal or new connection.
   * @param data - Payment initiation request including connection_name and months
   * @returns Payment initiation response with payment_id and redirect_url
   * @throws {Error} If payment gateway unreachable, insufficient funds, conflict, etc.
   */
  initiatePayment: async (data: PaymentInitiationRequest) => {
    if (MOCK_AUTH) {
      await new Promise(resolve => setTimeout(resolve, 300))
      // Simulate random failure (10% chance)
      if (Math.random() < 0.1) {
        throw new Error('Payment gateway unreachable')
      }
      return {
        payment_id: Math.floor(Math.random() * 1000) + 100,
        redirect_url: 'https://mock-payment-gateway.example.com/pay?mock=1',
      }
    }
    try {
      const response = await api.post<PaymentInitiationResponse>('/payments/initiate', data)
      return response.data
    } catch (error) {
      console.error('Failed to initiate payment', error)
      // Enhance error message for payment gateway errors
      const e = error as any
      const status = e.status || e.response?.status
      if (status === 402) {
        throw new Error('Payment required: insufficient funds')
      }
      if (status === 409) {
        throw new Error('Payment conflict: duplicate transaction')
      }
      if (status === 503) {
        throw new Error('Payment gateway temporarily unavailable')
      }
      throw new Error(`Failed to initiate payment: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  },

  /**
   * Get payment status by payment ID.
   * @param paymentId - Payment ID (transaction ID)
   * @returns Payment details
   * @throws {Error} If payment not found, insufficient funds, conflict, etc.
   */
  getPaymentStatus: async (paymentId: number) => {
    if (MOCK_AUTH) {
      await new Promise(resolve => setTimeout(resolve, 300))
      // Simulate random failure (5% chance)
      if (Math.random() < 0.05) {
        throw new Error('Payment gateway unreachable')
      }
      // Simulate pending vs completed
      const isCompleted = Math.random() < 0.5
      return {
        id: paymentId,
        user_id: 1,
        amount: 1000,
        payment_date: isCompleted ? new Date().toISOString() : '',
        period_days: 30,
        payment_method: 'SBPQR',
        notes: null,
      }
    }
    try {
      // Use transaction status endpoint per spec
      const response = await api.get<Payment>(`/payments/transaction/${paymentId}/status`)
      return response.data
    } catch (error) {
      console.error('Failed to fetch payment status', error)
      const e = error as any
      const status = e.status || e.response?.status
      if (status === 404) {
        throw new Error('Payment not found')
      }
      if (status === 402) {
        throw new Error('Payment failed: insufficient funds')
      }
      if (status === 409) {
        throw new Error('Payment in conflict state')
      }
      throw new Error(`Failed to fetch payment status: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  },

  /**
   * Poll payment status until completed (for UI).
   * @param paymentId - Payment ID
   * @param interval - Polling interval in milliseconds (default 2000)
   * @param maxAttempts - Maximum polling attempts (default 30)
   * @returns Payment details when payment is completed
   * @throws {Error} If polling timeout or payment fails
   */
  pollPaymentStatus: async (paymentId: number, interval = 2000, maxAttempts = 30) => {
    for (let i = 0; i < maxAttempts; i++) {
      await new Promise(resolve => setTimeout(resolve, interval))
      try {
        const payment = await paymentService.getPaymentStatus(paymentId)
        // Assume payment status is indicated by presence of payment_date or something
        // For now just return payment
        if (payment.payment_date) {
          return payment
        }
      } catch (error) {
        console.error('Error polling payment status', error)
        throw error
      }
    }
    throw new Error('Payment polling timeout')
  },
}
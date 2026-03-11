import { useEffect, useState } from 'react'
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  Chip,
} from '@mui/material'
import { paymentService } from '../services/paymentService'
import { Payment } from '../types/payment'
import { formatDate } from '../utils/dateHelpers'

const PaymentHistory = () => {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')

  const fetchPayments = async () => {
    setLoading(true)
    setError('')
    try {
      // const response = await paymentService.getMyPayments()
      // setPayments(response.payments)
      // Mock data
      const mockPayments: Payment[] = [
        {
          id: 1,
          user_id: 1,
          amount: 10,
          payment_date: '2026-03-01',
          period_days: 30,
          payment_method: 'card',
          notes: null,
        },
        {
          id: 2,
          user_id: 1,
          amount: 5,
          payment_date: '2026-02-01',
          period_days: 30,
          payment_method: 'paypal',
          notes: 'Renewal',
        },
        {
          id: 3,
          user_id: 1,
          amount: 15,
          payment_date: '2026-01-01',
          period_days: 30,
          payment_method: 'crypto',
          notes: null,
        },
      ]
      setPayments(mockPayments)
    } catch (err: any) {
      setError(err.message || 'Failed to load payment history')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPayments()
  }, [])

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Payment History
      </Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {payments.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="textSecondary">
            No payment history found.
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Period (days)</TableCell>
                <TableCell>Method</TableCell>
                <TableCell>Notes</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>{formatDate(payment.payment_date)}</TableCell>
                  <TableCell>${payment.amount.toFixed(2)}</TableCell>
                  <TableCell>{payment.period_days}</TableCell>
                  <TableCell>
                    <Chip label={payment.payment_method} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell>{payment.notes || '-'}</TableCell>
                  <TableCell>
                    <Chip label="Completed" color="success" size="small" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  )
}

export default PaymentHistory
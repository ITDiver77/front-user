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
import { Payment, PaymentStatus } from '../types/payment'
import { formatDate } from '../utils/dateHelpers'

const getStatusColor = (status: PaymentStatus) => {
  switch (status) {
    case 'COMPLETED': return 'success'
    case 'PENDING': return 'warning'
    case 'FAILED': return 'error'
  }
}

const getStatusLabel = (status: PaymentStatus) => {
  switch (status) {
    case 'COMPLETED': return 'Completed'
    case 'PENDING': return 'Pending'
    case 'FAILED': return 'Failed'
  }
}

const PaymentHistory = () => {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const [totalAmount, setTotalAmount] = useState<number>(0)

  const fetchPayments = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await paymentService.getMyPayments()
      setPayments(response.payments)
      setTotalAmount(response.total_amount)
    } catch (err: any) {
      setError(err.message || 'Failed to fetch payments')
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

      {/* Summary Cards */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Paper sx={{ p: 2, minWidth: 150 }}>
          <Typography variant="body2" color="textSecondary">
            Total Paid
          </Typography>
          <Typography variant="h5">
            ${totalAmount.toFixed(2)}
          </Typography>
        </Paper>
        <Paper sx={{ p: 2, minWidth: 150 }}>
          <Typography variant="body2" color="textSecondary">
            Total Payments
          </Typography>
          <Typography variant="h5">
            {payments.length}
          </Typography>
        </Paper>
        <Paper sx={{ p: 2, minWidth: 150 }}>
          <Typography variant="body2" color="textSecondary">
            Pending
          </Typography>
          <Typography variant="h5">
            {payments.filter(p => p.status === 'PENDING').length}
          </Typography>
        </Paper>
      </Box>

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
                    <Chip
                      label={getStatusLabel(payment.status)}
                      color={getStatusColor(payment.status)}
                      size="small"
                    />
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

import { z } from 'zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Typography,
  Box,
  RadioGroup,
  FormControlLabel,
  Radio,
} from '@mui/material'
import { paymentInitiationSchema } from '../../utils/validation'
import { paymentService } from '../../services/paymentService'

interface PaymentInitiationModalProps {
  open: boolean
  onClose: () => void
  connectionName: string
  currentPrice: number
  onSuccess: (paymentId: number) => void
}

type PaymentInitiationFormData = z.infer<typeof paymentInitiationSchema>

const PAYMENT_METHODS = [
  { value: 'card', label: 'Credit/Debit Card' },
  { value: 'paypal', label: 'PayPal' },
  { value: 'crypto', label: 'Cryptocurrency' },
]

const PaymentInitiationModal = ({
  open,
  onClose,
  connectionName,
  currentPrice,
  onSuccess,
}: PaymentInitiationModalProps) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [polling, setPolling] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm<PaymentInitiationFormData>({
    resolver: zodResolver(paymentInitiationSchema),
    defaultValues: {
      months: 1,
      paymentMethod: 'card',
    },
  })

  const months = watch('months')
  const totalAmount = currentPrice * months

  const onSubmit = async (data: PaymentInitiationFormData) => {
    setLoading(true)
    setError('')
    try {
      // TODO: call backend payment initiation
      // const response = await paymentService.initiatePayment({
      //   connection_name: connectionName,
      //   months: data.months,
      //   payment_method: data.paymentMethod,
      // })
      // Mock response
      const mockResponse = { payment_id: 123, redirect_url: 'https://example.com/payment' }
      console.log('Payment initiated:', mockResponse)
      // Simulate redirect or polling
      // For now, just call onSuccess
      onSuccess(mockResponse.payment_id)
      // In real implementation, we would redirect to redirect_url or start polling
      // if (mockResponse.redirect_url) {
      //   window.location.href = mockResponse.redirect_url
      // } else {
      //   startPolling(mockResponse.payment_id)
      // }
    } catch (err: any) {
      setError(err.message || 'Failed to initiate payment')
    } finally {
      setLoading(false)
    }
  }

  const startPolling = (paymentId: number) => {
    setPolling(true)
    // paymentService.pollPaymentStatus(paymentId)
    //   .then(payment => {
    //     setPolling(false)
    //     onSuccess(paymentId)
    //     onClose()
    //   })
    //   .catch(err => {
    //     setPolling(false)
    //     setError('Payment polling failed')
    //   })
  }

  const handleClose = () => {
    reset()
    setError('')
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Extend Connection: {connectionName}</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Typography variant="body2" sx={{ mb: 2 }}>
          Current monthly price: <strong>${currentPrice}</strong>
        </Typography>
        <form id="payment-initiation-form" onSubmit={handleSubmit(onSubmit)}>
          <TextField
            margin="normal"
            fullWidth
            label="Months to add"
            type="number"
            inputProps={{ min: 1, max: 36 }}
            {...register('months', { valueAsNumber: true })}
            error={!!errors.months}
            helperText={errors.months?.message}
          />
          <FormControl fullWidth margin="normal">
            <InputLabel id="payment-method-label">Payment Method</InputLabel>
            <Select
              labelId="payment-method-label"
              label="Payment Method"
              {...register('paymentMethod')}
              defaultValue="card"
            >
              {PAYMENT_METHODS.map((method) => (
                <MenuItem key={method.value} value={method.value}>
                  {method.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Box sx={{ mt: 2, p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="body2" color="textSecondary">
              Total amount:
            </Typography>
            <Typography variant="h5">
              ${totalAmount.toFixed(2)}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              {months} month{months !== 1 ? 's' : ''} × ${currentPrice}/month
            </Typography>
          </Box>
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading || polling}>
          Cancel
        </Button>
        <Button
          type="submit"
          form="payment-initiation-form"
          variant="contained"
          disabled={loading || polling}
        >
          {(loading || polling) ? <CircularProgress size={24} /> : 'Proceed to Payment'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default PaymentInitiationModal
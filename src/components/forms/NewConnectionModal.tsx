import { z } from 'zod'
import { useEffect, useState } from 'react'
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
  FormControlLabel,
  Checkbox,
  Alert,
  CircularProgress,
  Typography,
  Box,
} from '@mui/material'
import { newConnectionSchema } from '../../utils/validation'
import { serverService } from '../../services/serverService'
import { Server } from '../../types/server'

interface NewConnectionModalProps {
  open: boolean
  onClose: () => void
  onCreate: () => void
}

type NewConnectionFormData = z.infer<typeof newConnectionSchema>

const PRICE_PER_MONTH = 5 // TODO: fetch from server or config

const NewConnectionModal = ({ open, onClose, onCreate }: NewConnectionModalProps) => {
  const [servers, setServers] = useState<Server[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [serverLoading, setServerLoading] = useState(true)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm<NewConnectionFormData>({
    resolver: zodResolver(newConnectionSchema),
    defaultValues: {
      serverName: '',
      months: 1,
      connectionName: '',
      autoRenew: true,
    },
  })

  const months = watch('months')
  const totalPrice = months * PRICE_PER_MONTH

  useEffect(() => {
    if (open) {
      fetchServers()
      reset()
      setError('')
    }
  }, [open, reset])

  const fetchServers = async () => {
    setServerLoading(true)
    try {
      // const data = await serverService.getActiveServers()
      // setServers(data)
      // Mock servers
      const mockServers: Server[] = [
        { id: 1, name: 'US-West', host: 'us.example.com', port: 51820, api_key: '', region: 'US', is_default: true, max_users: 100, is_active: true, created_at: '' },
        { id: 2, name: 'EU-Central', host: 'eu.example.com', port: 51820, api_key: '', region: 'EU', is_default: false, max_users: 100, is_active: true, created_at: '' },
        { id: 3, name: 'Asia-Pacific', host: 'ap.example.com', port: 51820, api_key: '', region: 'AP', is_default: false, max_users: 100, is_active: true, created_at: '' },
      ]
      setServers(mockServers)
    } catch (err: any) {
      setError('Failed to load servers')
      console.error(err)
    } finally {
      setServerLoading(false)
    }
  }

  const onSubmit = async (data: NewConnectionFormData) => {
    setLoading(true)
    setError('')
    try {
      // TODO: call backend to initiate payment
      console.log('Create connection:', data)
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      onCreate()
      onClose()
    } catch (err: any) {
      setError(err.message || 'Failed to create connection')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create New Connection</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Box component="form" id="new-connection-form" onSubmit={handleSubmit(onSubmit)}>
          <FormControl fullWidth margin="normal" error={!!errors.serverName}>
            <InputLabel id="server-label">Server</InputLabel>
            <Select
              labelId="server-label"
              label="Server"
              {...register('serverName')}
              disabled={serverLoading}
            >
              {serverLoading && <MenuItem value="">Loading...</MenuItem>}
              {servers.map((server) => (
                <MenuItem key={server.id} value={server.name}>
                  {server.name} ({server.region})
                </MenuItem>
              ))}
            </Select>
            {errors.serverName && (
              <Typography variant="caption" color="error">
                {errors.serverName.message}
              </Typography>
            )}
          </FormControl>
          <TextField
            margin="normal"
            fullWidth
            label="Connection Name (optional)"
            {...register('connectionName')}
            error={!!errors.connectionName}
            helperText={errors.connectionName?.message || 'Leave empty to generate automatically'}
          />
          <TextField
            margin="normal"
            fullWidth
            label="Months"
            type="number"
            inputProps={{ min: 1, max: 36 }}
            {...register('months', { valueAsNumber: true })}
            error={!!errors.months}
            helperText={errors.months?.message}
          />
          <FormControlLabel
            control={<Checkbox {...register('autoRenew')} defaultChecked />}
            label="Enable auto-renew"
          />
          <Box sx={{ mt: 2, p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="body2" color="textSecondary">
              Price per month: ${PRICE_PER_MONTH}
            </Typography>
            <Typography variant="h6">
              Total: ${totalPrice.toFixed(2)} for {months} month{months !== 1 ? 's' : ''}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              Payment will be processed after you confirm.
            </Typography>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          type="submit"
          form="new-connection-form"
          variant="contained"
          disabled={loading || serverLoading}
        >
          {loading ? <CircularProgress size={24} /> : 'Proceed to Payment'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default NewConnectionModal
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Typography,
} from '@mui/material'
import { changeServerSchema } from '../../utils/validation'
import { serverService } from '../../services/serverService'
import { Server } from '../../types/server'
import { connectionService } from '../../services/connectionService'

interface ChangeServerModalProps {
  open: boolean
  onClose: () => void
  connectionName: string
  currentServerName?: string
  onSuccess: () => void
}

type ChangeServerFormData = z.infer<typeof changeServerSchema>

const ChangeServerModal = ({
  open,
  onClose,
  connectionName,
  currentServerName,
  onSuccess,
}: ChangeServerModalProps) => {
  const [servers, setServers] = useState<Server[]>([])
  const [loading, setLoading] = useState(false)
  const [serverLoading, setServerLoading] = useState(true)
  const [error, setError] = useState<string>('')

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ChangeServerFormData>({
    resolver: zodResolver(changeServerSchema),
    defaultValues: {
      newServerName: '',
    },
  })

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

  const onSubmit = async (data: ChangeServerFormData) => {
    setLoading(true)
    setError('')
    try {
      // await connectionService.changeServer(connectionName, data.newServerName)
      console.log('Changing server for', connectionName, 'to', data.newServerName)
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      onSuccess()
      onClose()
    } catch (err: any) {
      setError(err.message || 'Failed to change server')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Change Server for {connectionName}</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Typography variant="body2" sx={{ mb: 2 }}>
          Current server: <strong>{currentServerName || 'Unknown'}</strong>
        </Typography>
        <form id="change-server-form" onSubmit={handleSubmit(onSubmit)}>
          <FormControl fullWidth margin="normal" error={!!errors.newServerName}>
            <InputLabel id="server-label">New Server</InputLabel>
            <Select
              labelId="server-label"
              label="New Server"
              {...register('newServerName')}
              disabled={serverLoading}
            >
              {serverLoading && <MenuItem value="">Loading...</MenuItem>}
              {servers
                .filter(server => server.name !== currentServerName)
                .map((server) => (
                  <MenuItem key={server.id} value={server.name}>
                    {server.name} ({server.region})
                  </MenuItem>
                ))}
            </Select>
            {errors.newServerName && (
              <Typography variant="caption" color="error">
                {errors.newServerName.message}
              </Typography>
            )}
          </FormControl>
        </form>
        <Typography variant="caption" color="textSecondary">
          Changing server will regenerate your connection string. You'll need to update your VPN client configuration.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          type="submit"
          form="change-server-form"
          variant="contained"
          disabled={loading || serverLoading}
        >
          {loading ? <CircularProgress size={24} /> : 'Change Server'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ChangeServerModal
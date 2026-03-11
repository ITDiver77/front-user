import { useState } from 'react'
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Chip,
  IconButton,
  Switch,
  Tooltip,
  Box,
  LinearProgress,
  Button,
} from '@mui/material'
import {
  ContentCopy as CopyIcon,
  Refresh as RefreshIcon,
  Payment as PaymentIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material'
import { Connection } from '../../types/connection'
import { formatDate, getDaysRemaining, getConnectionStatus, getStatusColor } from '../../utils/dateHelpers'

interface ConnectionCardProps {
  connection: Connection
  onToggleAutoRenew: (connectionName: string, autoRenew: boolean) => void
  onCopyConfig: (connectionString: string) => void
  onExtend: (connectionName: string) => void
  onChangeServer: (connectionName: string) => void
}

const ConnectionCard = ({
  connection,
  onToggleAutoRenew,
  onCopyConfig,
  onExtend,
  onChangeServer,
}: ConnectionCardProps) => {
  const [autoRenew, setAutoRenew] = useState(connection.auto_renew ?? false)
  const [copySuccess, setCopySuccess] = useState(false)

  const status = getConnectionStatus(connection.enabled, connection.is_active, connection.paydate)
  const daysRemaining = getDaysRemaining(connection.paydate)
  const statusColor = getStatusColor(status)

  const handleToggleAutoRenew = () => {
    const newValue = !autoRenew
    setAutoRenew(newValue)
    onToggleAutoRenew(connection.connection_name, newValue)
  }

  const handleCopyConfig = () => {
    if (connection.connection_string) {
      navigator.clipboard.writeText(connection.connection_string).then(() => {
        setCopySuccess(true)
        setTimeout(() => setCopySuccess(false), 2000)
      })
    }
  }

  return (
    <Card sx={{ minWidth: 300, maxWidth: 400, m: 1 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography variant="h6" component="div">
            {connection.connection_name}
          </Typography>
          <Chip label={status.toUpperCase()} color={statusColor} size="small" />
        </Box>
        <Typography color="text.secondary" gutterBottom>
          Server: {connection.server_name || 'Unknown'}
        </Typography>
        <Typography variant="body2">
          Price: <strong>${connection.price}</strong> per month
        </Typography>
        <Typography variant="body2">
          Next payment: {formatDate(connection.paydate)}
        </Typography>
        <Typography variant="body2">
          Days remaining: {daysRemaining > 0 ? `${daysRemaining} days` : 'Expired'}
        </Typography>
        {daysRemaining > 0 && daysRemaining <= 7 && (
          <LinearProgress variant="determinate" value={(daysRemaining / 7) * 100} sx={{ mt: 1 }} />
        )}
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
          <Typography variant="body2" sx={{ mr: 1 }}>
            Auto‑renew:
          </Typography>
          <Switch
            checked={autoRenew}
            onChange={handleToggleAutoRenew}
            size="small"
            disabled={!connection.enabled}
          />
          <Typography variant="body2" color="text.secondary">
            {autoRenew ? 'On' : 'Off'}
          </Typography>
        </Box>
      </CardContent>
      <CardActions disableSpacing>
        <Tooltip title="Copy connection string">
          <IconButton onClick={handleCopyConfig} size="small" aria-label="Copy connection string">
            <CopyIcon />
          </IconButton>
        </Tooltip>
        {copySuccess && (
          <Typography variant="caption" color="success.main" sx={{ ml: 1 }}>
            Copied!
          </Typography>
        )}
        <Tooltip title="Extend / Pay">
          <IconButton onClick={() => onExtend(connection.connection_name)} size="small" aria-label="Extend payment">
            <PaymentIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Change server">
          <IconButton onClick={() => onChangeServer(connection.connection_name)} size="small" aria-label="Change server">
            <SettingsIcon />
          </IconButton>
        </Tooltip>
        <Box sx={{ flexGrow: 1 }} />
        <Button
          variant="outlined"
          size="small"
          disabled={!connection.enabled}
          onClick={() => {/* TODO: toggle enable */}}
        >
          {connection.enabled ? 'Disable' : 'Enable'}
        </Button>
      </CardActions>
    </Card>
  )
}

export default ConnectionCard
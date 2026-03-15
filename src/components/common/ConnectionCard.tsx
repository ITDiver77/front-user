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
  onToggleEnabled: (connectionName: string, enabled: boolean) => void
}

const ConnectionCard = ({
  connection,
  onToggleAutoRenew,
  onCopyConfig,
  onExtend,
  onChangeServer,
  onToggleEnabled,
}: ConnectionCardProps) => {
  const [autoRenew, setAutoRenew] = useState(connection.auto_renew ?? false)
  const [enabled, setEnabled] = useState(connection.enabled)
  const [copySuccess, setCopySuccess] = useState(false)

  const status = getConnectionStatus(connection.enabled, connection.is_active, connection.paydate)
  const daysRemaining = getDaysRemaining(connection.paydate)
  const statusColor = getStatusColor(status)

  const handleToggleAutoRenew = () => {
    const newValue = !autoRenew
    setAutoRenew(newValue)
    onToggleAutoRenew(connection.connection_name, newValue)
  }

  const handleToggleEnabled = () => {
    const newValue = !enabled
    setEnabled(newValue)
    onToggleEnabled(connection.connection_name, newValue)
  }

  const handleCopyConfig = () => {
    if (connection.connection_string) {
      navigator.clipboard.writeText(connection.connection_string).then(() => {
        setCopySuccess(true)
        setTimeout(() => setCopySuccess(false), 2000)
      })
    }
  }

  // Show deleted badge if connection is soft-deleted
  const isDeleted = connection.is_deleted === true

  return (
    <Card sx={{ minWidth: 300, maxWidth: 400, m: 1, opacity: isDeleted ? 0.6 : 1 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography variant="h6" component="div">
            {connection.connection_name}
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {isDeleted && (
              <Chip label="DELETED" color="error" size="small" variant="outlined" />
            )}
            <Chip label={status.toUpperCase()} color={statusColor} size="small" />
          </Box>
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
            Auto-renew:
          </Typography>
          <Switch
            checked={autoRenew}
            onChange={handleToggleAutoRenew}
            size="small"
            disabled={!enabled || isDeleted}
          />
          <Typography variant="body2" color="text.secondary">
            {autoRenew ? 'On' : 'Off'}
          </Typography>
        </Box>
      </CardContent>
      <CardActions disableSpacing>
        <Tooltip title="Copy connection string">
          <IconButton onClick={handleCopyConfig} size="small" aria-label="Copy connection string" disabled={isDeleted}>
            <CopyIcon />
          </IconButton>
        </Tooltip>
        {copySuccess && (
          <Typography variant="caption" color="success.main" sx={{ ml: 1 }}>
            Copied!
          </Typography>
        )}
        <Tooltip title="Extend / Pay">
          <IconButton onClick={() => onExtend(connection.connection_name)} size="small" aria-label="Extend payment" disabled={isDeleted}>
            <PaymentIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Change server">
          <IconButton onClick={() => onChangeServer(connection.connection_name)} size="small" aria-label="Change server" disabled={isDeleted}>
            <SettingsIcon />
          </IconButton>
        </Tooltip>
        <Box sx={{ flexGrow: 1 }} />
        <Button
          variant="outlined"
          size="small"
          disabled={isDeleted}
          onClick={handleToggleEnabled}
          color={enabled ? 'warning' : 'success'}
        >
          {enabled ? 'Disable' : 'Enable'}
        </Button>
      </CardActions>
    </Card>
  )
}

export default ConnectionCard

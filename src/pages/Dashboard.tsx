import { useEffect, useState } from 'react'
import {
  Box,
  Button,
  CircularProgress,
  Grid,
  Typography,
  Alert,
  Paper,
  FormControlLabel,
  Switch,
} from '@mui/material'
import { Add as AddIcon } from '@mui/icons-material'
import ConnectionCard from '../components/common/ConnectionCard'
import NewConnectionModal from '../components/forms/NewConnectionModal'
import ChangeServerModal from '../components/forms/ChangeServerModal'
import PaymentInitiationModal from '../components/forms/PaymentInitiationModal'
import { connectionService } from '../services/connectionService'
import { Connection } from '../types/connection'

const Dashboard = () => {
  const [connections, setConnections] = useState<Connection[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const [showNewConnectionModal, setShowNewConnectionModal] = useState(false)
  const [changeServerModalOpen, setChangeServerModalOpen] = useState(false)
  const [selectedConnection, setSelectedConnection] = useState<Connection | null>(null)
  const [paymentModalOpen, setPaymentModalOpen] = useState(false)
  const [paymentConnection, setPaymentConnection] = useState<Connection | null>(null)
  const [showDeleted, setShowDeleted] = useState(false)

  const fetchConnections = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await connectionService.getMyConnections()
      setConnections(data)
    } catch (err: any) {
      setError(err.message || 'Failed to fetch connections')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchConnections()
  }, [])

  const handleToggleAutoRenew = async (connectionName: string, autoRenew: boolean) => {
    try {
      await connectionService.toggleAutoRenew(connectionName, autoRenew)
      fetchConnections()
    } catch (err) {
      console.error('Failed to toggle auto-renew', err)
    }
  }

  const handleToggleEnabled = async (connectionName: string, enabled: boolean) => {
    try {
      await connectionService.toggleEnabled(connectionName, enabled)
      fetchConnections()
    } catch (err) {
      console.error('Failed to toggle enabled state', err)
    }
  }

  const handleCopyConfig = (connectionString: string) => {
    console.log('Copy config:', connectionString)
  }

  const handleExtend = (connectionName: string) => {
    const conn = connections.find(c => c.connection_name === connectionName)
    if (conn) {
      setPaymentConnection(conn)
      setPaymentModalOpen(true)
    }
  }

  const handleChangeServer = (connectionName: string) => {
    const conn = connections.find(c => c.connection_name === connectionName)
    if (conn) {
      setSelectedConnection(conn)
      setChangeServerModalOpen(true)
    }
  }

  const handleServerChangeSuccess = () => {
    fetchConnections()
    setChangeServerModalOpen(false)
    setSelectedConnection(null)
  }

  const handleCloseChangeServerModal = () => {
    setChangeServerModalOpen(false)
    setSelectedConnection(null)
  }

  const handlePaymentSuccess = (paymentId: number) => {
    fetchConnections()
    setPaymentModalOpen(false)
    setPaymentConnection(null)
  }

  const handleClosePaymentModal = () => {
    setPaymentModalOpen(false)
    setPaymentConnection(null)
  }

  // Filter connections based on showDeleted toggle
  const filteredConnections = showDeleted 
    ? connections 
    : connections.filter(c => !c.is_deleted)

  const deletedCount = connections.filter(c => c.is_deleted).length

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">My Connections</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setShowNewConnectionModal(true)}
        >
          New Connection
        </Button>
      </Box>

      {deletedCount > 0 && (
        <Box sx={{ mb: 2 }}>
          <FormControlLabel
            control={
              <Switch
                checked={showDeleted}
                onChange={(e) => setShowDeleted(e.target.checked)}
              />
            }
            label={`Show deleted connections (${deletedCount})`}
          />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {filteredConnections.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="textSecondary">
            {showDeleted ? 'No connections found.' : "You don't have any connections yet. Create your first connection to get started."}
          </Typography>
          {!showDeleted && (
            <Button
              variant="outlined"
              sx={{ mt: 2 }}
              onClick={() => setShowNewConnectionModal(true)}
            >
              Create Connection
            </Button>
          )}
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredConnections.map((conn) => (
            <Grid item key={conn.id} xs={12} sm={6} md={4}>
              <ConnectionCard
                connection={conn}
                onToggleAutoRenew={handleToggleAutoRenew}
                onCopyConfig={handleCopyConfig}
                onExtend={handleExtend}
                onChangeServer={handleChangeServer}
                onToggleEnabled={handleToggleEnabled}
              />
            </Grid>
          ))}
        </Grid>
      )}
      {showNewConnectionModal && (
        <NewConnectionModal
          open={showNewConnectionModal}
          onClose={() => setShowNewConnectionModal(false)}
          onCreate={fetchConnections}
        />
      )}

      {changeServerModalOpen && selectedConnection && (
        <ChangeServerModal
          open={changeServerModalOpen}
          onClose={handleCloseChangeServerModal}
          connectionName={selectedConnection.connection_name}
          currentServerName={selectedConnection.server_name}
          onSuccess={handleServerChangeSuccess}
        />
      )}

      {paymentModalOpen && paymentConnection && (
        <PaymentInitiationModal
          open={paymentModalOpen}
          onClose={handleClosePaymentModal}
          connectionName={paymentConnection.connection_name}
          currentPrice={paymentConnection.price}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </Box>
  )
}

export default Dashboard

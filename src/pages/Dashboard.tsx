import { useEffect, useState } from 'react'
import {
  Box,
  Button,
  CircularProgress,
  Grid,
  Typography,
  Alert,
  Paper,
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

  const fetchConnections = async () => {
    setLoading(true)
    setError('')
    try {
      // Mock data for now (since backend endpoints not ready)
      // const data = await connectionService.getMyConnections()
      // setConnections(data)
      // Simulate mock data
      const mockConnections: Connection[] = [
        {
          id: 1,
          username: 'testuser',
          index: 0,
          connection_name: 'my-vpn-1',
          short_id: 'abc123',
          price: 5,
          paydate: '2026-04-10',
          enabled: true,
          is_active: true,
          created_at: '2026-03-01',
          connection_string: 'vpn://config',
          auto_renew: true,
          server_name: 'US-West',
        },
        {
          id: 2,
          username: 'testuser',
          index: 1,
          connection_name: 'my-vpn-2',
          short_id: 'def456',
          price: 5,
          paydate: '2026-03-05',
          enabled: true,
          is_active: false,
          created_at: '2026-02-01',
          connection_string: 'vpn://config2',
          auto_renew: false,
          server_name: 'EU-Central',
        },
      ]
      setConnections(mockConnections)
    } catch (err: any) {
      setError(err.message || 'Failed to load connections')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchConnections()
  }, [])

  const handleToggleAutoRenew = async (connectionName: string, autoRenew: boolean) => {
    try {
      // await connectionService.toggleAutoRenew(connectionName, autoRenew)
      // Refresh connections
      fetchConnections()
    } catch (err) {
      console.error('Failed to toggle auto-renew', err)
    }
  }

  const handleCopyConfig = (connectionString: string) => {
    // Already handled in ConnectionCard
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
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {connections.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="textSecondary">
            You don't have any connections yet. Create your first connection to get started.
          </Typography>
          <Button
            variant="outlined"
            sx={{ mt: 2 }}
            onClick={() => setShowNewConnectionModal(true)}
          >
            Create Connection
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {connections.map((conn) => (
            <Grid item key={conn.id} xs={12} sm={6} md={4}>
              <ConnectionCard
                connection={conn}
                onToggleAutoRenew={handleToggleAutoRenew}
                onCopyConfig={handleCopyConfig}
                onExtend={handleExtend}
                onChangeServer={handleChangeServer}
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
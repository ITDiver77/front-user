import { Box, Typography, List, ListItem, ListItemIcon, ListItemText, Divider, Paper } from '@mui/material'
import { CheckCircle, Download, Settings, Security, Help } from '@mui/icons-material'

const Instructions = () => {
  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Instructions & Guides
      </Typography>
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          <Security sx={{ verticalAlign: 'middle', mr: 1 }} />
          Getting Started with VPN
        </Typography>
        <Typography variant="body1" paragraph>
          Follow these steps to configure your VPN connection on your device.
        </Typography>
        <List>
          <ListItem>
            <ListItemIcon>
              <Download />
            </ListItemIcon>
            <ListItemText
              primary="Step 1: Download a WireGuard client"
              secondary="WireGuard is available for Windows, macOS, Linux, iOS, and Android. Download the official client from your app store or wireguard.com."
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <Settings />
            </ListItemIcon>
            <ListItemText
              primary="Step 2: Import connection configuration"
              secondary="Copy your connection string from the dashboard and import it into the WireGuard app. On most clients, you can scan a QR code or paste the configuration file."
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <CheckCircle />
            </ListItemIcon>
            <ListItemText
              primary="Step 3: Activate the connection"
              secondary="Toggle the connection to 'Active' within the WireGuard app. Your traffic will now be routed through the VPN server."
            />
          </ListItem>
        </List>
      </Paper>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Troubleshooting
        </Typography>
        <Typography variant="body2" paragraph>
          <strong>Connection fails or times out</strong>
          <br />
          • Ensure your device has internet access.
          <br />
          • Verify that the VPN server is active (check dashboard status).
          <br />
          • Try switching to a different server location.
        </Typography>
        <Typography variant="body2" paragraph>
          <strong>Slow speeds</strong>
          <br />
          • Connect to a server geographically closer to you.
          <br />
          • Avoid peak hours when server load may be higher.
        </Typography>
        <Typography variant="body2" paragraph>
          <strong>Configuration errors</strong>
          <br />
          • Make sure you copied the entire connection string.
          <br />
          • If you changed servers, generate a new connection string.
        </Typography>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          <Help sx={{ verticalAlign: 'middle', mr: 1 }} />
          FAQ
        </Typography>
        <Typography variant="body2" paragraph>
          <strong>Q: How many devices can I use simultaneously?</strong>
          <br />
          A: Each connection is intended for a single device. You can purchase additional connections for multiple devices.
        </Typography>
        <Typography variant="body2" paragraph>
          <strong>Q: Can I change servers after creating a connection?</strong>
          <br />
          A: Yes, use the "Change Server" button on the connection card. This will generate a new configuration.
        </Typography>
        <Typography variant="body2" paragraph>
          <strong>Q: What happens when my subscription expires?</strong>
          <br />
          A: The connection will be disabled until you make a new payment. You can renew before expiration to avoid interruption.
        </Typography>
        <Typography variant="body2" paragraph>
          <strong>Q: Is my data logged?</strong>
          <br />
          A: We operate a strict no‑logging policy. Your privacy is our priority.
        </Typography>
      </Paper>
    </Box>
  )
}

export default Instructions
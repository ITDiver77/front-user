import { z } from 'zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  Link,
  Paper,
  Divider,
} from '@mui/material'
import { Telegram as TelegramIcon } from '@mui/icons-material'
import { authService } from '../services/authService'
import { RegisterStartResponse } from '../types/user'

// Step 1: username only
const usernameSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters').max(50, 'Username must be less than 50 characters'),
})

type UsernameFormData = z.infer<typeof usernameSchema>

const Register = () => {
  const navigate = useNavigate()
  const [step, setStep] = useState<'username' | 'telegram'>('username')
  const [error, setError] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [registerResponse, setRegisterResponse] = useState<RegisterStartResponse | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UsernameFormData>({
    resolver: zodResolver(usernameSchema),
    defaultValues: {
      username: '',
    },
  })

  const onSubmitUsername = async (data: UsernameFormData) => {
    setError('')
    setLoading(true)
    try {
      const response = await authService.registerStart({ username: data.username })
      setRegisterResponse(response)
      setStep('telegram')
    } catch (err: any) {
      setError(err.message || 'Failed to start registration')
    } finally {
      setLoading(false)
    }
  }

  // Step 2: Show Telegram link
  if (step === 'telegram' && registerResponse) {
    return (
      <Container component="main" maxWidth="sm">
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Typography component="h1" variant="h5" gutterBottom>
            Verify with Telegram
          </Typography>
          
          <Alert severity="info" sx={{ mb: 3, width: '100%' }}>
            Please verify your account through our Telegram bot to complete registration.
          </Alert>

          <Paper sx={{ p: 3, width: '100%' }}>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <TelegramIcon sx={{ fontSize: 48, color: '#0088cc', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Open Telegram Bot
              </Typography>
              <Typography variant="body2" color="textSecondary" paragraph>
                Click the button below to open our Telegram bot and press /start with your registration token.
              </Typography>
            </Box>

            <Button
              variant="contained"
              fullWidth
              href={registerResponse.telegram_link}
              target="_blank"
              rel="noopener noreferrer"
              sx={{ mb: 2 }}
            >
              Open Telegram Bot
            </Button>

            <Divider sx={{ my: 2 }} />

            <Typography variant="body2" color="textSecondary" gutterBottom>
              Instructions:
            </Typography>
            <ol style={{ margin: 0, paddingLeft: 20 }}>
              <li>
                <Typography variant="body2">Click "Open Telegram Bot" above</Typography>
              </li>
              <li>
                <Typography variant="body2">Press /start in the chat</Typography>
              </li>
              <li>
                <Typography variant="body2">Enter the registration token when prompted</Typography>
              </li>
              <li>
                <Typography variant="body2">Receive your temporary credentials from the bot</Typography>
              </li>
            </ol>

            <Box sx={{ mt: 3 }}>
              <Typography variant="caption" color="textSecondary" display="block" gutterBottom>
                Registration token (for manual entry):
              </Typography>
              <Paper 
                variant="outlined" 
                sx={{ p: 1, backgroundColor: 'grey.50', fontFamily: 'monospace', fontSize: '0.75rem' }}
              >
                {registerResponse.registration_token}
              </Paper>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Typography variant="body2" color="textSecondary" paragraph>
              After verification, you'll receive your login credentials via Telegram. Use your temporary password to log in.
            </Typography>

            <Button
              component={RouterLink}
              to="/login"
              variant="outlined"
              fullWidth
            >
              Go to Login
            </Button>
          </Paper>
        </Box>
      </Container>
    )
  }

  // Step 1: Username entry
  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h5">
          Sign up
        </Typography>
        <Box component="form" onSubmit={handleSubmit(onSubmitUsername)} sx={{ mt: 1 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Alert severity="info" sx={{ mb: 2 }}>
            Registration requires a Telegram account for verification.
          </Alert>

          <TextField
            margin="normal"
            required
            fullWidth
            id="username"
            label="Username"
            autoComplete="username"
            autoFocus
            {...register('username')}
            error={!!errors.username}
            helperText={errors.username?.message}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Continue'}
          </Button>

          <Box sx={{ textAlign: 'center' }}>
            <Link component={RouterLink} to="/login" variant="body2">
              Already have an account? Sign In
            </Link>
          </Box>
        </Box>
      </Box>
    </Container>
  )
}

export default Register

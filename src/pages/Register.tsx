import { z } from 'zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link as RouterLink } from 'react-router-dom'
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
  ToggleButton,
  ToggleButtonGroup,
  InputAdornment,
  IconButton,
  Chip,
} from '@mui/material'
import {
  Telegram as TelegramIcon,
  Email as EmailIcon,
  Visibility,
  VisibilityOff,
  CheckCircle,
  ContentCopy,
} from '@mui/icons-material'
import { authService } from '../services/authService'
import { RegisterStartResponse } from '../types/user'

// Step 1: username only (for Telegram flow)
const usernameSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters').max(50, 'Username must be less than 50 characters'),
})

type UsernameFormData = z.infer<typeof usernameSchema>

// Password registration schema (without Telegram)
const passwordSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters').max(50, 'Username must be less than 50 characters'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(72, 'Password cannot exceed 72 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

type PasswordFormData = z.infer<typeof passwordSchema>

// Extended response type for site registration
interface SiteRegisterResponse {
  access_token: string
  token_type: string
  password: string
  connection: {
    name: string
    server: string
    enabled: boolean
  }
}

const Register = () => {
  const [registrationMethod, setRegistrationMethod] = useState<'telegram' | 'site'>('telegram')
  const [step, setStep] = useState<'username' | 'telegram'>('username')
  const [error, setError] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [registerResponse, setRegisterResponse] = useState<RegisterStartResponse | null>(null)
  const [siteRegisterResponse, setSiteRegisterResponse] = useState<SiteRegisterResponse | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const {
    register: registerPasswordForm,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    watch,
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      username: '',
      password: '',
      confirmPassword: '',
    },
  })

  const passwordValue = watch('password', '')

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
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start registration'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const onSubmitPassword = async (data: PasswordFormData) => {
    setError('')
    setLoading(true)
    try {
      const registerData = {
        username: data.username,
        password: data.password,
        token: 'site',
      } as unknown as Parameters<typeof authService.register>[0]
      const response = await authService.register(registerData) as SiteRegisterResponse
      setSiteRegisterResponse(response)
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed. Please try again.'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleMethodChange = (_: React.MouseEvent<HTMLElement>, newMethod: 'telegram' | 'site' | null) => {
    if (newMethod !== null) {
      setRegistrationMethod(newMethod)
      setError('')
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  // Success page for site registration
  if (siteRegisterResponse) {
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
          <Paper
            sx={{
              p: 4,
              width: '100%',
              textAlign: 'center',
              background: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)',
              borderRadius: 3,
            }}
          >
            <CheckCircle sx={{ fontSize: 64, color: '#4caf50', mb: 2 }} />
            <Typography component="h1" variant="h5" gutterBottom>
              Registration Successful!
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
              Your account has been created. Please save your credentials below:
            </Typography>

            <Paper
              sx={{
                p: 3,
                mb: 3,
                backgroundColor: 'white',
                borderRadius: 2,
              }}
            >
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="textSecondary" display="block">
                  Username
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography variant="h6" sx={{ fontFamily: 'monospace' }}>
                    {siteRegisterResponse.connection.name}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => copyToClipboard(siteRegisterResponse.connection.name)}
                    sx={{ ml: 1 }}
                  >
                    <ContentCopy fontSize="small" />
                  </IconButton>
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box>
                <Typography variant="caption" color="textSecondary" display="block">
                  Password
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography variant="h6" sx={{ fontFamily: 'monospace' }}>
                    {siteRegisterResponse.password}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => copyToClipboard(siteRegisterResponse.password)}
                    sx={{ ml: 1 }}
                  >
                    <ContentCopy fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
            </Paper>

            <Alert severity="warning" sx={{ mb: 3, textAlign: 'left' }}>
              Please save your password now. You won't be able to see it again!
            </Alert>

            <Button
              component={RouterLink}
              to="/login"
              variant="contained"
              fullWidth
              size="large"
            >
              Go to Login
            </Button>
          </Paper>
        </Box>
      </Container>
    )
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

          <Paper sx={{ p: 3, width: '100%', borderRadius: 3 }}>
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
              sx={{ mb: 2, borderRadius: 2 }}
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
              sx={{ borderRadius: 2 }}
            >
              Go to Login
            </Button>
          </Paper>
        </Box>
      </Container>
    )
  }

  // Step 1: Username entry with method selection
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
          Create Account
        </Typography>

        <ToggleButtonGroup
          value={registrationMethod}
          exclusive
          onChange={handleMethodChange}
          aria-label="registration method"
          sx={{ mb: 3 }}
        >
          <ToggleButton
            value="telegram"
            sx={{
              px: 3,
              borderRadius: '20px !important',
              '&.Mui-selected': {
                backgroundColor: '#e3f2fd',
                color: '#1976d2',
                '&:hover': {
                  backgroundColor: '#bbdefb',
                },
              },
            }}
          >
            <TelegramIcon sx={{ mr: 1 }} />
            Telegram
          </ToggleButton>
          <ToggleButton
            value="site"
            sx={{
              px: 3,
              borderRadius: '20px !important',
              '&.Mui-selected': {
                backgroundColor: '#f3e5f5',
                color: '#7b1fa2',
                '&:hover': {
                  backgroundColor: '#e1bee7',
                },
              },
            }}
          >
            <EmailIcon sx={{ mr: 1 }} />
            Without Telegram
          </ToggleButton>
        </ToggleButtonGroup>

        {registrationMethod === 'telegram' ? (
          <Box component="form" onSubmit={handleSubmit(onSubmitUsername)} sx={{ mt: 1, width: '100%' }}>
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
              sx={{ mt: 3, mb: 2, borderRadius: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Continue with Telegram'}
            </Button>

            <Box sx={{ textAlign: 'center' }}>
              <Link component={RouterLink} to="/login" variant="body2">
                Already have an account? Sign In
              </Link>
            </Box>
          </Box>
        ) : (
          <Paper
            component="form"
            onSubmit={handlePasswordSubmit(onSubmitPassword)}
            sx={{
              p: 3,
              width: '100%',
              borderRadius: 3,
              backgroundColor: '#fafafa',
            }}
          >
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Alert severity="success" sx={{ mb: 2 }}>
              Create your account with a password. No Telegram required!
            </Alert>

            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Username"
              autoComplete="username"
              autoFocus
              {...registerPasswordForm('username')}
              error={!!passwordErrors.username}
              helperText={passwordErrors.username?.message}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              id="password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              {...registerPasswordForm('password')}
              error={!!passwordErrors.password}
              helperText={passwordErrors.password?.message}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              id="confirmPassword"
              label="Confirm Password"
              type={showConfirmPassword ? 'text' : 'password'}
              autoComplete="new-password"
              {...registerPasswordForm('confirmPassword')}
              error={!!passwordErrors.confirmPassword}
              helperText={passwordErrors.confirmPassword?.message}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Box sx={{ mt: 2, mb: 3 }}>
              <Typography variant="caption" color="textSecondary" display="block" gutterBottom>
                Password requirements:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                <Chip
                  size="small"
                  label="Min 8 characters"
                  sx={{ fontSize: '0.7rem' }}
                  color={passwordValue.length >= 8 ? 'success' : 'default'}
                />
                <Chip
                  size="small"
                  label="Uppercase letter"
                  sx={{ fontSize: '0.7rem' }}
                  color={/[A-Z]/.test(passwordValue) ? 'success' : 'default'}
                />
                <Chip
                  size="small"
                  label="Lowercase letter"
                  sx={{ fontSize: '0.7rem' }}
                  color={/[a-z]/.test(passwordValue) ? 'success' : 'default'}
                />
                <Chip
                  size="small"
                  label="Number"
                  sx={{ fontSize: '0.7rem' }}
                  color={/[0-9]/.test(passwordValue) ? 'success' : 'default'}
                />
              </Box>
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="secondary"
              sx={{ mt: 1, mb: 2, borderRadius: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Create Account'}
            </Button>

            <Box sx={{ textAlign: 'center' }}>
              <Link component={RouterLink} to="/login" variant="body2">
                Already have an account? Sign In
              </Link>
            </Box>
          </Paper>
        )}
      </Box>
    </Container>
  )
}

export default Register

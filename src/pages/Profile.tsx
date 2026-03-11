import { z } from 'zod'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  CircularProgress,
  Divider,
  Grid,
} from '@mui/material'
import { changePasswordSchema } from '../utils/validation'
import { useAuth } from '../contexts/AuthContext'
import { userService } from '../services/userService'
import { UserUpdateRequest } from '../types/user'

type ProfileFormData = {
  telegramId: string
}

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>

const Profile = () => {
  const { user, changePassword } = useAuth()
  const [loading, setLoading] = useState(false)
  const [profileLoading, setProfileLoading] = useState(true)
  const [profileError, setProfileError] = useState<string>('')
  const [passwordError, setPasswordError] = useState<string>('')
  const [success, setSuccess] = useState<string>('')
  const [profile, setProfile] = useState<any>(null)

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
    reset: resetProfile,
  } = useForm<ProfileFormData>({
    defaultValues: {
      telegramId: '',
    },
  })

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: resetPassword,
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    setProfileLoading(true)
    try {
      // const data = await userService.getMyProfile()
      // setProfile(data)
      // resetProfile({ telegramId: data.telegram_id?.toString() || '' })
      const mockProfile = {
        username: user?.username || 'user',
        telegram_id: 123456,
      }
      setProfile(mockProfile)
      resetProfile({ telegramId: mockProfile.telegram_id?.toString() || '' })
    } catch (err: any) {
      setProfileError('Failed to load profile')
      console.error(err)
    } finally {
      setProfileLoading(false)
    }
  }

  const onProfileSubmit = async (data: ProfileFormData) => {
    setLoading(true)
    setProfileError('')
    setSuccess('')
    try {
      const updateData: UserUpdateRequest = {
        telegram_id: data.telegramId ? parseInt(data.telegramId, 10) : null,
      }
      // await userService.updateProfile(updateData)
      console.log('Profile updated:', updateData)
      setSuccess('Profile updated successfully')
      fetchProfile()
    } catch (err: any) {
      setProfileError(err.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const onPasswordSubmit = async (data: ChangePasswordFormData) => {
    setLoading(true)
    setPasswordError('')
    setSuccess('')
    try {
      const ok = await changePassword(data.oldPassword, data.newPassword)
      if (ok) {
        setSuccess('Password changed successfully')
        resetPassword()
      } else {
        setPasswordError('Failed to change password. Check your current password.')
      }
    } catch (err: any) {
      setPasswordError(err.message || 'Failed to change password')
    } finally {
      setLoading(false)
    }
  }

  if (profileLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Profile Settings
      </Typography>
      {profileError && <Alert severity="error" sx={{ mb: 2 }}>{profileError}</Alert>}
      {passwordError && <Alert severity="error" sx={{ mb: 2 }}>{passwordError}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Profile Information
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              Update your contact details.
            </Typography>
            <form onSubmit={handleProfileSubmit(onProfileSubmit)}>
              <TextField
                margin="normal"
                fullWidth
                label="Username"
                value={user?.username || ''}
                disabled
              />
              <TextField
                margin="normal"
                fullWidth
                label="Telegram ID"
                type="number"
                {...registerProfile('telegramId')}
                error={!!profileErrors.telegramId}
                helperText={profileErrors.telegramId?.message}
              />
              <Button
                type="submit"
                variant="contained"
                sx={{ mt: 2 }}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Update Profile'}
              </Button>
            </form>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Change Password
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              Enter your current password and choose a new one.
            </Typography>
            <form onSubmit={handlePasswordSubmit(onPasswordSubmit)}>
              <TextField
                margin="normal"
                fullWidth
                label="Current Password"
                type="password"
                {...registerPassword('oldPassword')}
                error={!!passwordErrors.oldPassword}
                helperText={passwordErrors.oldPassword?.message}
              />
              <TextField
                margin="normal"
                fullWidth
                label="New Password"
                type="password"
                {...registerPassword('newPassword')}
                error={!!passwordErrors.newPassword}
                helperText={passwordErrors.newPassword?.message}
              />
              <TextField
                margin="normal"
                fullWidth
                label="Confirm New Password"
                type="password"
                {...registerPassword('confirmPassword')}
                error={!!passwordErrors.confirmPassword}
                helperText={passwordErrors.confirmPassword?.message}
              />
              <Button
                type="submit"
                variant="contained"
                sx={{ mt: 2 }}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Change Password'}
              </Button>
            </form>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}

export default Profile
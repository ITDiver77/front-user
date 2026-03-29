import type { ReactNode } from 'react'
import { Box, Typography } from '@mui/material'
import { motion } from 'framer-motion'
import { staggerContainer, staggerItem } from '../../styles/animations'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          py: 6,
          px: 3,
        }}
      >
        {icon && (
          <motion.div variants={staggerItem}>
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'action.hover',
                mb: 2,
                '& svg': {
                  fontSize: 40,
                  opacity: 0.6,
                },
              }}
            >
              {icon}
            </Box>
          </motion.div>
        )}
        <motion.div variants={staggerItem}>
          <Typography variant="h6" color="text.primary" gutterBottom>
            {title}
          </Typography>
        </motion.div>
        {description && (
          <motion.div variants={staggerItem}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: action ? 2 : 0, maxWidth: 400 }}>
              {description}
            </Typography>
          </motion.div>
        )}
        {action && (
          <motion.div variants={staggerItem}>
            {action}
          </motion.div>
        )}
      </Box>
    </motion.div>
  )
}
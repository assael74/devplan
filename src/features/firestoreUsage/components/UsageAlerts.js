// src/features/firestoreUsage/components/UsageAlerts.js

import React from 'react'
import {
  Alert,
  Box,
  Card,
  Chip,
  Typography,
} from '@mui/joy'

import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded'
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded'
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded'

export default function UsageAlerts({ viewModel }) {
  const alerts = viewModel.alerts

  return (
    <Card
      variant="outlined"
      sx={{
        p: 2,
        borderRadius: 'lg',
        boxShadow: 'sm',
        height: '100%',
        boxSizing: 'border-box',
      }}
    >
      <Typography level="title-lg" sx={{ mb: 1.5 }}>
        התראות מערכת
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {alerts.map(alert => (
          <Alert
            key={alert.id}
            color={alert.color}
            variant="soft"
            startDecorator={
              alert.color === 'danger'
                ? <ErrorOutlineRoundedIcon />
                : alert.color === 'success'
                  ? <CheckCircleOutlineRoundedIcon />
                  : <WarningAmberRoundedIcon />
            }
            sx={{ alignItems: 'flex-start', borderRadius: 'md' }}
          >
            <Box>
              <Typography level="title-sm">
                {alert.title}
              </Typography>

              <Typography level="body-xs" sx={{ mt: 0.5 }}>
                {alert.description}
              </Typography>

              {Array.isArray(alert.metrics) && alert.metrics.length > 0 ? (
                <Box
                  sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 0.75,
                    mt: 1,
                  }}
                >
                  {alert.metrics.map(metric => (
                    <Chip
                      key={`${alert.id}-${metric.label}`}
                      size="sm"
                      variant="outlined"
                      color="neutral"
                    >
                      {metric.label}: {metric.value}
                    </Chip>
                  ))}
                </Box>
              ) : null}

              {alert.note ? (
                <Typography
                  level="body-xs"
                  sx={{ mt: 1, fontWeight: 600 }}
                >
                  {alert.note}
                </Typography>
              ) : null}
            </Box>
          </Alert>
        ))}
      </Box>
    </Card>
  )
}

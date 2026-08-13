import React from 'react'
import {
  Box,
  Card,
  Typography,
} from '@mui/joy'

const numberFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 0,
})

function PayloadMetric({ label, value, emphasized = false }) {
  return (
    <Box
      sx={{
        minWidth: 0,
        px: 1.25,
        py: 1,
        borderRadius: 'md',
        bgcolor: emphasized ? 'primary.softBg' : 'background.level1',
        textAlign: 'center',
      }}
    >
      <Typography level="body-xs" textColor="text.tertiary">
        {label}
      </Typography>
      <Typography
        level="title-lg"
        sx={{ mt: 0.25, fontWeight: 700, whiteSpace: 'nowrap' }}
      >
        {numberFormatter.format(value)} KB
      </Typography>
    </Box>
  )
}

export default function UsagePayloadSummary({ payload }) {
  return (
    <Card
      variant="outlined"
      sx={{
        p: 2,
        borderRadius: 'lg',
        boxShadow: 'sm',
        minHeight: 0,
        height: '100%',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Typography level="title-lg">נפח משוער</Typography>
      <Typography level="body-xs" textColor="text.tertiary" sx={{ mb: 1.25 }}>
        JSON payload משוער — אינו נפח מחויב רשמי
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
          gap: 1,
          mt: 'auto',
        }}
      >
        <PayloadMetric
          label="קריאה"
          value={payload?.estimatedReadKb || 0}
        />
        <PayloadMetric
          label="כתיבה"
          value={payload?.estimatedWriteKb || 0}
        />
        <PayloadMetric
          label="סה״כ"
          value={payload?.totalEstimatedKb || 0}
          emphasized
        />
      </Box>
    </Card>
  )
}

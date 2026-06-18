import React from 'react'
import {
  Box,
  Card,
  Chip,
  LinearProgress,
  Link,
  Typography,
} from '@mui/joy'

import { getUsageStatusColor } from '../sharedLogic/firestoreUsageThresholds.js'

const numberFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 2,
})

const periodLabel = {
  day: 'ביום',
  month: 'בחודש',
  total: 'סה"כ',
}

export default function UsageBillingLimits({ limits }) {
  const rows = Array.isArray(limits?.rows) ? limits.rows : []

  return (
    <Card variant="outlined" sx={{ p: 2, borderRadius: 'lg', boxShadow: 'sm' }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 2,
          mb: 2,
        }}
      >
        <Box>
          <Typography level="title-lg">
            גבולות תשלום Firestore
          </Typography>

          <Typography level="body-xs" textColor="text.tertiary">
            לפי free tier הרשמי של Cloud Firestore
          </Typography>
        </Box>

        <Link
          href={limits?.sourceUrl}
          target="_blank"
          rel="noreferrer"
          level="body-xs"
        >
          מקור רשמי
        </Link>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {rows.map(row => {
          const color = getUsageStatusColor(row.status)

          return (
            <Box key={row.id}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 1,
                  mb: 0.75,
                }}
              >
                <Typography level="body-sm" fontWeight="lg">
                  {row.label}
                </Typography>

                <Chip size="sm" variant="soft" color={color}>
                  {numberFormatter.format(row.value)} / {numberFormatter.format(row.limit)}
                </Chip>
              </Box>

              <LinearProgress
                determinate
                value={row.percent}
                color={color}
                sx={{
                  '--LinearProgress-radius': '999px',
                  '--LinearProgress-thickness': '8px',
                }}
              />

              <Typography level="body-xs" textColor="text.tertiary" sx={{ mt: 0.5 }}>
                נשארו {numberFormatter.format(row.remaining)} {row.unit} {periodLabel[row.period] || ''}
              </Typography>
            </Box>
          )
        })}
      </Box>

      <Typography level="body-xs" textColor="text.tertiary" sx={{ mt: 2 }}>
        {limits?.note}
      </Typography>
    </Card>
  )
}

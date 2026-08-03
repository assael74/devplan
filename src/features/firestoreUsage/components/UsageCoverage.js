// src/features/firestoreUsage/components/UsageCoverage.js

import React from 'react'
import {
  Box,
  Card,
  Chip,
  Typography,
} from '@mui/joy'

export default function UsageCoverage({ coverage }) {
  if (!coverage) return null

  return (
    <Card variant="outlined" sx={{ p: 2, borderRadius: 'lg', boxShadow: 'none' }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: 2,
          alignItems: 'flex-start',
        }}
      >
        <Box>
          <Typography level="title-md">תהליכים מנוטרים</Typography>
          <Typography level="body-xs" textColor="text.tertiary" sx={{ mt: 0.25 }}>
            Registry ידני של תהליכי Firestore שחוברו למדידה. זה אינו אחוז כיסוי של כל הפרויקט.
          </Typography>
        </Box>

        <Chip size="sm" color="primary" variant="soft">
          {coverage.instrumented}
        </Chip>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 1.5 }}>
        <Typography level="body-sm">
          תהליכים רשומים: {coverage.total}
        </Typography>
        <Typography level="body-sm">
          מחוברים למדידה: {coverage.instrumented}
        </Typography>
        <Typography level="body-sm" textColor="warning.600">
          סריקת הכיסוי המלאה טרם אוטומטית
        </Typography>
      </Box>
    </Card>
  )
}

// src/features/hub/controlCenter/shared/KpiCard.js

import React from 'react'
import { Box, Sheet, Skeleton, Typography } from '@mui/joy'

export default function KpiCard({ item, compact = false }) {
  const hasContent = Boolean(item)

  return (
    <Sheet
      variant="outlined"
      sx={{
        minWidth: compact ? 148 : 0,
        minHeight: compact ? 84 : 96,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: 0.75,
        p: compact ? 1.1 : 1.25,
        borderRadius: 12,
        borderColor: 'divider',
        bgcolor: 'background.surface',
      }}
    >
      {hasContent ? (
        <>
          <Typography level="body-xs" sx={{ color: 'text.secondary' }}>
            {item.label}
          </Typography>

          <Typography level={compact ? 'title-md' : 'title-lg'} sx={{ fontWeight: 700 }}>
            {item.value}
          </Typography>

          <Typography level="body-xs" sx={{ color: 'text.tertiary' }}>
            {item.secondary}
          </Typography>
        </>
      ) : (
        <Box aria-hidden="true" sx={{ display: 'grid', gap: 0.8 }}>
          <Skeleton variant="text" level="body-xs" width="48%" />
          <Skeleton variant="text" level={compact ? 'title-md' : 'title-lg'} width="66%" />
          <Skeleton variant="text" level="body-xs" width="78%" />
        </Box>
      )}
    </Sheet>
  )
}

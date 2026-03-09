// src/shared/performance/StatCard.js
import React from 'react'
import { Box, Sheet, Typography } from '@mui/joy'
import { iconUi } from '../../core/icons/iconUi.js'

export default function StatCard({ iconId, label, value, sub }) {
  const hasSub = !!sub

  return (
    <Sheet variant="outlined" sx={{ p: 1, borderRadius: 'md', display: 'flex', justifyContent: 'space-between', gap: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 0 }}>
        {iconId ? iconUi({ id: iconId, sx: { fontSize: 18, opacity: 0.75 } }) : null}
        <Typography level="body-xs" noWrap sx={{ opacity: 0.9 }}>{label}</Typography>
      </Box>

      <Box
        sx={{
          textAlign: 'left',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: hasSub ? 'flex-start' : 'center',
          lineHeight: 1,
        }}
      >
        <Typography level="title-sm">{value ?? '—'}</Typography>
        {hasSub ? <Typography level="body-xs" sx={{ opacity: 0.8 }}>{sub}</Typography> : null}
      </Box>
    </Sheet>
  )
}

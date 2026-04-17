// src/features/players/payments/PaymentsSummary.js

import React from 'react'
import { Sheet, Box, Typography } from '@mui/joy'

function Card({ label, value, color }) {
  return (
    <Sheet variant="soft" color={color} sx={{ p: 1, borderRadius: 'md', border: '1px solid', borderColor: 'divider' }}>
      <Typography level="body-xs" sx={{ opacity: 0.7 }}>{label}</Typography>
      <Typography level="title-lg">{value ?? 0}</Typography>
    </Sheet>
  )
}

export default function PaymentsSummary({ summary }) {
  const s = summary || {}
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, minmax(120px, 0.75fr))',
        gap: 1,
        px: 2,
        mb: 2,
        '@media (max-width: 900px)': { gridTemplateColumns: 'repeat(2, minmax(120px, 0.75fr))' },
      }}
    >
      <Card label="שולם" value={s.done} color='success' />
      <Card label="פתוח" value={s.open} color='danger' />
      <Card label="חשבונית" value={s.invoice} />
      <Card label="סה״כ" value={s.total} />
    </Box>
  )
}

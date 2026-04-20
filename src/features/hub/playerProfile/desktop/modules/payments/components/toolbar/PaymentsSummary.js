// playerProfile/desktop/modules/payments/components/toolbar/PaymentsSummary.js

import React from 'react'
import { Sheet, Box, Typography } from '@mui/joy'

import { toolbarSx as sx } from './../../sx/toolbar.sx.js'

function Card({ label, value, color }) {
  return (
    <Sheet variant="soft" color={color} sx={sx.card}>
      <Typography level="body-xs" sx={{ opacity: 0.7 }}>{label}</Typography>
      <Typography level="title-lg">{value ?? 0}</Typography>
    </Sheet>
  )
}

export default function PaymentsSummary({ summary }) {
  const s = summary || {}
  return (
    <Box sx={sx.boxWrap}>
      <Card label="שולם" value={s.done} color='success' />
      <Card label="פתוח" value={s.open} color='danger' />
      <Card label="חשבונית" value={s.invoice} />
      <Card label="סה״כ" value={s.total} />
    </Box>
  )
}

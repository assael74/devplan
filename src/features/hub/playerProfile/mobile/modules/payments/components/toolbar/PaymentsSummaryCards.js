// playerProfile/mobile/modules/payments/components/cardUi/PaymentsSummaryCards.js

import React from 'react'
import { Box, Sheet, Typography, Chip } from '@mui/joy'

import { toolbarSx as sx } from '../../sx/toolbar.sx.js'

function SummaryCard({ label, value, color = 'neutral' }) {
  return (
    <Chip size='sm' variant="soft" color={color} sx={{ border: '1px solid', borderColor: 'divider' }}>
      {label} : {value ?? 0}
    </Chip>
  )
}

export default function PaymentsSummaryCards({ summary }) {
  const s = summary || {}

  return (
    <Box className="dpScrollThin" sx={sx.summaryScroll}>
      <SummaryCard label="שולם" value={s.done} color="success" />
      <SummaryCard label="פתוח" value={s.open} color="danger" />
      <SummaryCard label="חשבונית" value={s.invoice} />
      <SummaryCard label="סה״כ" value={s.total} />
    </Box>
  )
}

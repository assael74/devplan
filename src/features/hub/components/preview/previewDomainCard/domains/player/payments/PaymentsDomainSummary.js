// src/features/players/components/preview/PreviewDomainCard/domains/payments/PaymentsDomainSummary.js
import React, { useMemo } from 'react'
import { Box, Chip, Typography } from '@mui/joy'
import { buildPaymentsCardKpis } from './payments.domain.logic'
import { domainBoxSx } from '../../domain.sx'

const Row = ({ label, value, color }) => {
  const has = value != null && String(value) !== ''
  return (
    <Box {...domainBoxSx}>
      <Typography level="body-xs" sx={{ fontSize: '0.5rem', fontWeight: 700, opacity: 0.9 }}>
        {label}
      </Typography>
      <Chip size="sm" variant="soft" color={has ? color : 'neutral'}>
        {has ? value : '—'}
      </Chip>
    </Box>
  )
}

export default function PaymentsDomainSummary({ entity }) {
  const payments = entity?.payments || entity?.playerPayments || [] // תומך גם אם השם אצלך שונה
  const k = useMemo(() => buildPaymentsCardKpis(payments), [payments])

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.6, mb: 1, width: '100%' }}>
      <Row label="שולם" value={k.lastPaidLabel} color="success" />
      <Row label="פתוח" value={k.nextOpenLabel} color={k.hasOpen ? 'warning' : 'neutral'} />
    </Box>
  )
}

// preview/previewDomainCard/domains/player/payments/PlayerPaymentsDomainSummary.js

import React, { useMemo } from 'react'
import { Box, Chip, Typography } from '@mui/joy'

import { resolvePlayerPaymentsDomain, formatPaymentsLabel } from './logic/playerPayments.domain.logic.js'
import { domainBoxSx } from '../../domain.sx'

const Row = ({ label, value, color }) => {
  const has = value != null && String(value).trim() !== ''

  return (
    <Box {...domainBoxSx}>
      <Typography level="body-xs" sx={{ fontSize: '0.65rem', fontWeight: 700, opacity: 0.9 }}>
        {label}
      </Typography>

      <Chip size="sm" variant="soft" color={has ? color : 'neutral'}>
        {has ? value : '—'}
      </Chip>
    </Box>
  )
}

export default function PlayerPaymentsDomainSummary({ entity, context }) {
  const livePlayer = useMemo(() => {
    const players = Array.isArray(context?.players) ? context.players : []
    return players.find((p) => p?.id === entity?.id) || entity || null
  }, [context?.players, entity])

  const { summary } = useMemo(() => resolvePlayerPaymentsDomain(livePlayer), [livePlayer])

  const lastLabel = formatPaymentsLabel(summary?.lastPayment)
  const nextLabel = formatPaymentsLabel(summary?.nextOpenPayment)
  //const hasNext = !!summary?.nextMeeting
  //const count = summary?.total || 0

  //const nextColor = count === 0 ? 'neutral' : hasNext ? 'primary' : 'success'

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, px: 0.5, width: '100%' }}>
      <Row label="אחרון" value={lastLabel} color="neutral" />
      <Row label="הבא" value={nextLabel} color='neutral' />
    </Box>
  )
}

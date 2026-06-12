// domains/team/performance/TeamPerformanceDomainSummary.js
import React from 'react'
import { Box, Chip, Typography } from '@mui/joy'
import { domainBoxSx } from '../../domain.sx'

export function fractionToPercent(value, decimals = 0) {
  if (!value || typeof value !== 'string') return null

  const [a, b] = value.split('/').map(Number)
  if (!Number.isFinite(a) || !Number.isFinite(b) || b === 0) return null

  const pct = (a / b) * 100
  return pct == null ? '0%' : `${Number(pct.toFixed(decimals))}%`
}

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

export default function TeamPerformanceDomainSummary({ entity }) {
  const leaguePosition = entity?.Position ?? null
  const poitns = entity?.points ?? null
  const per = fractionToPercent('3/4', 0)

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 0.6, px: 0.5, width: '100%' }}>
      <Row label="נקודות" value={poitns} color="success" />
      <Row label="אחוז צבירת נקודות" value={per} color="success" />
      <Row label="מיקום בליגה" value={leaguePosition} color="primary" />
    </Box>
  )
}

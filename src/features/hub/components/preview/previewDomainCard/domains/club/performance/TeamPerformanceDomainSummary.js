// domains/team/performance/TeamPerformanceDomainSummary.js
import React, { useMemo } from 'react'
import { Box, Chip, Typography } from '@mui/joy'
import { resolveTeamPerformanceDomain } from './TeamPerformance.domain.logic'
import { teamPerformanceModalSx as sx, domainBoxSx } from './performance.sx'

export function fractionToPercent(value, decimals = 0) {
  if (!value || typeof value !== 'string') return null

  const [a, b] = value.split('/').map(Number)
  if (!Number.isFinite(a) || !Number.isFinite(b) || b === 0) return null

  const pct = (a / b) * 100
  return pct == null ? '0%' : `${Number(pct.toFixed(decimals))}%`
}

const Stat = ({ label, value, color }) => {
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

export default function TeamPerformanceDomainSummary({ entity, items }) {
  const { stats } = useMemo(
    () => resolveTeamPerformanceDomain(entity, items),
    [entity, items]
  )
  const leaguePosition = entity?.Position ?? null
  const poitns = entity?.points ?? null
  const per = fractionToPercent('3/4', 0)

  return (
    <Box sx={{ mt: 3, ml: 1 }}>
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.6 }}>
      <Stat
        label="נקודות"
        value={poitns}
        color="success"
      />
      <Stat
        label="אחוז צבירת נקודות"
        value={per}
        color="success"
      />
      <Stat
        label="מיקום בליגה"
        value={leaguePosition}
        color="primary"
      />

      </Box>
    </Box>
  )
}

// src/features/players/components/preview/PreviewDomainCard/domains/performance/performanceDomainSummary.js
import React, { useMemo } from 'react'
import { Box, Chip, Typography } from '@mui/joy'
import { resolvePerformanceDomain } from './performance.domain.logic'
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

export default function PerformanceDomainSummary({ entity }) {
  const { stats } = useMemo(
    () => resolvePerformanceDomain(entity),
    [entity]
  )

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.6, width: '100%' }}>
      <Row label="שערים" value={stats.goals} color="success" />
      <Row label="בישולים" value={stats.assists} color="success" />
    </Box>
  )
}

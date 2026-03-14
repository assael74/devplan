/// preview/PreviewDomainCard/domains/abilities/team/TeamAbilitiesDomainSummary.js

import React, { useMemo } from 'react'
import { Box, Chip, Typography } from '@mui/joy'
import { domainBoxSx } from '../../domain.sx'
import { resolveTeamAbilitiesDomain } from '../../../../../../../../shared/abilities/abilities.domain.logic'

const Row = ({ label, value, color = 'neutral' }) => {
  const hasValue = value != null && String(value).trim() !== '' && value !== '—'

  return (
    <Box {...domainBoxSx}>
      <Typography
        level="body-xs"
        sx={{ fontSize: '0.55rem', fontWeight: 700, opacity: 0.85 }}
      >
        {label}
      </Typography>

      <Chip size="sm" variant="soft" color={hasValue ? color : 'neutral'}>
        {hasValue ? value : '—'}
      </Chip>
    </Box>
  )
}

export default function TeamAbilitiesDomainSummary({ entity, context }) {
  const { summary } = useMemo(() => resolveTeamAbilitiesDomain(entity, context), [entity, context])

  const completion = summary?.total ? `${summary.filled}/${summary.total}` : '—'
  const avgAll = summary?.avgAll != null ? summary.avgAll : '—'
  const strongest = summary?.strongest ? `${summary.strongest.domainLabel} ${summary.strongest.avg}` : '—'
  const weakest = summary?.weakest ? `${summary.weakest.domainLabel} ${summary.weakest.avg}` : '—'

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 0.75, width: '100%' }}>
      <Row label="הושלמו" value={completion} color="primary" />
      <Row label="ממוצע" value={avgAll} color="neutral" />
      <Row label="חוזקה" value={strongest} color="success" />
      <Row label="חולשה" value={weakest} color="warning" />
    </Box>
  )
}

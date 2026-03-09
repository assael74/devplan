/// src/features/players/components/preview/PreviewDomainCard/domains/abilities/player/abilitiesDomainSummary.js
import React, { useMemo } from 'react'
import { Box, Chip, Typography } from '@mui/joy'
import { resolveAbilitiesDomain } from '../../../../../../../../shared/abilities/abilities.domain.logic.js'
import { domainBoxSx } from '../../domain.sx'

const Row = ({ label, value, value2, color = 'neutral' }) => {
  const has = value != null && String(value) !== ''
  return (
    <Box {...domainBoxSx}>
      <Typography level="body-xs" sx={{ fontWeight: 700, opacity: 0.9 }}>
        {label}
      </Typography>
      <Chip size="sm" variant="soft" color={has ? color : 'neutral'}>
        {has ? value : '—'}
      </Chip>
    </Box>
  )
}

export default function PlayerAbilitiesDomainSummary({ entity }) {
  const { summary } = useMemo(
    () => resolveAbilitiesDomain(entity),
    [entity]
  )

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.6, width: '100%' }}>
      <Row
        label="חוזקה:"
        value={summary?.strongest ? `${summary.strongest.domainLabel} (${summary.strongest.avg})` : '—'}
        color="success"
      />
      <Row
        label="חולשה:"
        value={summary?.weakest ? `${summary.weakest.domainLabel} (${summary.weakest.avg})` : '—'}
        color="danger"
      />
    </Box>
  )
}

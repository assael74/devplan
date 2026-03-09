// domains/team/games/TeamGamesDomainSummary.js
import React, { useMemo } from 'react'
import { Box, Chip, Typography } from '@mui/joy'
import { resolveTeamGamesDomain } from './logic/teamGames.domain.logic'
import { domainBoxSx } from '../../domain.sx'
import { getFullDateIl } from '../../../../../../../../shared/format/dateUtiles.js'

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

export default function TeamGamesDomainSummary({ entity }) {
  const { summary } = useMemo(() => resolveTeamGamesDomain(entity), [entity])
  const next = summary?.nextGame

  const nextText = next
    ? `${getFullDateIl(next.dateRaw)} | ${next.rival}`
    : 'אין משחק עתידי'

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.6, px: 0.5, width: '100%' }}>
      <Row label="ליגה" value={summary?.league || '—'} />
      <Row label="משחק קרוב" value={nextText} />
    </Box>
  )
}

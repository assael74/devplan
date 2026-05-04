// domains/team/games/TeamGamesDomainSummary.js

import React, { useMemo } from 'react'
import { Box, Chip, Typography } from '@mui/joy'

import { resolveTeamGamesDomain } from './logic/teamGames.domain.logic'
import { domainBoxSx } from '../../domain.sx'
import { getFullDateIl } from '../../../../../../../../../shared/format/dateUtiles.js'

const Row = ({ label, value, color }) => {
  const has = value != null && String(value) !== ''

  return (
    <Box {...domainBoxSx}>
      <Typography level="body-xs" sx={{ fontSize: '0.5rem', fontWeight: 700, opacity: 0.9 }}>
        {label}
      </Typography>

      <Chip size="sm" variant="soft" color={has ? color || 'primary' : 'neutral'}>
        {has ? value : '—'}
      </Chip>
    </Box>
  )
}

export default function TeamGamesDomainSummary({ entity }) {
  const { summary } = useMemo(() => resolveTeamGamesDomain(entity), [entity])

  const next = summary?.nextGame
  const leagueStats = summary?.leagueStats || {}

  const leagueText = summary?.league || '—'
  const positionText = summary?.position && summary.position !== '—'
    ? `מקום ${summary.position}`
    : 'מיקום לא עודכן'

  const pointsText =
    leagueStats?.maxPoints > 0
      ? `${leagueStats.points} / ${leagueStats.maxPoints} נק׳`
      : 'לא עודכן'

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: 0.6,
        px: 0.5,
        width: '100%',
      }}
    >
      <Row label="ליגה" value={leagueText} color="primary" />
      <Row label="מיקום" value={positionText} color="neutral" />
      <Row label="נקודות" value={pointsText} color="warning" />
    </Box>
  )
}

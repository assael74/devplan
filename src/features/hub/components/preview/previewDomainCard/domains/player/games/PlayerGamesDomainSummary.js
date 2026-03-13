// domains/player/games/PlayerGamesDomainSummary.js
import React, { useMemo } from 'react'
import { Box, Chip, Typography } from '@mui/joy'
import { resolvePlayerGamesDomain } from './logic/playerGames.domain.logic'
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

export default function PlayerGamesDomainSummary({ entity }) {
  const { summary } = useMemo(() => resolvePlayerGamesDomain(entity), [entity])
  const next = summary?.nextGame

  const nextText = next ? `${next.dateLabel} | ${next.rival}` : 'אין משחק עתידי'
  const gridTemp = next ? '0.8fr 1fr 1.8fr' : '0.8fr 1fr 0.8fr'

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: gridTemp, gap: 0.75, px: 0.5, width: '100%', }}>
      <Row
        label="משחקים"
        value={`${summary?.teamGamesTotal ?? 0}/${summary?.gamesIncluded ?? 0}`}
        color="primary"
      />

      <Row
        label="דקות"
        value={`${summary?.minutesPossible ?? 0}/${summary?.minutesPlayed ?? 0} - (${summary?.minutesPct ?? 0}%)`}
        color="warning"
      />

      {!next && (
        <Row
          label="פתח"
          value={`${summary?.starts ?? 0} פעמים`}
          color="success"
        />
      )}

      {next && (
        <Row
          label="משחק קרוב"
          value={nextText}
          color="neutral"
        />
      )}
    </Box>
  )
}

// preview/previewDomainCard/domains/club/teams/ClubTeamsDomainSummary.js

import React, { useMemo } from 'react'
import { Box, Chip, Typography } from '@mui/joy'
import { buildClubTeamRows } from './logic/clubTeams.domain.logic'
import { domainBoxSx } from '../../domain.sx'

const Row = ({ label, value, color = 'neutral' }) => {
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

export default function ClubTeamsDomainSummary({ entity }) {
  const { summary } = useMemo(() => {
    return buildClubTeamRows(entity)
  }, [entity])

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 0.6,
        px: 0.5,
        width: '100%',
      }}
    >
      <Row label="קבוצות פעילות" value={summary?.activeTeamsTotal ?? 0} color="primary" />
      <Row label="קבוצות פרויקט" value={summary?.projectTeamsTotal ?? 0} color="success" />
    </Box>
  )
}

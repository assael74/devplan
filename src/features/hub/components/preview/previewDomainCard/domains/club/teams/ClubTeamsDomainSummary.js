// preview/previewDomainCard/domains/club/teams/ClubTeamsDomainSummary.js
import React, { useMemo } from 'react'
import { Box, Chip, Typography } from '@mui/joy'
import { resolveClubTeamsDomain } from './clubTeams.domain.logic'
import { domainBoxSx } from '../../domain.sx'
import { iconUi } from '../../../../../../../../ui/core/icons/iconUi'

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

export default function ClubTeamsDomainSummary({ entity }) {
  const { summary, state } = useMemo(() => resolveClubTeamsDomain(entity), [entity])

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.6, width: '100%'}}>
      <Row iconId="team" label="קבוצות" value={summary.totalTeams} />
    </Box>
  )
}

// preview/previewDomainCard/domains/club/teams/ClubTeamsDomainSummary.js

import React, { useMemo } from 'react'
import { Box, Chip, Typography } from '@mui/joy'
import { iconUi } from '../../../../../../../../ui/core/icons/iconUi'
import { resolveClubTeamsDomain } from './logic/clubTeams.domain.logic'
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
  const { summary, state } = useMemo(() => resolveClubTeamsDomain(entity), [entity])

  if (state === 'PARTIAL') {
    return (
      <Box sx={{ mt: 1.5, ml: 1, opacity: 0.75, display: 'flex', alignItems: 'center', gap: 0.75 }}>
        {iconUi({ id: 'info', size: 'sm' })}
        <Typography level="body-sm">טוען נתוני קבוצות…</Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.6, px: 0.5, width: '100%' }}>
      <Row label="קבוצות" value={summary?.totalTeams ?? 0} color="primary" />
      <Row label="פעילות" value={summary?.activeTeams ?? 0} color="success" />
    </Box>
  )
}

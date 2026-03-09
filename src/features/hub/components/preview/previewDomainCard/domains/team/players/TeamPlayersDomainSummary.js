/// previewDomainCard/domains/team/players/TeamPlayersDomainSummary.js

import React, { useMemo } from 'react'
import { Box, Chip, Typography } from '@mui/joy'
import { iconUi } from '../../../../../../../../ui/core/icons/iconUi'
import { resolveTeamPlayersDomain } from './logic/teamPlayers.domain.logic'
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

export default function TeamPlayersDomainSummary({ entity }) {
  const { summary, state } = useMemo(() => resolveTeamPlayersDomain(entity), [entity])

  if (state === 'PARTIAL') {
    return (
      <Box sx={{ mt: 1.5, ml: 1, opacity: 0.75, display: 'flex', alignItems: 'center', gap: 0.75 }}>
        {iconUi({ id: 'info', size: 'sm' })}
        <Typography level="body-sm">טוען נתוני שחקנים…</Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.6, px: 0.5, width: '100%' }}>
      <Row iconId="players" label="שחקני קבוצה" value={summary?.playersCount ?? 0} />
      <Row iconId="keyPlayer" label="שחקני מפתח" value={summary?.keyCount ?? 0} />
    </Box>
  )
}

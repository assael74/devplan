// preview/previewDomainCard/domains/club/players/ClubPlyersDomainSummary.js
import React, { useMemo } from 'react'
import { Box, Chip, Typography } from '@mui/joy'
import { iconUi } from '../../../../../../../../ui/core/icons/iconUi'
import { resolveClubPlayersDomain } from './clubPlayers.domain.logic'
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

export default function ClubPlayersDomainSummary({ entity }) {
  const { summary, state } = useMemo(() => resolveClubPlayersDomain(entity), [entity])

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.6, width: '100%'}}>
      <Row iconId="star" label="שחקני מפתח (סה״כ)" value={summary?.keyCount ?? 0} />
      <Row iconId="chart" label="כלל שחקני המועדון" value={summary?.players ?? 0} />
    </Box>
  )
}

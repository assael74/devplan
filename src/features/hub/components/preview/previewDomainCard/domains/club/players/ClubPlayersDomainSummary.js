// preview/previewDomainCard/domains/club/players/ClubPlayersDomainSummary.js

import React, { useMemo } from 'react'
import { Box, Chip, Typography } from '@mui/joy'
import { iconUi } from '../../../../../../../../ui/core/icons/iconUi'
import { resolveClubPlayers } from './logic/clubPlayers.domain.logic'
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

export default function ClubPlayersDomainSummary({ entity }) {
  const { summary } = useMemo(() => {
    return resolveClubPlayers(entity)
  }, [entity])

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 0.6, px: 0.5, width: '100%' }}>
      <Row label="פעילים" value={summary?.active ?? 0} color="warning" />
      <Row label="מפתח" value={summary?.key ?? 0} color="primary" />
      <Row label="פרויקט" value={summary?.project ?? 0} color="success" />
    </Box>
  )
}

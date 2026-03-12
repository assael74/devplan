// src/features/players/components/preview/PreviewDomainCard/domains/player/InfoDomainSummary.js

import React from 'react'
import { Box, Chip, Typography } from '@mui/joy'
import { domainBoxSx } from '../../domain.sx'
import {
  formatPlayerPhone,
  isPlaceholderPhone,
} from './logic/playerInfo.domain.logic.js'

const Row = ({ label, value, color = 'neutral' }) => {
  const hasValue = value != null && String(value).trim() !== '' && value !== '—'

  return (
    <Box {...domainBoxSx}>
      <Typography level="body-xs" sx={{ fontSize: '0.55rem', fontWeight: 700, opacity: 0.85 }}>
        {label}
      </Typography>

      <Chip size="sm" variant="soft" color={hasValue ? color : 'neutral'}>
        {hasValue ? value : '—'}
      </Chip>
    </Box>
  )
}

export default function PlayerInfoDomainSummary({ entity }) {
  const player = entity || {}

  const birthDay = String(player?.birthDay || '').trim() || '—'
  const phone = formatPlayerPhone(player?.phone)
  const phoneOk = !isPlaceholderPhone(player?.phone)

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 0.75, width: '100%' }}>
      <Row label="תאריך לידה" value={player.playerBirth}  />
      <Row label="גיל" value={player.age}  />
      <Row label="טלפון" value={phone} color={phoneOk ? 'primary' : 'warning'} />
    </Box>
  )
}

// preview/previewDomainCard/domains/player/videos/PlayerVideosDomainSummary.js

import React, { useMemo } from 'react'
import { Box, Chip, Typography } from '@mui/joy'

import { resolvePlayerVideosDomain } from './logic/playerVideos.domain.logic.js'
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

export default function PlayerVideosDomainSummary({ entity, tags }) {
  const { summary } = useMemo(
    () => resolvePlayerVideosDomain(entity, {}, { tags }),
    [entity, tags]
  )

  const firstTopic = Array.isArray(summary?.topTopics)? summary.topTopics[0]: null

  const topTopicLabel = firstTopic?.label || 'אין נושא'
  const paceLabel =summary?.avgVideosPerActiveMonth > 0? `${summary.avgVideosPerActiveMonth} לחודש`: 'אין קצב'

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 0.6, px: 0.5, width: '100%' }}>
      <Row label="וידאו:" value={summary?.totalVideos ?? 0} color="primary" />

      <Row label="קצב:" value={paceLabel} color="success" />

      <Row label="נושא:" value={topTopicLabel} color="neutral" />
    </Box>
  )
}

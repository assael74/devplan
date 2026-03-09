// preview/previewDomainCard/domains/player/videos/PlayerVideosDomainSummary.js
import React, { useMemo } from 'react'
import { Box, Chip, Typography } from '@mui/joy'
import { resolvePlayerVideosDomain } from './playerVideos.domain.logic'
import { domainBoxSx } from '../../domain.sx'

import { iconUi } from '../../../../../../../../ui/core/icons/iconUi'
import { getEntityColors } from '../../../../../../../../ui/core/theme/Colors.js'

const Row = ({ label, value, value2, color = 'neutral' }) => {
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
  const { summary, state } = useMemo(
    () => resolvePlayerVideosDomain(entity, {}, { tags }),
    [entity, tags]
  )

  const topTags = Array.isArray(summary?.topTagsAll) ? summary.topTagsAll : []
  const topTagNames = topTags.map((x) => {
    const label = x?.tag?.tagName || 'תג'
    const count = x?.count || 0
    return `${label} · ${count}`
  })
  const length = topTagNames.length > 0

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.6, px: 0.5, width: '100%' }}>
      <Row label="וידאו:" value={summary?.totalVideos ?? 0} color="primary" />
      <Row label="תגים:" value={length ? topTagNames[0]: 'אין תגים'} color="success" />
    </Box>
  )
}

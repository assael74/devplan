// preview/previewDomainCard/domains/team/videos/TeamVideosDomainSummary.js
import React, { useMemo } from 'react'
import { Box, Chip, Typography } from '@mui/joy'

import { resolveTeamVideosDomain } from './teamVideos.domain.logic.js'
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

export default function TeamVideosDomainSummary({ entity, tags }) {
  const { summary } = useMemo(
    () => resolveTeamVideosDomain(entity, {}, { tags }),
    [entity, tags]
  )

  const topTags = Array.isArray(summary?.topTagsAll) ? summary.topTagsAll : []
  const firstTag = topTags[0]
  const topTagLabel = firstTag
    ? `${firstTag?.tag?.tagName || firstTag?.tag?.label || 'תג'} · ${firstTag?.count || 0}`
    : 'אין תגים'

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
      <Row label="וידאו" value={summary?.totalVideos ?? 0} color="primary" />
      <Row label="שחקנים" value={summary?.playersWithVideos ?? 0} color="success" />
      <Row label="שחקני מפתח" value={summary?.keyPlayersWithVideos ?? 0} color="warning" />
      <Row label="תג מוביל" value={topTagLabel} color="neutral" />
    </Box>
  )
}

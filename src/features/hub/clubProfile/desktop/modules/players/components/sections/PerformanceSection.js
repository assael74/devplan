// clubProfile/desktop/modules/players/components/sections/PerformanceSection.js

import React from 'react'
import { Box, Chip, Typography } from '@mui/joy'

import { iconUi } from '../../../../../../../../ui/core/icons/iconUi.js'

import {
  buildPerformanceSectionModel,
} from './ui/performanceSection.ui.js'

import { performanceSx as sx } from './sx/performance.sx.js'

function MetaItem({ icon, children }) {
  return (
    <Box sx={sx.metaItem}>
      {iconUi({ id: icon, size: 'xs' })}
      <span>{children}</span>
    </Box>
  )
}

export default function PerformanceSection({ row, performance }) {
  const model = buildPerformanceSectionModel({
    row,
    performance,
  })

  if (!model.ready) {
    return (
      <Box sx={sx.root}>
        <Box sx={sx.top}>
          <Chip size="sm" variant="soft" color="neutral" sx={sx.profileChip}>
            אין מדידה
          </Chip>
        </Box>

        <Box sx={sx.meta}>
          <Typography level="body-xs">ביצועים לא זמינים</Typography>
        </Box>
      </Box>
    )
  }

  return (
    <Box sx={sx.root}>
      <Box sx={sx.top}>
        <Chip
          size="sm"
          variant="soft"
          color={model.profile?.tone || 'neutral'}
          startDecorator={iconUi({
            id: model.profile?.icon || 'insights',
            size: 'xs',
          })}
          sx={sx.profileChip}
        >
          {model.profile?.shortLabel || model.profile?.label || 'פרופיל'}
        </Chip>

        <Chip size="sm" variant="outlined" color="neutral" sx={sx.scoreChip}>
          {model.ratingLabel}
        </Chip>

        <Chip
          size="sm"
          variant="soft"
          color={model.impactColor}
          sx={sx.impactChip}
        >
          {model.impactLabel}
        </Chip>
      </Box>

      <Box sx={sx.meta}>
        <Box sx={sx.metaMain}>
          <MetaItem icon="goal">{model.stats.goals}</MetaItem>
          <MetaItem icon="assists">{model.stats.assists}</MetaItem>
          <MetaItem icon="playTimeRate">{model.stats.minutesPctLabel}</MetaItem>
        </Box>

        <Box sx={sx.metaSide}>
          {model.meta.ratedGames} משחקים
        </Box>
      </Box>
    </Box>
  )
}

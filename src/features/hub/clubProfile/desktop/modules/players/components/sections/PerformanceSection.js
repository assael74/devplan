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
        <Typography level="body-xs" sx={sx.emptyTitle}>
          אין מדידה
        </Typography>
        <Typography level="body-xs" sx={sx.emptyText}>
          ביצועים לא זמינים
        </Typography>
      </Box>
    )
  }

  return (
    <Box sx={sx.root}>
      <Box sx={sx.top}>
        <Typography level="body-xs" sx={sx.title}>
          משחקים
        </Typography>

        <Chip size="sm" variant="outlined" color="neutral" sx={sx.scoreChip}>
          {model.ratingLabel}
        </Chip>
      </Box>

      <Box sx={sx.meta}>
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

        <Box sx={sx.metaMain}>
          <MetaItem icon="games">
            {model.meta.ratedGames} משחקים
          </MetaItem>
        </Box>
      </Box>
    </Box>
  )
}

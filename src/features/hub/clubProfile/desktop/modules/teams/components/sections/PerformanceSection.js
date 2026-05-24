// clubProfile/desktop/modules/teams/components/sections/PerformanceSection.js

import React from 'react'
import { Box, Chip, Typography } from '@mui/joy'

import { iconUi } from '../../../../../../../../ui/core/icons/iconUi.js'

import {
  buildTeamPerformanceSectionModel,
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

export default function PerformanceSection({ performance }) {
  const model = buildTeamPerformanceSectionModel({
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
          color={model.profile.tone}
          startDecorator={iconUi({
            id: model.profile.icon,
            size: 'xs',
          })}
          sx={sx.profileChip}
        >
          {model.profile.label}
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
          <MetaItem icon="games">
            {model.meta.gamesCount} משחקים
          </MetaItem>

          <MetaItem icon="analytics">
            מדד קבוצתי
          </MetaItem>
        </Box>
      </Box>
    </Box>
  )
}

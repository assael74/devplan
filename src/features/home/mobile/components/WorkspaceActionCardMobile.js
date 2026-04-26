// features/home/mobile/components/WorkspaceActionCardMobile.js

import React from 'react'
import { Box, Chip, Typography } from '@mui/joy'

import { iconUi } from '../../../../ui/core/icons/iconUi.js'
import { cardSx as sx } from './sx/card.sx.js'
import {
  getInProgressTasks,
  getOpenTasksCount,
} from '../../sharedLogic/home.tasksSummary.js'

export default function WorkspaceActionCardMobile({
  id,
  title,
  subtitle,
  iconId,
  items = [],
  onClick,
}) {
  const inProgressCount = getInProgressTasks(items).length
  const openCount = getOpenTasksCount(items)
  const totalCount = items.length

  return (
    <Box
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onClick()
        }
      }}
      sx={sx.entryActionCard(id)}
    >
      <Box sx={sx.entryCardContent}>
        <Box sx={sx.entryTopRow}>
          <Box sx={sx.entryIconWrap(id)}>
            {iconUi({ id: iconId, size: 'lg' })}
          </Box>

          <Box sx={sx.entryArrowWrap(id)}>
            {iconUi({ id: 'forward', size: 'sm' })}
          </Box>
        </Box>

        <Box sx={{ minWidth: 0 }}>
          <Typography level="title-lg" sx={sx.entryTitle}>
            {title}
          </Typography>

          <Typography level="body-sm" sx={sx.entrySubtitle}>
            {subtitle}
          </Typography>
        </Box>
      </Box>

      <Box sx={sx.entryMetricsRow}>
        <Chip size="sm" variant="soft" sx={sx.entryMetricChip(id)}>
          בתהליך: {inProgressCount}
        </Chip>

        <Chip size="sm" variant="outlined" sx={sx.entrySecondaryChip}>
          פתוחות: {openCount}
        </Chip>

        <Chip size="sm" variant="outlined" sx={sx.entrySecondaryChip}>
          סה״כ: {totalCount}
        </Chip>
      </Box>
    </Box>
  )
}

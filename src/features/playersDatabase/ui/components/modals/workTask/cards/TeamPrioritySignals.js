// src/features/playersDatabase/ui/components/modals/workTask/cards/TeamPrioritySignals.js

import * as React from 'react'
import {
  Box,
  Typography,
} from '@mui/joy'

import ScoutBadge from '../../../scout/ScoutBadge.js'
import { isPositiveLevel } from '../workTask.model.js'
import { workTaskCardsSx as sx } from '../sx/workTaskCards.sx.js'

export default function TeamPrioritySignals({ team }) {
  const attackPositive = isPositiveLevel(team?.attackPriority)
  const defensePositive = isPositiveLevel(team?.defensePriority)

  if (!attackPositive && !defensePositive) return null

  return (
    <Box sx={sx.teamPrioritySignals}>
      {attackPositive ? (
        <Box sx={sx.teamPrioritySignal}>
          <Typography level='body-xs' sx={sx.teamPriorityLabel}>
            התקפי
          </Typography>
          <ScoutBadge
            value={team.attackPriority}
            short
            fontSize={10}
          />
        </Box>
      ) : null}

      {defensePositive ? (
        <Box sx={sx.teamPrioritySignal}>
          <Typography level='body-xs' sx={sx.teamPriorityLabel}>
            הגנתי
          </Typography>
          <ScoutBadge
            value={team.defensePriority}
            short
            fontSize={10}
          />
        </Box>
      ) : null}
    </Box>
  )
}

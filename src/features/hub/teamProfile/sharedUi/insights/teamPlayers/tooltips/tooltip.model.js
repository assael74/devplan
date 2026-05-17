// teamProfile/sharedUi/insights/teamPlayers/tooltips/tooltip.model.js

import React from 'react'
import { Box, Typography } from '@mui/joy'

import {
  InsightTooltip,
} from '../../../../../../../ui/patterns/insights/index.js'

const emptyArray = []

const safeArr = (value) => {
  return Array.isArray(value) ? value : emptyArray
}

const getPlayerLabel = (player = {}) => {
  return (player.playerFullName || '')
}

const buildPlayersList = (players = []) => {
  const safePlayers = safeArr(players)
    .map(getPlayerLabel)
    .filter(Boolean)

  if (!safePlayers.length) return ''

  return (
    <Box
      component="span"
      sx={{
        display: 'grid',
        gap: 0.25,
        mt: 0.35,
      }}
    >
      {safePlayers.map((name, index) => (
        <Typography
          key={`${name}-${index}`}
          component="span"
          level="body-xs"
          sx={{
            display: 'block',
            whiteSpace: 'normal',
          }}
        >
          {name}
        </Typography>
      ))}
    </Box>
  )
}

export const buildTooltip = ({
  title = 'מדד',
  actual = '',
  target = '',
  status = '',
  basis = '',
  listTitle = '',
  players = [],
} = {}) => {
  const playersList = buildPlayersList(players)

  const rows = [
    actual
      ? {
          id: 'actual',
          label: 'בפועל',
          value: actual,
        }
      : null,

    target
      ? {
          id: 'target',
          label: 'יעד',
          value: target,
        }
      : null,

    status
      ? {
          id: 'status',
          label: 'סטטוס',
          value: status,
        }
      : null,

    basis
      ? {
          id: 'basis',
          label: 'בסיס חישוב',
          value: basis,
        }
      : null,

    playersList
      ? {
          id: 'players',
          label: listTitle,
          value: playersList,
        }
      : null,
  ].filter(Boolean)

  return (
    <InsightTooltip
      title={title}
      rows={rows}
    />
  )
}

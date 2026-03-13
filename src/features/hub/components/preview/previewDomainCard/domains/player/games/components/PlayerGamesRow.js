// preview/previewDomainCard/domains/player/games/components/PlayerGamesRow.js

import React from 'react'
import { Box, Chip, IconButton, Tooltip, Typography } from '@mui/joy'

import { iconUi } from '../../../../../../../../../ui/core/icons/iconUi.js'
import { tableSx as sx } from '../sx/playerGamesTable.sx.js'

const resultColorById = {
  win: 'success',
  draw: 'warning',
  loss: 'danger',
}

const hoverColorByResult = (result) => {
  if (result === 'win') return 'success.softBg'
  if (result === 'draw') return 'warning.softBg'
  if (result === 'loss') return 'danger.softBg'
  return 'background.level1'
}

const toNum = (v) => {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

const getStatusMeta = (row) => {
  const timePlayed = toNum(row?.timePlayed)
  const isSelected = row?.isSelected === true
  const isStarting = row?.isStarting === true

  if (timePlayed > 0 && isStarting) {
    return { label: 'פתח', color: 'success', icon: 'isStart' }
  }

  if (timePlayed > 0 && !isStarting) {
    return { label: 'ספסל', color: 'primary', icon: 'isNotStart' }
  }

  if (isSelected) {
    return { label: 'בסגל', color: 'warning', icon: 'isSquad' }
  }

  return { label: 'לא בסגל', color: 'neutral', icon: 'isNotSquad' }
}

export default function PlayerGamesRow({ row, onEdit }) {
  const vLink = (row?.vLink ?? row?.game?.vLink ?? '').trim()
  const hasVlink = vLink.length > 0

  const rowHoverSx = {
    ...sx.rowCardSx,
    '&:hover': {
      ...(sx.rowCardSx['&:hover'] || {}),
      bgcolor: hoverColorByResult(row?.result),
    },
  }

  const status = getStatusMeta(row)
  const goals = toNum(row?.goals)
  const assists = toNum(row?.assists)
  const timePlayed = toNum(row?.timePlayed)
  const homeIdIcon = row?.isHome ? 'home' : 'away'

  return (
    <Box sx={rowHoverSx}>
      <Box sx={sx.mainCellSx}>
        <Typography level="body-sm" sx={sx.mainValueSx}>
          {row?.dateLabel || '—'}
        </Typography>

        <Typography
          sx={sx.subValueSx}
          startDecorator={row?.type ? iconUi({ id: row.type, size: 'sm' }) : null}
        >
          {row?.typeH || '—'}
        </Typography>
      </Box>

      <Box sx={sx.mainCellSx}>
        <Typography level="body-sm" sx={sx.mainValueSx}>
          {row?.rival || '—'}
        </Typography>
      </Box>

      <Box sx={sx.centerCellSx}>
        <Chip size="md" variant="soft" color={row?.isHome ? 'success' : 'danger'} startDecorator={iconUi({id: homeIdIcon})}>
          {row?.isHome ? 'בית' : 'חוץ'}
        </Chip>
      </Box>

      <Box sx={sx.centerCellSx}>
        <Chip size="md" variant="soft" color={resultColorById[row?.result] || 'neutral'}>
          {row?.score || '—'}
        </Chip>
      </Box>

      <Box sx={sx.centerCellSx}>
        <Chip
          size="md"
          variant="soft"
          color={status.color}
          startDecorator={iconUi({ id: status.icon, size: 'sm' })}
        >
          {status.label}
        </Chip>
      </Box>

      <Box sx={sx.centerCellSx}>
        <Typography sx={sx.mainValueSx}>
          {timePlayed}
        </Typography>
      </Box>

      <Box sx={sx.centerCellSx}>
        <Typography sx={sx.mainValueSx}>
          {goals}
        </Typography>
      </Box>

      <Box sx={sx.centerCellSx}>
        <Typography sx={sx.mainValueSx}>
          {assists}
        </Typography>
      </Box>

      <Box sx={sx.centerCellSx}>
        <Tooltip title='עריכת פרטי השחקן במשחק'>
          <IconButton size="sm" variant="soft" color='neutral' onClick={onEdit}>
            {iconUi({ id: 'more' })}
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  )
}

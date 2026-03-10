// preview/previewDomainCard/domains/team/games/components/TeamGamesRow.js

import React from 'react'
import { Box, Chip, IconButton, Tooltip, Typography } from '@mui/joy'

import { iconUi } from '../../../../../../../../../ui/core/icons/iconUi.js'
import { tableSx as sx } from '../sx/teamGamesTable.sx.js'
import { getGameDifficultyLabelH } from '../logic/teamGames.domain.logic.js'

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

export default function TeamGamesRow({ row, onEdit }) {
  const vLink = (row?.vLink ?? row?.game?.vLink ?? '').trim()

  const hasVlink = vLink.length > 0

  const iconVlink = hasVlink ? 'addLink' : 'noLink'
  const colorIcon = hasVlink ? 'success' : 'danger'
  const tipVlink = hasVlink ? 'יש קישור למשחק' : 'אין קישור למשחק'
  const difficultyText = getGameDifficultyLabelH(row?.difficulty)

  const rowHoverSx = {
    ...sx.rowCardSx,
    '&:hover': {
      ...(sx.rowCardSx['&:hover'] || {}),
      bgcolor: hoverColorByResult(row?.result),
    },
  }

  return (
    <Box sx={rowHoverSx}>
      <Box sx={sx.mainCellSx}>
        <Typography level="body-sm" sx={sx.mainValueSx}>{row?.dateLabel || '—'}</Typography>
        {!!row?.hourRaw && (
          <Typography sx={sx.subValueSx}>{row.hourRaw}</Typography>
        )}
      </Box>

      <Box sx={sx.mainCellSx}>
        <Typography level="body-sm" sx={sx.mainValueSx}>{row?.rival || '—'}</Typography>
      </Box>

      <Box sx={sx.centerCellSx}>
        <Chip size="sm" variant="soft" color={row?.isHome ? 'success' : 'neutral'}>
          {row?.isHome ? 'בית' : 'חוץ'}
        </Chip>
      </Box>

      <Box sx={sx.centerCellSx}>
        <Tooltip title={row?.typeH || '—'}>
          <Chip
            size="sm"
            variant="soft"
            startDecorator={row?.type ? iconUi({ id: row.type, size: 'sm' }) : null}
          />
        </Tooltip>
      </Box>

      <Box sx={sx.centerCellSx}>
        <Chip size="sm" variant="soft" color={resultColorById[row?.result] || 'neutral'}>
          {row?.score || '—'}
        </Chip>
      </Box>

      <Box sx={sx.centerCellSx}>
        <Typography sx={sx.mainValueSx}>{row?.points ?? 0}</Typography>
      </Box>

      <Box sx={sx.centerCellSx}>
        <Tooltip title={difficultyText}>
          <Chip
            size="sm"
            variant="soft"
            startDecorator={iconUi({ id: row.difficulty || 'help', size: 'sm' })}
          />
        </Tooltip>
      </Box>

      <Box sx={sx.centerCellSx}>
        <Tooltip title={tipVlink}>
          {hasVlink ? (
            <a href={vLink} target="_blank" rel="noreferrer">
              <Chip
                size="sm"
                variant="soft"
                color="success"
                startDecorator={iconUi({ id: 'video', size: 'sm' })}
              />
            </a>
            ) : (
            <Chip
              size="sm"
              variant="soft"
              color="danger"
              startDecorator={iconUi({ id: 'noLink', size: 'sm' })}
            />
          )}
        </Tooltip>
      </Box>

      <Box sx={sx.centerCellSx}>
        <Tooltip title="עריכת משחק">
          <IconButton size="sm" variant="soft" onClick={onEdit}>
            {iconUi({ id: 'more' })}
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  )
}

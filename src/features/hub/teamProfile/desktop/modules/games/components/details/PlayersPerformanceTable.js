// src/features/hub/teamProfile/desktop/modules/games/components/details/PlayersPerformanceTable.js

import React from 'react'
import {
  Avatar,
  Box,
  Chip,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/joy'

import { iconUi } from '../../../../../../../../ui/core/icons/iconUi.js'
import playerImage from '../../../../../../../../ui/core/images/playerImage.jpg'

import { tableSx as sx } from './sx/table.sx.js'
import PlayerTrendPanel from './PlayerTrendPanel.js'

import {
  buildPlayerGameTrendModel,
  formatGamePerfSigned,
  getGamePerfTone,
  toGamePerfNumber,
} from '../../../../../sharedLogic/games/index.js'

const columns = [
  {
    id: 'player',
    label: 'שחקן',
    iconId: 'player',
    align: 'left',
  },
  {
    id: 'minutes',
    label: 'דקות',
    iconId: 'time',
    align: 'center',
  },
  {
    id: 'goals',
    label: 'שערים',
    iconId: 'goal',
    align: 'center',
  },
  {
    id: 'assists',
    label: 'בישולים',
    iconId: 'assist',
    align: 'center',
  },
  {
    id: 'rating',
    label: 'מדד יעילות',
    iconId: 'scoringRating',
    align: 'center',
  },
  {
    id: 'impact',
    label: 'השפעה מצטברת',
    iconId: 'scoringImpact',
    align: 'center',
  },
  {
    id: 'actions',
    label: '',
    iconId: 'actions',
    align: 'center',
  },
]

const getImpactTone = impact => {
  if (!Number.isFinite(impact)) return 'neutral'
  if (impact >= 0) return 'success'
  if (impact >= -0.5) return 'warning'

  return 'danger'
}

function ActionsMenu({
  open,
  row,
  onToggle,
  onCoachUpdate,
}) {
  const handleToggle = event => {
    event.stopPropagation()
    onToggle()
  }

  const handleCoachUpdate = event => {
    event.stopPropagation()
    onToggle()
    onCoachUpdate?.(row)
  }

  return (
    <Box sx={sx.actionsWrap}>
      <Tooltip title="פעולות שחקן">
        <IconButton
          size="sm"
          variant={open ? 'soft' : 'plain'}
          color={open ? 'primary' : 'neutral'}
          sx={sx.actionButton}
          onClick={handleToggle}
        >
          {iconUi({ id: 'more' })}
        </IconButton>
      </Tooltip>

      {open ? (
        <Box sx={sx.actionsMenu}>
          <Box
            role="button"
            tabIndex={0}
            sx={sx.actionItem}
            onClick={handleCoachUpdate}
          >
            {iconUi({ id: 'coach', size: 'xs' })}

            <Typography level="body-xs" sx={sx.actionText}>
              הוספת עדכון מאמן
            </Typography>
          </Box>
        </Box>
      ) : null}
    </Box>
  )
}

function PlayerRow({
  row,
  game,
  playerPerformance,
  playerScoring,
  onCoachUpdate,
}) {
  const [open, setOpen] = React.useState(false)
  const [trendMounted, setTrendMounted] = React.useState(false)
  const [actionsOpen, setActionsOpen] = React.useState(false)

  const rating = toGamePerfNumber(row?.ratingRaw, null)
  const impact = toGamePerfNumber(row?.cumulativeImpact, null)

  const tone = getGamePerfTone(rating)
  const impactTone = getImpactTone(impact)

  const name =
    row?.playerFullName ||
    row?.player?.playerFullName ||
    'שחקן'

  const toggleOpen = () => {
    setOpen(value => {
      const next = !value

      if (next) {
        setTrendMounted(true)
      }

      return next
    })
  }

  const handleKeyDown = event => {
    if (event.key !== 'Enter' && event.key !== ' ') return

    event.preventDefault()
    toggleOpen()
  }

  const handleToggleActions = () => {
    setActionsOpen(value => !value)
  }

  const trendModel = React.useMemo(() => {
    if (!trendMounted || !row?.playerId) return null

    return buildPlayerGameTrendModel({
      scoring: playerScoring,
      playerId: row.playerId,
      game,
      gameId: row.gameId,
      gameTime: row.gameTime,
      performance: playerPerformance,
    })
  }, [
    trendMounted,
    playerScoring,
    row,
    game,
    playerPerformance,
  ])

  return (
    <Box sx={sx.playerPanel(open, actionsOpen)}>
      <Box
        role="button"
        tabIndex={0}
        sx={sx.row(open, actionsOpen)}
        onClick={toggleOpen}
        onKeyDown={handleKeyDown}
      >
        <Box sx={sx.playerCell}>
          <Avatar
            size="sm"
            src={row?.photo || row?.player?.photo || playerImage}
            sx={sx.avatar}
          />

          <Typography level="body-sm" sx={sx.playerName}>
            {name}
          </Typography>
        </Box>

        <Typography level="body-xs" sx={sx.centerText}>
          {toGamePerfNumber(row?.minutes, 0)} דק׳
        </Typography>

        <Typography level="body-xs" sx={sx.centerText}>
          {toGamePerfNumber(row?.goals, 0)}
        </Typography>

        <Typography level="body-xs" sx={sx.centerText}>
          {toGamePerfNumber(row?.assists, 0)}
        </Typography>

        <Tooltip title="מדד יעילות למשחק זה בלבד" variant="soft">
          <Chip
            size="sm"
            variant="soft"
            color={tone}
            sx={sx.metricChip}
          >
            {Number.isFinite(rating) ? rating : '-'}
          </Chip>
        </Tooltip>

        <Tooltip title="מדד השפעה של השחקן עד למשחק זה כולל" variant="soft">
          <Chip
            size="sm"
            variant="soft"
            color={impactTone}
            sx={sx.metricChip}
          >
            {formatGamePerfSigned(impact)}
          </Chip>
        </Tooltip>

        <ActionsMenu
          open={actionsOpen}
          row={row}
          onToggle={handleToggleActions}
          onCoachUpdate={onCoachUpdate}
        />
      </Box>

      <Box sx={sx.trendCollapse(open)}>
        <Box sx={sx.trendCollapseInner}>
          <Box sx={sx.trendBody}>
            {trendMounted && trendModel?.hasPoints ? (
              <PlayerTrendPanel
                model={trendModel}
                onClose={() => setOpen(false)}
              />
            ) : null}
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default function PlayersPerformanceTable({
  rows = [],
  game,
  playerPerformance,
  playerScoring,
  onCoachUpdate,
}) {
  if (!rows.length) {
    return (
      <Typography level="body-sm" sx={sx.emptyText}>
        אין מדדי שחקנים להצגה במשחק הזה.
      </Typography>
    )
  }

  return (
    <Box sx={sx.table}>
      <Box sx={sx.head}>
        {columns.map(column => (
          <Typography
            key={column.id}
            level="body-xs"
            sx={sx.headCell(column.align)}
          >
            <Box component="span" sx={sx.headInner}>
              {iconUi({ id: column.iconId, size: 'xs' })}

              <Box component="span" sx={sx.headLabel}>
                {column.label}
              </Box>
            </Box>
          </Typography>
        ))}
      </Box>

      {rows.map(row => (
        <PlayerRow
          key={`${row.gameId}_${row.playerId}`}
          row={row}
          game={game}
          playerPerformance={playerPerformance}
          playerScoring={playerScoring}
          onCoachUpdate={onCoachUpdate}
        />
      ))}
    </Box>
  )
}

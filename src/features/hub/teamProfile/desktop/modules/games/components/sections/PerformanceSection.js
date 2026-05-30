// teamProfile/desktop/modules/games/components/sections/PerformanceSection.js

import React from 'react'
import {
  Avatar,
  Box,
  Chip,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/joy'

import playerImage from '../../../../../../../../ui/core/images/playerImage.jpg'
import { iconUi } from '../../../../../../../../ui/core/icons/iconUi.js'

import { perfSx as sx } from './sx/perf.sx.js'

import {
  buildGamePlayersPerformanceModel,
  buildGameTeamPerformanceModel,
  resolveGameStatsActionModel,
  formatGamePerfRating,
  getGamePerfPlayerLabel,
  getGamePerfTone,
} from '../../../../../sharedLogic/games/index.js'

function TeamMetricChip({
  icon,
  label,
  value,
  tone = 'neutral',
  tooltip,
}) {
  return (
    <Tooltip arrow title={tooltip || label}>
      <Chip
        size="sm"
        variant="soft"
        color={tone}
        sx={sx.metricChip}
        startDecorator={iconUi({ id: icon, size: 'sm' })}
        endDecorator={
          <Typography level="body-sm" sx={sx.metricChipValue}>
            {value}
          </Typography>
        }
      >
        <Typography level="body-sm" sx={sx.metricChipText}>
          {label}
        </Typography>
      </Chip>
    </Tooltip>
  )
}

function PlayerScoreChip({ row, type = 'best' }) {
  if (!row) {
    return (
      <Chip size="sm" variant="outlined" color="neutral" sx={sx.playerChip}>
        אין שחקן
      </Chip>
    )
  }

  const rating = Number(row?.ratingRaw)
  const isBest = type === 'best'

  const title = isBest
    ? 'השחקן הכי יעיל במשחק'
    : 'השחקן הנמוך ביחס לציפייה'

  const tone = isBest
    ? getGamePerfTone(rating)
    : 'warning'

  const photo =
    row?.photo ||
    row?.player?.photo ||
    playerImage

  return (
    <Tooltip arrow title={title}>
      <Chip
        size="sm"
        variant="soft"
        color={tone}
        sx={sx.playerChip}
        startDecorator={
          <Avatar src={photo} sx={sx.chipAvatar} />
        }
        endDecorator={
          <Typography level="body-sm" sx={sx.chipValue}>
            {formatGamePerfRating(rating)}
          </Typography>
        }
      >
        <Typography level="body-sm" sx={sx.chipText}>
          {getGamePerfPlayerLabel(row)}
        </Typography>
      </Chip>
    </Tooltip>
  )
}

function StatsActionButton({ game, statsDraft, statsStatus, onOpenStatsGame }) {
  const model = resolveGameStatsActionModel({
    game,
    statsDraft,
  })

  return (
    <Tooltip title={model.tooltip}>
      <IconButton
        size="sm"
        variant={model.variant}
        color={model.color}
        onClick={event => {
          event.stopPropagation()
          onOpenStatsGame(game)
        }}
        sx={sx.addStatsIcon(model.status)}
      >
        {iconUi({
          id: model.iconId,
          size: 'sm',
          sx: model.iconSx,
        })}
      </IconButton>
    </Tooltip>
  )
}

export default function PerformanceSection({
  game,
  teamGameScore,
  onOpenStatsGame,
  playerPerformance,
  performanceView = 'team',
  statsDraft = null,
  statsStatus = '',
}) {
  const teamModel = React.useMemo(() => {
    return buildGameTeamPerformanceModel({
      teamGameScore,
    })
  }, [teamGameScore])

  const playersModel = React.useMemo(() => {
    return buildGamePlayersPerformanceModel(playerPerformance)
  }, [playerPerformance])

  const isTeamView = performanceView === 'team'
  const labelTitle = isTeamView ? 'ביצוע קבוצתי' : 'ביצוע אישי'

  return (
    <Box sx={sx.root}>
      <Box>
        <Box sx={sx.labelBox}>
          <Typography level="body-xs" sx={sx.label}>
            {labelTitle}
          </Typography>
        </Box>

        <StatsActionButton
          game={game}
          statsDraft={statsDraft}
          statsStatus={statsStatus}
          onOpenStatsGame={onOpenStatsGame}
        />
      </Box>

      <Box sx={sx.content}>
        {isTeamView ? (
          <Box sx={sx.row}>
            <TeamMetricChip
              icon="scoringRating"
              label=""
              value={teamModel.ratingText}
              tone={teamModel.ratingTone}
              tooltip="מדד היעילות הקבוצתי במשחק הזה"
            />

            <TeamMetricChip
              icon="scoringImpact"
              label=""
              value={teamModel.cumulativeImpactText}
              tone={teamModel.cumulativeImpactTone}
              tooltip="מדד ההשפעה המצטבר של הקבוצה עד המשחק הזה"
            />
          </Box>
        ) : (
          <Box sx={sx.chipsRow}>
            <PlayerScoreChip
              row={playersModel.bestRow}
              type="best"
            />

            <PlayerScoreChip
              row={playersModel.lowRow}
              type="low"
            />
          </Box>
        )}
      </Box>
    </Box>
  )
}

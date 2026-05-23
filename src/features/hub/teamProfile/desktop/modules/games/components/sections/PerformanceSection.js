// teamProfile/desktop/modules/games/components/sections/PerformanceSection.js

import React from 'react'
import { Avatar, Box, Chip, Tooltip, Typography } from '@mui/joy'

import playerImage from '../../../../../../../../ui/core/images/playerImage.jpg'
import { iconUi } from '../../../../../../../../ui/core/icons/iconUi.js'

import { perfSx as sx } from './sx/perf.sx.js'

import {
  buildGamePlayersPerformanceModel,
  buildGameTeamPerformanceModel,
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

export default function PerformanceSection({ teamGameScore, playerPerformance, performanceView = 'team' }) {
  const teamModel = React.useMemo(() => {
    return buildGameTeamPerformanceModel({
      teamGameScore,
    })
  }, [teamGameScore])

  const playersModel = React.useMemo(() => {
    return buildGamePlayersPerformanceModel(playerPerformance)
  }, [playerPerformance])

  const isTeamView = performanceView === 'team'
  const label = isTeamView ? 'קב׳' : 'אישי'
  const labelTitle = isTeamView ? 'ביצוע קבוצתי' : 'ביצוע אישי'

  return (
    <Box sx={sx.root}>
      <Tooltip arrow title={labelTitle}>
        <Box sx={sx.labelBox}>
          <Typography level="body-xs" sx={sx.label}>
            {labelTitle}
          </Typography>
        </Box>
      </Tooltip>

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

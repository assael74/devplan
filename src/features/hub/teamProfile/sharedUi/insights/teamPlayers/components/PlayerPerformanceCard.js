// teamProfile/sharedUi/insights/teamPlayers/components/PlayerPerformanceCard.js

import React from 'react'
import { Avatar, Box, Chip, Sheet, Typography } from '@mui/joy'

import { iconUi } from '../../../../../../../ui/core/icons/iconUi.js'
import playerImage from '../../../../../../../ui/core/images/playerImage.jpg'

import {
  formatSignedNumber,
  getMetricTone,
  getPositionLabel,
  getRoleLabel,
} from './playerPerformance.helpers.js'

import { performanceSx as sx } from './sx/performance.sx.js'

const Metric = ({
  label,
  value,
  color,
}) => {
  const tone = color || getMetricTone(value)

  return (
    <Box sx={sx.metric(tone)}>
      <Typography level="body-xs" sx={sx.metricLabel}>
        {label}
      </Typography>

      <Typography level="title-sm" sx={sx.metricValue}>
        {value ?? '-'}
      </Typography>
    </Box>
  )
}

const InsightMetric = ({
  text,
  player,
}) => {
  return (
    <Box sx={sx.insightMetric}>
      <Box sx={sx.insightMetricHeader}>
        <Typography level="body-xs" sx={sx.metricLabel}>
          תובנה
        </Typography>

        <Box sx={sx.insightIcon}>
          {iconUi({ id: 'insights' })}
        </Box>
      </Box>

      <Typography level="body-sm" sx={sx.insightText}>
        {text || '-'}
      </Typography>

      {!!player?.subStatus && (
        <Typography level="body-xs" sx={sx.subStatus}>
          {player.playerFullName} {player.subStatus}
        </Typography>
      )}
    </Box>
  )
}

export default function PlayerPerformanceCard({
  player,
  profile,
}) {
  const rowProfile = player?.profile || profile || {}
  const name = player?.playerFullName || 'שחקן ללא שם'
  const photo = player?.photo || playerImage

  return (
    <Sheet
      variant="outlined"
      sx={sx.playerCard}
    >
      <Box sx={sx.playerTopRow}>
        <Box sx={sx.playerInfo}>
          <Avatar
            src={photo}
            alt={name || 'שחקן'}
            sx={sx.avatar}
          />

          <Box sx={sx.playerText}>
            <Box sx={sx.playerNameRow}>
              <Typography level="title-sm" sx={sx.playerName}>
                {name}
              </Typography>

              {!!player?.insightLabel && (
                <Chip
                  size="sm"
                  variant="soft"
                  startDecorator={iconUi({ id: profile?.icon })}
                  color={profile?.tone || 'neutral'}
                  sx={sx.playerInsightChip}
                >
                  {player.insightLabel}
                </Chip>
              )}
            </Box>

            <Typography level="body-xs" sx={sx.playerMeta}>
              {getRoleLabel(player?.role)} · {getPositionLabel(player?.positionLayer)}
            </Typography>
          </Box>
        </Box>

        <Box sx={sx.metricsGrid}>
          <Metric
            label="מדד יעילות"
            color="neutral"
            value={player?.ratingRaw}
          />

          <Metric
            label="מדד השפעה מצטברת"
            value={formatSignedNumber(player?.tva)}
          />

          <Metric
            label="דקות"
            color="neutral"
            value={player?.minutes}
          />
        </Box>
      </Box>

      <InsightMetric
        text={rowProfile.coachText || profile?.coachText}
        player={player}
      />
    </Sheet>
  )
}

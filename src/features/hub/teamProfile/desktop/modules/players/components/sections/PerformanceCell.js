// teamProfile/desktop/modules/players/components/sections/PerformanceCell.js

import React from 'react'
import { Box, Chip } from '@mui/joy'

import { iconUi } from '../../../../../../../../ui/core/icons/iconUi.js'

import { performanceSx as sx } from './sx/performance.sx.js'

import {
  buildPerformanceCellModel,
} from './ui/performanceCell.ui.js'

import {
  PLAYER_ROW_METRIC_TONES,
} from './ui/playerMetricTones.js'

import PlayerMetricChip from './ui/PlayerMetricChip.js'

const loadingText = 'בטעינה...'
const emptyText = '-'

const isLoaded = loaded => loaded === true

const getText = ({ loaded, value, fallback = emptyText }) => (
  isLoaded(loaded) ? value ?? fallback : loadingText
)

function ProfileChip({ profile = {}, loaded = false }) {
  const ready = isLoaded(loaded)

  const text = ready
    ? profile.shortLabel || profile.label || emptyText
    : loadingText

  const color = ready
    ? profile.tone || 'neutral'
    : 'neutral'

  const icon = ready
    ? profile.icon || 'insights'
    : 'loading'

  return (
    <Chip
      size="sm"
      variant="soft"
      color={color}
      startDecorator={iconUi({ id: icon })}
      sx={sx.profileChip}
    >
      {text}
    </Chip>
  )
}

function ScoreChip({ value, loaded = false }) {
  const ready = isLoaded(loaded)

  return (
    <Chip
      size="sm"
      variant="soft"
      color="neutral"
      startDecorator={ready ? null : iconUi({ id: 'loading' })}
      sx={sx.scoreChip}
    >
      {getText({ loaded: ready, value })}
    </Chip>
  )
}

function ImpactChip({ value, color = 'neutral', loaded = false }) {
  const ready = isLoaded(loaded)

  return (
    <Chip
      size="sm"
      variant="soft"
      color={ready ? color : 'neutral'}
      startDecorator={ready ? null : iconUi({ id: 'loading' })}
      sx={sx.impactChip}
    >
      {getText({ loaded: ready, value })}
    </Chip>
  )
}

function MetaItem({
  icon,
  metricKey,
  label = '',
  value,
  loaded = true,
  metricTones = PLAYER_ROW_METRIC_TONES,
}) {
  const ready = isLoaded(loaded)

  return (
    <PlayerMetricChip
      metricKey={metricKey}
      icon={ready ? icon : 'loading'}
      label={ready ? label : ''}
      value={ready ? value : loadingText}
      metricTones={metricTones}
    />
  )
}

export default function PerformanceCell({
  row,
  loaded = true,
  metricTones = PLAYER_ROW_METRIC_TONES,
}) {
  const ready = isLoaded(loaded)

  const {
    hasNumbers,
    profile,
    ratingLabel,
    tvaValue,
    impactColor,
    stats,
  } = buildPerformanceCellModel(row)

  if (!ready) {
    return (
      <Box sx={sx.root}>
        <Box sx={sx.empty}>
          {loadingText}
        </Box>
      </Box>
    )
  }

  if (!hasNumbers) {
    return (
      <Box sx={sx.root}>
        <Box sx={sx.empty}>
          אין נתוני ביצוע
        </Box>
      </Box>
    )
  }

  return (
    <Box sx={sx.root}>
      <Box sx={sx.top}>
        <ProfileChip
          profile={profile}
          loaded={ready}
        />

        <ScoreChip
          value={ratingLabel}
          loaded={ready}
        />

        <ImpactChip
          value={tvaValue}
          color={impactColor}
          loaded={ready}
        />
      </Box>

      <Box sx={sx.meta}>
        <MetaItem
          icon="goal"
          metricKey="goals"
          value={stats.goals}
          loaded={ready}
          metricTones={metricTones}
        />

        <MetaItem
          icon="assists"
          metricKey="assists"
          value={stats.assists}
          loaded={ready}
          metricTones={metricTones}
        />

        <MetaItem
          icon="playTimeRate"
          metricKey="minutes"
          label="דקות"
          value={stats.minutesPctLabel}
          loaded={ready}
          metricTones={metricTones}
        />

        <Box sx={{ flex: 1 }} />

        {stats.startedLabel ? (
          <MetaItem
            icon="isStart"
            metricKey="starts"
            label="הרכב"
            value={stats.startedLabel}
            loaded={ready}
            metricTones={metricTones}
          />
        ) : null}
      </Box>
    </Box>
  )
}

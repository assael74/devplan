// teamProfile/desktop/modules/players/components/sections/PerformanceCell.js

import React from 'react'
import { Box, Chip, Typography } from '@mui/joy'

import { iconUi } from '../../../../../../../../ui/core/icons/iconUi.js'

import {
  ScoringInfo,
} from '../../../../../../../../ui/patterns/scoring/index.js'

import { performanceSx as sx } from './sx/performance.sx.js'

import {
  buildPerformanceCellModel,
  getImpactColor,
} from './ui/performanceCell.ui.js'

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
    <ScoringInfo
      type="profile"
      profileId={ready ? profile.id : null}
      mode="short"
      triggerSx={{ minWidth: 0 }}
    >
      <Chip
        size="sm"
        variant="soft"
        color={color}
        startDecorator={iconUi({ id: icon, size: 'xs' })}
        sx={sx.profileChip}
      >
        {text}
      </Chip>
    </ScoringInfo>
  )
}

function ScoreChip({ value, loaded = false }) {
  const ready = isLoaded(loaded)

  return (
    <ScoringInfo
      type="metric"
      metric="efficiency"
      mode="short"
    >
      <Chip
        size="sm"
        variant="soft"
        color="neutral"
        startDecorator={ ready ? null : iconUi({ id: 'loading', size: 'xs' })}
        sx={sx.scoreChip}
      >
        {getText({ loaded: ready, value })}
      </Chip>
    </ScoringInfo>
  )
}

function ImpactChip({ value, loaded = false }) {
  const ready = isLoaded(loaded)
  const color = ready ? getImpactColor(value) : 'neutral'

  return (
    <ScoringInfo
      type="metric"
      metric="impact"
      mode="short"
    >
      <Chip
        size="sm"
        variant="soft"
        color={color}
        startDecorator={ ready ? null : iconUi({ id: 'loading', size: 'xs' })}
        sx={sx.impactChip}
      >
        {getText({ loaded: ready, value })}
      </Chip>
    </ScoringInfo>
  )
}

function MetaItem({ icon, children, loaded = true }) {
  const ready = isLoaded(loaded)

  return (
    <Typography level="body-xs" sx={sx.metaItem}>
      {iconUi({ id: ready ? icon : 'loading', size: 'xs' })}
      {ready ? children : loadingText}
    </Typography>
  )
}

export default function PerformanceCell({ row, loaded = true }) {
  const ready = isLoaded(loaded)

  const {
    profile,
    ratingLabel,
    tvaValue,
    stats,
  } = buildPerformanceCellModel(row)

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
          loaded={ready}
        />
      </Box>

      <Box sx={sx.meta}>
        <MetaItem icon="goal" loaded={ready}>
          {stats.goals}
        </MetaItem>

        <MetaItem icon="assists" loaded={ready}>
          {stats.assists}
        </MetaItem>

        <MetaItem icon="playTimeRate" loaded={ready}>
          דקות {stats.minutesPctLabel}
        </MetaItem>

        <Box sx={{ flex: 1 }} />

        {ready && stats.startedLabel ? (
          <MetaItem icon="isStart" loaded={ready}>
            הרכב {stats.startedLabel}
          </MetaItem>
        ) : null}
      </Box>
    </Box>
  )
}

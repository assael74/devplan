// src/features/hub/teamProfile/sharedUi/players/print/url/UrlSkeleton.js

import React from 'react'
import { Box, Sheet, Skeleton } from '@mui/joy'

import {
  TEAM_PLAYERS_PRINT_MODES,
} from '../../../model/teams/players/print/index.js'

import { urlSx as sx } from './url.sx.js'

function Lines({ count = 3, height = 32 }) {
  return (
    <Box sx={sx.skeletonLines}>
      {Array.from({ length: count }).map((item, index) => (
        <Skeleton
          key={index}
          variant='rectangular'
          sx={sx.skeletonLine({ height })}
        />
      ))}
    </Box>
  )
}

function Block({ titleWidth, subtitleWidth, rows }) {
  return (
    <Sheet variant='outlined' sx={sx.skeletonBlock}>
      <Skeleton
        variant='text'
        level='title-lg'
        sx={sx.skeletonTitle({ width: titleWidth })}
      />

      <Skeleton
        variant='text'
        sx={sx.skeletonSubtitle({ width: subtitleWidth })}
      />

      <Lines count={rows} />
    </Sheet>
  )
}

function SeasonPlanSkeleton({ device }) {
  const columns = device === 'mobile' ? 1 : 3

  return (
    <Box sx={sx.skeletonWrap}>
      <Sheet variant='outlined' sx={sx.skeletonBlock}>
        <Skeleton
          variant='text'
          level='title-lg'
          sx={sx.skeletonTitle({ width: 180 })}
        />

        <Skeleton
          variant='text'
          sx={sx.skeletonSubtitle({ width: 250 })}
        />

        <Box sx={sx.skeletonCards({ columns })}>
          {Array.from({ length: 3 }).map((item, index) => (
            <Skeleton
              key={index}
              variant='rectangular'
              sx={sx.skeletonCard}
            />
          ))}
        </Box>
      </Sheet>

      <Block titleWidth={190} subtitleWidth={220} rows={5} />
      <Block titleWidth={170} subtitleWidth={210} rows={4} />
      <Block titleWidth={200} subtitleWidth={240} rows={6} />
    </Box>
  )
}

function MinutesPlanSkeleton() {
  return (
    <Box sx={sx.skeletonWrap}>
      <Block titleWidth={180} subtitleWidth={220} rows={3} />
      <Block titleWidth={190} subtitleWidth={230} rows={3} />
      <Block titleWidth={180} subtitleWidth={220} rows={4} />
      <Block titleWidth={220} subtitleWidth={250} rows={8} />
    </Box>
  )
}

function PerformanceSkeleton() {
  return (
    <Box sx={sx.skeletonWrap}>
      <Sheet variant='outlined' sx={sx.skeletonBlock}>
        <Skeleton
          variant='text'
          level='title-lg'
          sx={sx.skeletonTitle({ width: 200 })}
        />

        <Skeleton
          variant='text'
          sx={sx.skeletonSubtitle({ width: 260 })}
        />

        <Box sx={sx.skeletonChips}>
          {Array.from({ length: 4 }).map((item, index) => (
            <Skeleton
              key={index}
              variant='rectangular'
              sx={sx.skeletonChip}
            />
          ))}
        </Box>
      </Sheet>

      <Block titleWidth={210} subtitleWidth={250} rows={10} />
    </Box>
  )
}

export default function UrlSkeleton({ mode, device = 'desktop' }) {
  if (mode === TEAM_PLAYERS_PRINT_MODES.MINUTES_PLAN) {
    return <MinutesPlanSkeleton device={device} />
  }

  if (mode === TEAM_PLAYERS_PRINT_MODES.PERFORMANCE) {
    return <PerformanceSkeleton device={device} />
  }

  return <SeasonPlanSkeleton device={device} />
}

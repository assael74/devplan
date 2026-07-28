// src/features/reports/teamSeasonPlan/renderer/url/UrlSkeleton.js

import React from 'react'
import { Box, Sheet, Skeleton } from '@mui/joy'
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
      <Skeleton variant='text' level='title-lg' sx={sx.skeletonTitle({ width: titleWidth })} />
      <Skeleton variant='text' sx={sx.skeletonSubtitle({ width: subtitleWidth })} />
      <Lines count={rows} />
    </Sheet>
  )
}

export default function UrlSkeleton({ device = 'desktop' }) {
  const columns = device === 'mobile' ? 1 : 3

  return (
    <Box sx={sx.skeletonWrap}>
      <Sheet variant='outlined' sx={sx.skeletonBlock}>
        <Skeleton variant='text' level='title-lg' sx={sx.skeletonTitle({ width: 180 })} />
        <Skeleton variant='text' sx={sx.skeletonSubtitle({ width: 250 })} />

        <Box sx={sx.skeletonCards({ columns })}>
          {Array.from({ length: 3 }).map((item, index) => (
            <Skeleton key={index} variant='rectangular' sx={sx.skeletonCard} />
          ))}
        </Box>
      </Sheet>

      <Block titleWidth={190} subtitleWidth={220} rows={5} />
      <Block titleWidth={170} subtitleWidth={210} rows={4} />
      <Block titleWidth={200} subtitleWidth={240} rows={6} />
    </Box>
  )
}

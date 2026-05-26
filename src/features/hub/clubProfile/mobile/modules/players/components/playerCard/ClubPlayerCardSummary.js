// ClubProfile/mobile/modules/players/components/playerCard/ClubPlayerCardSummary.js

import React from 'react'
import { Box, Chip } from '@mui/joy'

import { iconUi } from '../../../../../../../../ui/core/icons/iconUi.js'
import { cardSx as sx } from '../../sx/card.mobile.sx.js'

import { getEntityColors } from '../../../../../../../../ui/core/theme/Colors.js'

import {
  buildPerformanceSectionModel,
} from './ui/performanceSection.ui.js'

const c = getEntityColors('players')

export default function ClubPlayerCardSummary({ row, performance }) {
  const goals = Number(row?.playerFullStats?.goals ?? 0)
  const assists = Number(row?.playerFullStats?.assists ?? 0)
  const timeRateLabel = row?.playerFullStats?.timeRateLabel || '0%'

  const modelPerf = buildPerformanceSectionModel({
    row,
    performance,
  })

  return (
    <Box sx={sx.playerStatsWrap}>
      <Chip
        size="sm"
        variant="soft"
        color={modelPerf.profile?.tone || 'neutral'}
        startDecorator={iconUi({ id: modelPerf.profile?.icon || 'insights' })}
        sx={{ border: '1px solid', borderColor: 'divider' }}
      >
        {modelPerf.profile?.shortLabel || modelPerf.profile?.label || 'פרופיל'}
      </Chip>

      <Chip
        size="sm"
        variant="outlined"
        color="neutral"
        startDecorator={iconUi({id: 'scoringRating'})}
        sx={{ border: '1px solid', borderColor: 'divider' }}
      >
        {modelPerf.ratingLabel}
      </Chip>

      <Chip
        size="sm"
        variant="soft"
        startDecorator={iconUi({id: 'scoringImpact'})}
        color={modelPerf.impactColor}
        sx={{ border: '1px solid', borderColor: 'divider' }}
      >
        {modelPerf.impactLabel}
      </Chip>

      <Chip
        size="sm"
        variant="soft"
        color="neutral"
        startDecorator={iconUi({ id: 'playTimeRate' })}
        sx={{ border: '1px solid', borderColor: 'divider' }}
      >
        דקות {timeRateLabel}
      </Chip>
    </Box>
  )
}

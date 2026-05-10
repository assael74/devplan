// teamProfile/sharedUi/insights/teamGames/sections/cards/HomeAwayCards.js

import React from 'react'
import { Box } from '@mui/joy'

import {
  buildHomeAwayCardsModel,
} from '../../../../../sharedLogic/games/index.js'

import {
  CurrentMetricsCardView,
  InsightCardView,
  ProjectionCardView,
} from '../shared/index.js'

import { homeAwaySx as sx } from '../sx/homeAway.sx.js'

export default function HomeAwayCards({ data, brief, isMobile }) {
  const model = buildHomeAwayCardsModel({
    data,
    brief,
  })

  return (
    <Box sx={sx.grid}>
      <CurrentMetricsCardView
        model={model.current}
        isMobile={isMobile}
        sx={sx}
      />

      <InsightCardView
        model={model.insight}
        sx={sx}
      />

      <ProjectionCardView
        model={model.projection}
        sx={sx}
      />
    </Box>
  )
}

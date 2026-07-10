// src/features/hub/teamProfile/sharedUi/players/print/url/UrlMobile.js

import React from 'react'
import { Box } from '@mui/joy'

import {
  TEAM_PLAYERS_PRINT_MODES,
} from '../../../../sharedLogic/players/print/index.js'

import SeasonPlanContent from '../SeasonPlanContent.js'
import MinutesPlanContent from '../MinutesPlanContent.js'
import PerformanceContent from '../PerformanceContent.js'

import { urlSx as sx } from './url.sx.js'

function getContent(mode, presentation) {
  if (mode === TEAM_PLAYERS_PRINT_MODES.MINUTES_PLAN) {
    return MinutesPlanContent
  }

  if (mode === TEAM_PLAYERS_PRINT_MODES.PERFORMANCE) {
    return PerformanceContent
  }

  return SeasonPlanContent
}

export default function UrlMobile({ model, presentation }) {
  const Content = getContent(model.mode, presentation)

  return (
    <Box sx={sx.mobile}>
      <Content model={model} presentation={presentation} />
    </Box>
  )
}

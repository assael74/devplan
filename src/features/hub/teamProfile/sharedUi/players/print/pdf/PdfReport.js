// src/features/hub/teamProfile/sharedUi/players/print/pdf/PdfReport.js

import React from 'react'

import {
  TEAM_PLAYERS_PRINT_MODES,
} from '../../../../sharedLogic/players/print/index.js'

import SeasonPlanContent from '../SeasonPlanContent.js'
import MinutesPlanContent from '../MinutesPlanContent.js'
import PerformanceContent from '../PerformanceContent.js'

function getContent(mode) {
  if (mode === TEAM_PLAYERS_PRINT_MODES.MINUTES_PLAN) {
    return MinutesPlanContent
  }

  if (mode === TEAM_PLAYERS_PRINT_MODES.PERFORMANCE) {
    return PerformanceContent
  }

  return SeasonPlanContent
}

export default function PdfReport({ model }) {
  const Content = getContent(model.mode)

  return (
    <Content model={model} />
  )
}

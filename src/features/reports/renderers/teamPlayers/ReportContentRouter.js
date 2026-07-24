// src/features/hub/teamProfile/sharedUi/players/print/ReportContentRouter.js

import React from 'react'

import {
  TEAM_PLAYERS_PRINT_MODES,
} from '../../model/teams/players/print/index.js'

import MinutesPlanContent from './minutesPlan/MinutesPlanContent.js'
import PerformanceContent from './performance/PerformanceContent.js'
import SeasonPlanContent from './seasonPlan/SeasonPlanContent.js'

const CONTENT_BY_MODE = {
  [TEAM_PLAYERS_PRINT_MODES.SEASON_PLAN]: SeasonPlanContent,
  [TEAM_PLAYERS_PRINT_MODES.MINUTES_PLAN]: MinutesPlanContent,
  [TEAM_PLAYERS_PRINT_MODES.PERFORMANCE]: PerformanceContent,
}

export default function ReportContentRouter({ model, presentation = 'url', device = 'desktop' }) {
  const Content = CONTENT_BY_MODE[model.mode] || SeasonPlanContent

  return (
    <Content
      model={model}
      presentation={presentation}
      device={device}
    />
  )
}

// src/features/playersDatabase/ui/components/modals/workTask/WorkTaskLeagueFlow.js

import * as React from 'react'

import LeagueTargetStep from './steps/LeagueTargetStep.js'
import LeagueTaskTypeStep from './steps/LeagueTaskTypeStep.js'
import LevelStep from './steps/LevelStep.js'
import ReviewStep from './steps/ReviewStep.js'
import RouteStep from './steps/RouteStep.js'
import YearStep from './steps/YearStep.js'

export default function WorkTaskLeagueFlow({ mode, model, actions }) {
  if (mode === 'route') return <RouteStep model={model} actions={actions} />
  if (mode === 'year') return <YearStep model={model} actions={actions} />
  if (mode === 'level') return <LevelStep model={model} actions={actions} />
  if (mode === 'review') return <ReviewStep model={model} actions={actions} />
  if (mode === 'taskType') return <LeagueTaskTypeStep model={model} actions={actions} />
  if (mode === 'target') return <LeagueTargetStep model={model} actions={actions} />

  return null
}

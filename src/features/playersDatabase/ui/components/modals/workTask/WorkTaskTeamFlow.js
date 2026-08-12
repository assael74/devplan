// src/features/playersDatabase/ui/components/modals/workTask/WorkTaskTeamFlow.js

import * as React from 'react'

import TeamContextStep from './steps/TeamContextStep.js'
import TeamLookupStep from './steps/TeamLookupStep.js'

export default function WorkTaskTeamFlow({ mode, model, actions }) {
  if (mode === 'context') {
    return <TeamContextStep model={model} actions={actions} />
  }

  if (mode === 'lookup') {
    return <TeamLookupStep model={model} actions={actions} />
  }

  return null
}

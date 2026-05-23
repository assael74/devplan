// teamProfile/sharedUi/insights/teamGames/TeamGamesInsightsContent.js

import React from 'react'

import {
  InsightsLoading,
  LocalHeader,
} from './layout/index.js'

import {
  TeamGamesSections,
} from './sections/index.js'

import { useTeamGamesInsightsModel } from './useTeamGamesInsightsModel.js'

function buildHeaderAction(model) {
  return (
    <LocalHeader
      model={model}
      calculationMode={model.calculationMode}
      onCalculationModeChange={model.setCalculationMode}
      liveTeam={model.liveTeam}
    />
  )
}

export default function TeamGamesInsightsContent({ games, entity, team, enabled = true }) {
  const model = useTeamGamesInsightsModel({
    games,
    entity,
    team,
    enabled,
    defer: true,
  })

  const headerAction = buildHeaderAction(model)

  if (model.isBuilding) {
    return (
      <InsightsLoading
        model={model}
        calculationMode={model.calculationMode}
        onCalculationModeChange={model.setCalculationMode}
        liveTeam={model.liveTeam}
      />
    )
  }

  return (
    <TeamGamesSections
      model={model}
      headerAction={headerAction}
    />
  )
}

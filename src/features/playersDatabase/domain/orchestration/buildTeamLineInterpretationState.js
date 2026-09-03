// src/features/playersDatabase/domain/orchestration/buildTeamLineInterpretationState.js

import {
  buildTeamLinePerformanceInterpretation,
} from '../../../../shared/scouting/teams/interpretation/teamLinePerformanceInterpretation.js'
import { buildTeamBalanceState } from './buildTeamBalanceState.js'

const pickPerformance = (...values) => {
  for (const value of values) {
    if (value && typeof value === 'object') return value
  }

  return null
}

export const buildTeamLineInterpretationState = ({
  teamDocument = {},
  seasonDocument = {},
  balanceState = null,
} = {}) => {
  const seasonSource = seasonDocument && typeof seasonDocument === 'object'
    ? seasonDocument
    : {}
  const balance = balanceState && typeof balanceState === 'object'
    ? balanceState
    : buildTeamBalanceState({
      teamDocument,
      seasonDocument: seasonSource,
    })
  const offense = pickPerformance(
    seasonSource.teamAttackPerformance,
    seasonSource.offense,
    seasonSource.performance?.offense,
    seasonSource.teamScout?.offense
  )
  const defense = pickPerformance(
    seasonSource.teamDefensePerformance,
    seasonSource.defense,
    seasonSource.performance?.defense,
    seasonSource.teamScout?.defense
  )

  return buildTeamLinePerformanceInterpretation({
    offense,
    defense,
    lineupBenchmark: balance?.lineupBenchmark,
    classificationCoverageBenchmark: balance?.classificationCoverageBenchmark,
    lineClassificationCoverage: balance?.lineClassificationCoverage,
  })
}

// src/shared/scouting/teams/balance/teamBalance.builder.js

import {
  buildTeamLineStructure,
  buildTeamLineClassificationCoverage,
} from '../lines/index.js'
import {
  evaluateTeamLineupStructureBenchmark,
} from './benchmark/evaluateTeamLineupStructureBenchmark.js'
import {
  evaluateTeamClassificationCoverageBenchmark,
} from './benchmark/evaluateTeamClassificationCoverageBenchmark.js'
import { buildTeamBalanceAvailability } from './teamBalanceAvailability.js'

export const buildTeamBalance = ({ players = [], teamGamePlayed = 0 } = {}) => {
  const lineClassificationCoverage = buildTeamLineClassificationCoverage({ players })
  const lineStructure = buildTeamLineStructure({ players })
  const balanceAvailability = buildTeamBalanceAvailability({
    teamGamePlayed,
    lineStructure,
  })
  const lineupBenchmark = evaluateTeamLineupStructureBenchmark({
    lineStructure,
    balanceAvailability,
  })
  const classificationCoverageBenchmark = evaluateTeamClassificationCoverageBenchmark({
    lineStructure,
    balanceAvailability,
  })

  return {
    version: 'team-balance-v13',
    lineClassificationCoverage,
    lineStructure,
    balanceAvailability,
    lineupBenchmark,
    classificationCoverageBenchmark,
    conclusions: [],
    annotations: {},
  }
}

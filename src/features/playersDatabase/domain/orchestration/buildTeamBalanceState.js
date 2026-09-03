// src/features/playersDatabase/domain/orchestration/buildTeamBalanceState.js

import {
  buildTeamBalance,
} from '../../../../shared/scouting/teams/index.js'
import {
  buildTeamLinePerformanceInterpretation,
} from '../../../../shared/scouting/teams/interpretation/teamLinePerformanceInterpretation.js'
import {
  TEAM_BALANCE_OUTPUT_CONTRACT_VERSION,
} from '../../../../shared/scouting/scouting.version.js'
import {
  adaptTeamBalanceInput,
} from '../adapters/teamBalanceInput.adapter.js'

const clean = value => String(
  value === undefined || value === null ? '' : value
).trim()

const pickPerformance = (...values) => {
  for (const value of values) {
    if (value && typeof value === 'object') return value
  }

  return null
}

const pickTeamGamePlayed = (...values) => {
  for (const value of values) {
    const number = Number(value)
    if (Number.isFinite(number) && number >= 0) return number
  }

  return 0
}

export const buildTeamBalanceState = ({
  teamDocument = {},
  seasonDocument = {},
} = {}) => {
  const teamSource = teamDocument && typeof teamDocument === 'object'
    ? teamDocument
    : {}
  const seasonSource = seasonDocument && typeof seasonDocument === 'object'
    ? seasonDocument
    : {}
  const input = adaptTeamBalanceInput({
    teamPlayers: seasonSource.teamPlayers,
  })
  const balance = buildTeamBalance({
    ...input,
    teamGamePlayed: pickTeamGamePlayed(
      seasonSource.teamStats?.teamGamePlayed,
      seasonSource.teamStats?.gamesPlayed,
      seasonSource.teamGamePlayed,
      teamSource.teamStats?.teamGamePlayed,
      teamSource.teamStats?.gamesPlayed,
      teamSource.teamGamePlayed
    ),
  })
  const scoutInterpretation = buildTeamLinePerformanceInterpretation({
    offense: pickPerformance(
      seasonSource.teamAttackPerformance,
      seasonSource.offense,
      seasonSource.performance?.offense,
      seasonSource.teamScout?.offense
    ),
    defense: pickPerformance(
      seasonSource.teamDefensePerformance,
      seasonSource.defense,
      seasonSource.performance?.defense,
      seasonSource.teamScout?.defense
    ),
    lineupBenchmark: balance.lineupBenchmark,
    classificationCoverageBenchmark: balance.classificationCoverageBenchmark,
    lineClassificationCoverage: balance.lineClassificationCoverage,
  })

  return {
    ...balance,
    scoutInterpretation,
    outputContractVersion: TEAM_BALANCE_OUTPUT_CONTRACT_VERSION,
    source: {
      collection: 'birthTeamSeasons',
      teamDocumentId: clean(
        teamSource.birthTeamDocumentId ||
        teamSource.teamDocumentId ||
        teamSource.id
      ),
      seasonId: clean(seasonSource.seasonId),
      seasonKey: clean(seasonSource.seasonKey),
      seasonTarget: clean(seasonSource.seasonStatus) === 'completed'
        ? 'history'
        : 'current',
      sourceType: 'teamSeasonDocumentStats',
      updatedAt: seasonSource.updatedAt || teamSource.updatedAt || null,
    },
  }
}

// src/shared/scouting/teams/balance/benchmark/evaluateTeamClassificationCoverageBenchmark.js

import { TEAM_CLASSIFICATION_COVERAGE_BENCHMARK } from './teamClassificationCoverageBenchmark.definition.js'

const numberOrZero = value => {
  const number = Number(value)
  return Number.isFinite(number) && number >= 0 ? number : 0
}

export const evaluateTeamClassificationCoverageBenchmark = ({
  lineStructure = {},
  balanceAvailability = {},
  definition = TEAM_CLASSIFICATION_COVERAGE_BENCHMARK,
} = {}) => {
  const structure = lineStructure && typeof lineStructure === 'object' ? lineStructure : {}
  const benchmark = definition && typeof definition === 'object'
    ? definition
    : TEAM_CLASSIFICATION_COVERAGE_BENCHMARK
  const range = benchmark.typicalRange && typeof benchmark.typicalRange === 'object'
    ? benchmark.typicalRange
    : {}
  const actual = numberOrZero(structure.classifiedPlayersCount)
  const minimum = numberOrZero(range.min)
  const maximum = numberOrZero(range.max)
  const available = balanceAvailability?.availability === 'available'

  return {
    definitionId: String(benchmark.definitionId || ''),
    definitionVersion: String(benchmark.definitionVersion || ''),
    availability: available ? 'available' : 'unavailable',
    availabilityReason: available ? null : String(balanceAvailability?.availabilityReason || 'stats_not_loaded'),
    actual,
    typicalRange: {
      min: minimum,
      max: maximum,
    },
    state: !available
      ? 'unavailable'
      : actual < minimum
        ? 'below_typical'
        : actual > maximum
          ? 'above_typical'
          : 'typical',
  }
}

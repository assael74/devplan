// src/shared/scouting/teams/balance/benchmark/evaluateTeamLineupStructureBenchmark.js

import { TEAM_LINEUP_STRUCTURE_BENCHMARK } from './teamLineupStructureBenchmark.definition.js'

export const TEAM_LINEUP_STRUCTURE_BENCHMARK_AVAILABILITY = Object.freeze({
  AVAILABLE: 'available',
  UNAVAILABLE: 'unavailable',
})

export const TEAM_LINEUP_STRUCTURE_BENCHMARK_STATE = Object.freeze({
  BELOW_REFERENCE: 'below_reference',
  AT_REFERENCE: 'at_reference',
  ABOVE_REFERENCE: 'above_reference',
  UNAVAILABLE: 'unavailable',
})

const numberOrZero = value => {
  const number = Number(value)
  return Number.isFinite(number) && number >= 0 ? number : 0
}

const buildMetric = ({ actual, reference, available }) => {
  const normalizedActual = numberOrZero(actual)
  const normalizedReference = numberOrZero(reference)

  if (!available) {
    return {
      actual: normalizedActual,
      reference: normalizedReference,
      delta: null,
      state: TEAM_LINEUP_STRUCTURE_BENCHMARK_STATE.UNAVAILABLE,
    }
  }

  const delta = normalizedActual - normalizedReference
  return {
    actual: normalizedActual,
    reference: normalizedReference,
    delta,
    state: delta < 0
      ? TEAM_LINEUP_STRUCTURE_BENCHMARK_STATE.BELOW_REFERENCE
      : delta > 0
        ? TEAM_LINEUP_STRUCTURE_BENCHMARK_STATE.ABOVE_REFERENCE
        : TEAM_LINEUP_STRUCTURE_BENCHMARK_STATE.AT_REFERENCE,
  }
}

export const evaluateTeamLineupStructureBenchmark = ({
  lineStructure = {},
  balanceAvailability = {},
  definition = TEAM_LINEUP_STRUCTURE_BENCHMARK,
} = {}) => {
  const structure = lineStructure && typeof lineStructure === 'object'
    ? lineStructure
    : {}
  const benchmark = definition && typeof definition === 'object'
    ? definition
    : TEAM_LINEUP_STRUCTURE_BENCHMARK
  const metrics = benchmark.metrics && typeof benchmark.metrics === 'object'
    ? benchmark.metrics
    : {}
  const available = balanceAvailability?.availability === 'available'
  const availability = available
    ? TEAM_LINEUP_STRUCTURE_BENCHMARK_AVAILABILITY.AVAILABLE
    : TEAM_LINEUP_STRUCTURE_BENCHMARK_AVAILABILITY.UNAVAILABLE

  return {
    definitionId: String(benchmark.definitionId || ''),
    definitionVersion: String(benchmark.definitionVersion || ''),
    availability,
    availabilityReason: available ? null : String(balanceAvailability?.availabilityReason || 'stats_not_loaded'),
    metrics: {
      goalkeeper: buildMetric({
        actual: structure.goalkeeperPlayersCount,
        reference: metrics.goalkeeper?.reference,
        available,
      }),
      defense: buildMetric({
        actual: structure.lines?.defense?.playersCount,
        reference: metrics.defense?.reference,
        available,
      }),
      midfieldCore: buildMetric({
        actual: structure.composition?.midfieldCorePlayersCount,
        reference: metrics.midfieldCore?.reference,
        available,
      }),
      attackingMidfielder: buildMetric({
        actual: structure.positions?.attackingMidfielder?.playersCount,
        reference: metrics.attackingMidfielder?.reference,
        available,
      }),
      midfield: buildMetric({
        actual:
          numberOrZero(structure.composition?.midfieldCorePlayersCount) +
          numberOrZero(structure.positions?.attackingMidfielder?.playersCount),
        reference:
          numberOrZero(metrics.midfieldCore?.reference) +
          numberOrZero(metrics.attackingMidfielder?.reference),
        available,
      }),
      attack: buildMetric({
        actual: structure.lines?.attack?.playersCount,
        reference: metrics.attack?.reference,
        available,
      }),
    },
  }
}

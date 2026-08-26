// src/shared/scouting/teams/balance/teamBalance.rotationBenchmarkComparison.js

import { TEAM_BALANCE_AVAILABILITY } from './teamBalance.model.js'
import { TEAM_BALANCE_ROTATION_BENCHMARK_V1 } from './teamBalance.rotationBenchmark.js'

const classifyAgainstQuartiles = ({ value, range }) => {
  if (!Number.isFinite(Number(value)) || !range) return null

  if (value < range.p25) return 'below_typical'
  if (value > range.p75) return 'above_typical'

  return 'typical'
}

const buildTopShareComparison = ({
  metric,
  benchmark,
  availability,
}) => {
  if (!metric || !benchmark) return null

  const hasFullTopN = metric.hasFullTopN === true
  const comparisonAvailability = !hasFullTopN
    ? 'unavailable_for_small_roster'
    : availability

  return {
    value: metric.share,
    benchmark,
    band: (
      hasFullTopN &&
      availability === TEAM_BALANCE_AVAILABILITY.AVAILABLE
    )
      ? classifyAgainstQuartiles({
          value: metric.share,
          range: benchmark,
        })
      : null,
    comparisonAvailability,
    actualCount: metric.actualCount,
    hasFullTopN,
    coversAllKnownPlayers: metric.coversAllKnownPlayers,
  }
}

const buildMetricComparison = ({
  metric = {},
  benchmark = {},
}) => ({
  availability: metric.availability ||
    TEAM_BALANCE_AVAILABILITY.UNAVAILABLE,
  coverage: metric.coverage ?? null,
  topShares: Object.keys(benchmark?.topShares || {}).reduce(
    (result, key) => ({
      ...result,
      [key]: buildTopShareComparison({
        metric: metric?.topShares?.[key],
        benchmark: benchmark.topShares[key],
        availability: metric.availability ||
          TEAM_BALANCE_AVAILABILITY.UNAVAILABLE,
      }),
    }),
    {}
  ),
})

export const buildTeamBalanceRotationBenchmark = ({
  rotationDistribution = {},
  benchmark = TEAM_BALANCE_ROTATION_BENCHMARK_V1,
} = {}) => ({
  family: 'rotationDistributionBenchmark',
  benchmarkVersion: benchmark?.benchmarkVersion || null,
  availability: rotationDistribution?.availability ||
    TEAM_BALANCE_AVAILABILITY.UNAVAILABLE,
  starts: buildMetricComparison({
    metric: rotationDistribution?.starts,
    benchmark: benchmark?.starts,
  }),
  substituteIn: buildMetricComparison({
    metric: rotationDistribution?.substituteIn,
    benchmark: benchmark?.substituteIn,
  }),
  usageTypes: {
    availability: rotationDistribution?.usageTypes?.availability ||
      TEAM_BALANCE_AVAILABILITY.UNAVAILABLE,
    coverage: rotationDistribution?.usageTypes?.coverage ?? null,
    bandPolicy: 'descriptive_only_v1',
  },
})

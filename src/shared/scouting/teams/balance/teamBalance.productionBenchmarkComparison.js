// src/shared/scouting/teams/balance/teamBalance.productionBenchmarkComparison.js

import { TEAM_BALANCE_AVAILABILITY } from './teamBalance.model.js'
import { TEAM_BALANCE_PRODUCTION_BENCHMARK_V1 } from './teamBalance.productionBenchmark.js'

const classifyAgainstQuartiles = ({ value, range }) => {
  if (!Number.isFinite(Number(value)) || !range) return null

  if (value < range.p25) return 'below_typical'
  if (value > range.p75) return 'above_typical'

  return 'typical'
}

const buildComparison = ({
  value,
  benchmark,
  availability,
  allowBand = true,
  note = null,
}) => ({
  value,
  benchmark,
  band: (
    allowBand &&
    availability === TEAM_BALANCE_AVAILABILITY.AVAILABLE
  )
    ? classifyAgainstQuartiles({
        value,
        range: benchmark,
      })
    : null,
  comparisonAvailability: availability,
  note,
})

export const buildTeamBalanceProductionBenchmark = ({
  productionDistribution = {},
  benchmark = TEAM_BALANCE_PRODUCTION_BENCHMARK_V1,
} = {}) => {
  const availability = productionDistribution?.availability ||
    TEAM_BALANCE_AVAILABILITY.UNAVAILABLE
  const concentration = productionDistribution?.concentration || {}
  const breadth = productionDistribution?.breadth || {}

  return {
    family: 'productionDistributionBenchmark',
    benchmarkVersion: benchmark?.benchmarkVersion || null,
    availability,
    coverage: productionDistribution?.goalsKnownCoverage ?? null,
    totalGoals: productionDistribution?.totalGoals ?? null,
    concentration: {
      top1Share: buildComparison({
        value: concentration.top1Share,
        benchmark: benchmark?.concentration?.top1Share,
        availability,
      }),
      top3Share: buildComparison({
        value: concentration.top3Share,
        benchmark: benchmark?.concentration?.top3Share,
        availability,
      }),
    },
    breadth: {
      validatedForBand: benchmark?.breadth?.validatedForBand === true,
      bandPolicy: benchmark?.breadth?.bandPolicy || null,
      uniqueScorers: buildComparison({
        value: breadth.uniqueScorers,
        benchmark: benchmark?.breadth?.uniqueScorers,
        availability,
        allowBand: false,
        note: 'descriptive_only_until_goals_volume_adjustment',
      }),
      scorers3Plus: buildComparison({
        value: breadth.scorers3Plus,
        benchmark: benchmark?.breadth?.scorers3Plus,
        availability,
        allowBand: false,
        note: 'descriptive_only_until_goals_volume_adjustment',
      }),
      scorers5Plus: buildComparison({
        value: breadth.scorers5Plus,
        benchmark: benchmark?.breadth?.scorers5Plus,
        availability,
        allowBand: false,
        note: 'descriptive_only_until_goals_volume_adjustment',
      }),
    },
  }
}

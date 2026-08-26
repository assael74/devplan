// src/shared/scouting/teams/balance/teamBalance.minutesBenchmark.js

import { TEAM_BALANCE_AVAILABILITY } from './teamBalance.model.js'
import { TEAM_BALANCE_MINUTES_BENCHMARK_V1 } from './teamBalance.benchmark.js'

const classifyAgainstQuartiles = ({ value, range }) => {
  if (!Number.isFinite(Number(value)) || !range) return null

  if (value < range.p25) return 'below_typical'
  if (value > range.p75) return 'above_typical'

  return 'typical'
}

const buildTopShareComparison = ({ metric, benchmark, availability }) => {
  if (!metric || !benchmark) return null

  const hasFullTopN = metric.hasFullTopN === true
  const comparisonAvailability = !hasFullTopN
    ? 'unavailable_for_small_roster'
    : availability

  return {
    value: metric.share,
    benchmark,
    band: hasFullTopN && availability !== TEAM_BALANCE_AVAILABILITY.UNAVAILABLE
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

const buildUsageCountComparison = ({
  value,
  benchmark,
  availability,
  teamMinutesConsistent,
}) => {
  const comparisonAvailability = teamMinutesConsistent
    ? availability
    : TEAM_BALANCE_AVAILABILITY.LIMITED

  return {
    value,
    benchmark,
    band: (
      comparisonAvailability !== TEAM_BALANCE_AVAILABILITY.UNAVAILABLE &&
      teamMinutesConsistent
    )
      ? classifyAgainstQuartiles({
          value,
          range: benchmark,
        })
      : null,
    comparisonAvailability,
    teamMinutesConsistent,
  }
}

export const buildTeamBalanceMinutesBenchmark = ({
  minutesDistribution = {},
  reliability = {},
  benchmark = TEAM_BALANCE_MINUTES_BENCHMARK_V1,
} = {}) => {
  const availability = minutesDistribution?.availability ||
    TEAM_BALANCE_AVAILABILITY.UNAVAILABLE
  const usageAvailability = minutesDistribution?.possibleMinutesUsage?.availability ||
    TEAM_BALANCE_AVAILABILITY.UNAVAILABLE
  const topShares = minutesDistribution?.topShares || {}
  const thresholdCounts = minutesDistribution?.possibleMinutesUsage?.thresholdCounts || {}

  return {
    family: 'minutesDistributionBenchmark',
    benchmarkVersion: benchmark?.benchmarkVersion || null,
    availability,
    reliability: reliability?.reliability || null,
    reliabilityContext: {
      loadedCoverage: reliability?.loadedCoverage ?? null,
      observedCoverage: reliability?.observedCoverage ?? null,
      ambiguousZeroLoadedCount: reliability?.ambiguousZeroLoadedCount ?? 0,
      sufficientBlockedByAmbiguousZeros:
        reliability?.sufficientBlockedByAmbiguousZeros === true,
      teamMinutesConsistent: reliability?.teamMinutesConsistent !== false,
    },
    topShares: Object.keys(benchmark?.topShares || {}).reduce((result, key) => ({
      ...result,
      [key]: buildTopShareComparison({
        metric: topShares[key],
        benchmark: benchmark.topShares[key],
        availability,
      }),
    }), {}),
    possibleMinutesUsage: {
      availability: usageAvailability,
      counts: Object.keys(benchmark?.possibleMinutesUsageCounts || {}).reduce(
        (result, key) => ({
          ...result,
          [key]: buildUsageCountComparison({
            value: thresholdCounts[key],
            benchmark: benchmark.possibleMinutesUsageCounts[key],
            availability: usageAvailability,
            teamMinutesConsistent: reliability?.teamMinutesConsistent !== false,
          }),
        }),
        {}
      ),
    },
  }
}

// src/shared/scouting/teams/balance/teamBalance.benchmark.js

export const TEAM_BALANCE_MINUTES_BENCHMARK_V1 = Object.freeze({
  benchmarkVersion: 'minutes-distribution-v1',
  sample: Object.freeze({
    teamCount: 22,
    source: 'validated-team-stats-sample',
    leagueLevelPolicy: 'shared-v1',
    tablePositionPolicy: 'not-applied-to-minutes-v1',
  }),
  topShares: Object.freeze({
    5: Object.freeze({
      p25: 0.36,
      median: 0.371,
      p75: 0.384,
    }),
    10: Object.freeze({
      p25: 0.622,
      median: 0.654,
      p75: 0.678,
    }),
    14: Object.freeze({
      p25: 0.779,
      median: 0.809,
      p75: 0.824,
    }),
  }),
  possibleMinutesUsageCounts: Object.freeze({
    70: Object.freeze({
      p25: 5.3,
      median: 6.5,
      p75: 7.8,
    }),
    50: Object.freeze({
      p25: 10,
      median: 11,
      p75: 12,
    }),
    30: Object.freeze({
      p25: 15,
      median: 16,
      p75: 17,
    }),
    10: Object.freeze({
      p25: 21,
      median: 23,
      p75: 24,
    }),
  }),
})

// src/shared/scouting/teams/balance/teamBalance.productionBenchmark.js

export const TEAM_BALANCE_PRODUCTION_BENCHMARK_V1 = Object.freeze({
  benchmarkVersion: 'production-distribution-v1',
  sample: Object.freeze({
    teamCount: 22,
    source: 'validated-team-stats-sample',
    leagueLevelPolicy: 'shared-v1',
    tablePositionPolicy: 'descriptive-only-v1',
    goalsVolumeAdjusted: false,
  }),
  concentration: Object.freeze({
    top1Share: Object.freeze({
      p25: 0.187,
      median: 0.225,
      p75: 0.288,
    }),
    top3Share: Object.freeze({
      p25: 0.464,
      median: 0.51,
      p75: 0.565,
    }),
  }),
  breadth: Object.freeze({
    validatedForBand: false,
    bandPolicy: 'disabled_until_goals_volume_adjustment',
    uniqueScorers: Object.freeze({
      p25: 12.3,
      median: 13,
      p75: 15.8,
    }),
    scorers3Plus: Object.freeze({
      p25: 5,
      median: 6,
      p75: 8,
    }),
    scorers5Plus: Object.freeze({
      p25: 3,
      median: 4,
      p75: 4.8,
    }),
  }),
})

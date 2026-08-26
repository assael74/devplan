// src/shared/scouting/teams/balance/teamBalance.rotationBenchmark.js

export const TEAM_BALANCE_ROTATION_BENCHMARK_V1 = Object.freeze({
  benchmarkVersion: 'rotation-distribution-v1',
  sample: Object.freeze({
    teamCount: 24,
    source: 'validated-loaded-team-stats-sample',
    matchMinutes: 80,
    leagueLevelPolicy: 'not-applied-v1',
    clubLevelPolicy: 'not-applied-v1',
    clubStrengthLevelPolicy: 'not-applied-v1',
    tablePositionPolicy: 'not-applied-v1',
  }),
  starts: Object.freeze({
    topShares: Object.freeze({
      5: Object.freeze({
        p25: 0.3899,
        median: 0.4071,
        p75: 0.4174,
      }),
      10: Object.freeze({
        p25: 0.6923,
        median: 0.7177,
        p75: 0.7471,
      }),
      14: Object.freeze({
        p25: 0.8374,
        median: 0.8809,
        p75: 0.9091,
      }),
    }),
  }),
  substituteIn: Object.freeze({
    topShares: Object.freeze({
      5: Object.freeze({
        p25: 0.3972,
        median: 0.4339,
        p75: 0.4607,
      }),
      10: Object.freeze({
        p25: 0.6462,
        median: 0.6991,
        p75: 0.7435,
      }),
      14: Object.freeze({
        p25: 0.7807,
        median: 0.8201,
        p75: 0.8719,
      }),
    }),
  }),
})

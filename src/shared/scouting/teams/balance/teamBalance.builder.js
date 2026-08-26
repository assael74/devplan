// src/shared/scouting/teams/balance/teamBalance.builder.js

import { buildTeamBalanceMinutesDistribution } from './teamBalance.minutesDistribution.js'
import { buildTeamBalanceDataReliability } from './teamBalance.reliability.js'
import { buildTeamBalanceMinutesBenchmark } from './teamBalance.minutesBenchmark.js'
import { buildTeamBalanceProductionDistribution } from './teamBalance.productionDistribution.js'
import { buildTeamBalanceRotationDistribution } from './teamBalance.rotationDistribution.js'
import { buildTeamBalanceRotationBenchmark } from './teamBalance.rotationBenchmarkComparison.js'
import { buildTeamBalanceProductionBenchmark } from './teamBalance.productionBenchmarkComparison.js'

export const buildTeamBalance = ({ players = [] } = {}) => {
  const reliability = buildTeamBalanceDataReliability({ players })
  const minutesDistribution = buildTeamBalanceMinutesDistribution({
    players,
    reliability,
  })
  const minutesBenchmark = buildTeamBalanceMinutesBenchmark({
    minutesDistribution,
    reliability,
  })
  const productionDistribution = buildTeamBalanceProductionDistribution({
    players,
    reliability,
  })
  const rotationDistribution = buildTeamBalanceRotationDistribution({
    players,
    reliability,
  })
  const rotationBenchmark = buildTeamBalanceRotationBenchmark({
    rotationDistribution,
  })
  const productionBenchmark = buildTeamBalanceProductionBenchmark({
    productionDistribution,
  })

  return {
    version: 'team-balance-v1',
    reliability,
    metrics: {
      minutesDistribution,
      productionDistribution,
      rotationDistribution,
    },
    benchmarks: {
      minutesDistribution: minutesBenchmark,
      productionDistribution: productionBenchmark,
      rotationDistribution: rotationBenchmark,
    },
    conclusions: [],
    annotations: {},
  }
}

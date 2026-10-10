// src/shared/scouting/teams/balance/benchmark/teamLineupStructureBenchmark.definition.test.js

import { TEAM_LINEUP_STRUCTURE_BENCHMARK } from './teamLineupStructureBenchmark.definition.js'

test('reference lineup represents eleven players', () => {
  const metrics = TEAM_LINEUP_STRUCTURE_BENCHMARK.metrics
  const playersCount = (
    metrics.goalkeeper.reference +
    metrics.defense.reference +
    metrics.midfieldCore.reference +
    metrics.attackingMidfielder.reference +
    metrics.attack.reference
  )

  expect(playersCount).toBe(11)
  expect(metrics.attack.reference).toBe(2)
  expect(TEAM_LINEUP_STRUCTURE_BENCHMARK.definitionVersion)
    .toBe('reference-lineup-structure-v2')
})


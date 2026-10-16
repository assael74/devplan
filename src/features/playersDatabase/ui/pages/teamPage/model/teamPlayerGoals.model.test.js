// src/features/playersDatabase/ui/pages/teamPage/model/teamPlayerGoals.model.test.js

import { buildPositionClassificationRows } from '../positionClassification/model/teamPositionClassificationRows.model.js'

const evidence = {
  actual: { goals: 7 },
  calculationContext: { seasonStatus: 'active', teamGamePlayed: 8, leagueTotalRound: 38 },
}

test('roster and movement rows share the same goal forecast from seasonal evidence', () => {
  const player = { playerId: 'p', playerStats: { goals: 7 } }
  const roster = buildPositionClassificationRows({ seasonDoc: {
    teamPlayers: [player], scouting: { playersById: { p: { evidence } } },
  } })[0]
  const movement = buildPositionClassificationRows({ seasonDoc: {
    teamPlayers: [{ ...player, scoutSeasonProjection: { evidence } }],
  } })[0]
  expect(roster.projectedGoals).toBe(33.25)
  expect(movement.projectedGoals).toBe(roster.projectedGoals)
})

test('missing or stale evidence does not create a forecast', () => {
  const rows = buildPositionClassificationRows({ seasonDoc: { teamPlayers: [
    { playerId: 'missing', playerStats: { goals: 7 } },
    { playerId: 'stale', playerStats: { goals: 8 }, scoutSeasonProjection: { evidence } },
  ] } })
  expect(rows.every(row => row.projectedGoals === null)).toBe(true)
})

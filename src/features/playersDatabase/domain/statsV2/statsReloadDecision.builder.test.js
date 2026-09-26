// src/features/playersDatabase/domain/statsV2/statsReloadDecision.builder.test.js

import {
  STATS_RELOAD_DECISION,
  buildStatsReloadDecisionState,
  findMissingPreviousStatsPlayers,
} from './statsReloadDecision.builder.js'

describe('statsReloadDecision.builder', () => {
  const previousPlayers = [
    { playerId: 'p1', fullName: 'One', statsStatus: 'loaded', playerStats: { games: 4 } },
    { playerId: 'p2', fullName: 'Two', statsStatus: 'loaded', playerStats: { games: 3 } },
    { playerId: 'p3', fullName: 'Three', statsStatus: 'missing' },
  ]

  test('finds only players with previous loaded stats that disappeared', () => {
    const missing = findMissingPreviousStatsPlayers({
      previousPlayers,
      incomingPlayers: [{ playerId: 'p1', fullName: 'One' }],
    })

    expect(missing.map(row => row.playerKey)).toEqual(['p2'])
  })

  test('requires an explicit preserve/remove decision', () => {
    const state = buildStatsReloadDecisionState({
      previousPlayers,
      incomingPlayers: [{ playerId: 'p1' }],
    })

    expect(state.isComplete).toBe(false)
    expect(state.unresolved.map(row => row.playerKey)).toEqual(['p2'])
  })

  test('accepts preserveStats without changing roster meaning', () => {
    const state = buildStatsReloadDecisionState({
      previousPlayers,
      incomingPlayers: [{ playerId: 'p1' }],
      decisions: {
        p2: STATS_RELOAD_DECISION.PRESERVE_STATS,
      },
    })

    expect(state.isComplete).toBe(true)
    expect(state.resolved).toEqual([
      expect.objectContaining({
        playerKey: 'p2',
        decision: STATS_RELOAD_DECISION.PRESERVE_STATS,
      }),
    ])
  })
})

test('accepts removeStats as an explicit reload decision', () => {
  const state = buildStatsReloadDecisionState({
    previousPlayers: [
      { playerId: 'p1', statsStatus: 'loaded', playerStats: { games: 4 } },
      { playerId: 'p2', statsStatus: 'loaded', playerStats: { games: 3 } },
    ],
    incomingPlayers: [{ playerId: 'p1' }],
    decisions: {
      p2: STATS_RELOAD_DECISION.REMOVE_STATS,
    },
  })

  expect(state.isComplete).toBe(true)
  expect(state.resolved).toEqual([
    expect.objectContaining({
      playerKey: 'p2',
      decision: STATS_RELOAD_DECISION.REMOVE_STATS,
    }),
  ])
})

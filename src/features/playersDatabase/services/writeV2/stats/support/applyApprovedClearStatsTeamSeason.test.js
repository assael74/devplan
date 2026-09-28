// src/features/playersDatabase/services/writeV2/stats/support/applyApprovedClearStatsTeamSeason.test.js

import { applyApprovedClearStatsTeamSeason } from './applyApprovedClearStatsTeamSeason.js'

const currentSeason = () => ({
  teamPlayers: [{
    playerId: 'p-1',
    fullName: 'Player One',
    rosterStatus: 'active',
    position: 'CB',
    statsStatus: 'loaded',
    playerStats: { games: 4, goals: 1 },
    scoutSignals: [{ id: 'signal-1' }],
  }],
  transfersIn: [{ movementId: 'in-1' }],
  transfersOut: [{ movementId: 'out-1' }],
  pendingPlayers: [{ playerId: 'pending-1' }],
  performance: { tableRank: 3 },
  teamStats: { games: 10 },
})

const mutation = () => ({
  playerOwnedPatches: [{
    playerKey: 'p-1',
    setFields: {
      statsStatus: 'missing',
      playerStats: { games: 0, goals: 0 },
    },
    unsetFields: ['scoutSignals'],
  }],
  teamOwnedSetFields: {
    scoutProfilesSummary: { total: 0, profileCounts: {} },
    statsLoadState: { status: 'missing' },
    teamBalance: { availability: 'unavailable' },
  },
})

describe('applyApprovedClearStatsTeamSeason', () => {
  test('applies Stats-owned fields and preserves Roster, Movement and Performance', () => {
    const current = currentSeason()
    const result = applyApprovedClearStatsTeamSeason({
      currentSeason: current,
      canonicalMutation: mutation(),
    })

    expect(result).not.toBe(current)
    expect(result.teamPlayers[0]).toEqual(expect.objectContaining({
      playerId: 'p-1',
      rosterStatus: 'active',
      position: 'CB',
      statsStatus: 'missing',
      playerStats: { games: 0, goals: 0 },
    }))
    expect(result.teamPlayers[0].scoutSignals).toBeUndefined()
    expect(result.transfersIn).toEqual(current.transfersIn)
    expect(result.transfersOut).toEqual(current.transfersOut)
    expect(result.pendingPlayers).toEqual(current.pendingPlayers)
    expect(result.performance).toEqual(current.performance)
    expect(result.teamStats).toEqual(current.teamStats)
  })

  test('rejects a set field outside Stats ownership', () => {
    const approvedMutation = mutation()
    approvedMutation.playerOwnedPatches[0].setFields.rosterStatus = 'inactive'

    expect(() => applyApprovedClearStatsTeamSeason({
      currentSeason: currentSeason(),
      canonicalMutation: approvedMutation,
    })).toThrow(expect.objectContaining({
      code: 'CLEAR_STATS_SET_FIELD_NOT_ALLOWED',
    }))
  })

  test('rejects an unset field outside Stats ownership', () => {
    const approvedMutation = mutation()
    approvedMutation.playerOwnedPatches[0].unsetFields.push('rosterStatus')

    expect(() => applyApprovedClearStatsTeamSeason({
      currentSeason: currentSeason(),
      canonicalMutation: approvedMutation,
    })).toThrow(expect.objectContaining({
      code: 'CLEAR_STATS_UNSET_FIELD_NOT_ALLOWED',
    }))
  })

  test('rejects a Team field outside Stats ownership', () => {
    const approvedMutation = mutation()
    approvedMutation.teamOwnedSetFields.performance = { tableRank: 1 }

    expect(() => applyApprovedClearStatsTeamSeason({
      currentSeason: currentSeason(),
      canonicalMutation: approvedMutation,
    })).toThrow(expect.objectContaining({
      code: 'CLEAR_STATS_TEAM_SET_FIELD_NOT_ALLOWED',
    }))
  })

  test('rejects a patch whose canonical player target is missing', () => {
    const approvedMutation = mutation()
    approvedMutation.playerOwnedPatches[0].playerKey = 'missing-player'

    expect(() => applyApprovedClearStatsTeamSeason({
      currentSeason: currentSeason(),
      canonicalMutation: approvedMutation,
    })).toThrow(expect.objectContaining({
      code: 'CLEAR_STATS_PLAYER_PATCH_TARGET_NOT_FOUND',
    }))
  })
})

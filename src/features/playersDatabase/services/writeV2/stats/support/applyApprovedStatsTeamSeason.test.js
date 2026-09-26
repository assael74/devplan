// src/features/playersDatabase/services/writeV2/stats/support/applyApprovedStatsTeamSeason.test.js

import { applyApprovedStatsTeamSeason } from './applyApprovedStatsTeamSeason.js'

const player = overrides => ({
  playerId: 'p1',
  fullName: 'Player One',
  rosterStatus: 'regular',
  position: 'CB',
  statsStatus: 'missing',
  playerStats: {},
  ...overrides,
})

const approved = overrides => ({
  seasonStatus: 'active',
  playersCount: 1,
  playerOwnedPatches: [],
  approvedNewParticipants: [],
  localMovementPatch: null,
  teamBalance: { status: 'available' },
  teamScout: { offense: { priorityLevel: 'high' }, defense: { priorityLevel: 'low' } },
  scoutProfilesSummary: { total: 1 },
  statsLoadState: { status: 'approved' },
  ...overrides,
})

describe('applyApprovedStatsTeamSeason', () => {
  test('applies only Stats-owned player fields and preserves roster fields', () => {
    const result = applyApprovedStatsTeamSeason({
      currentSeason: {
        teamPlayers: [player({ rosterStatus: 'regular', position: 'CB' })],
        tableRank: 3,
      },
      approvedTeamSeason: approved({
        playerOwnedPatches: [{
          playerKey: 'p1',
          statsStatus: 'loaded',
          playerStats: { games: 9 },
          lineClassification: { line: 'DEFENSE' },
          rosterStatus: 'left',
          position: 'FW',
        }],
      }),
    })

    expect(result.teamPlayers[0].statsStatus).toBe('loaded')
    expect(result.teamPlayers[0].playerStats).toEqual({ games: 9 })
    expect(result.teamPlayers[0].rosterStatus).toBe('regular')
    expect(result.teamPlayers[0].position).toBe('CB')
    expect(result.tableRank).toBe(3)
  })

  test('adds only explicitly approved new participants', () => {
    const result = applyApprovedStatsTeamSeason({
      currentSeason: { teamPlayers: [player()] },
      approvedTeamSeason: approved({
        approvedNewParticipants: [player({ playerId: 'p2', fullName: 'Player Two', rosterStatus: 'left' })],
      }),
    })

    expect(result.teamPlayers).toHaveLength(2)
    expect(result.teamPlayers[1].playerId).toBe('p2')
    expect(result.teamPlayers[1].rosterStatus).toBe('left')
  })

  test('replaces only approved local Movement arrays', () => {
    const result = applyApprovedStatsTeamSeason({
      currentSeason: {
        teamPlayers: [player()],
        transfersIn: [{ movementId: 'old' }],
        transfersOut: [],
        pendingPlayers: [],
      },
      approvedTeamSeason: approved({
        localMovementPatch: {
          transfersIn: [{ movementId: 'new' }],
          transfersOut: [{ movementId: 'out' }],
          pendingPlayers: [],
        },
      }),
    })

    expect(result.transfersIn).toEqual([{ movementId: 'new' }])
    expect(result.transfersOut).toEqual([{ movementId: 'out' }])
  })

  test('fails when an approved player patch has no canonical or approved participant target', () => {
    expect(() => applyApprovedStatsTeamSeason({
      currentSeason: { teamPlayers: [player()] },
      approvedTeamSeason: approved({
        playerOwnedPatches: [{
          playerKey: 'missing-player',
          statsStatus: 'loaded',
          playerStats: { games: 1 },
        }],
      }),
    })).toThrow('Approved Stats player patch target was not found')
  })

  test('uses approved playersCount and preserves Team Season fields outside Stats ownership', () => {
    const result = applyApprovedStatsTeamSeason({
      currentSeason: {
        teamPlayers: [player()],
        playersCount: 99,
        tableRank: 4,
        tableAttackRank: 2,
        tableDefenseRank: 6,
        teamStats: { teamGamePlayed: 11, goalsFor: 20, goalsAgainst: 10 },
        rosterSource: 'roster-v2',
      },
      approvedTeamSeason: approved({ playersCount: 1 }),
    })

    expect(result.playersCount).toBe(1)
    expect(result.tableRank).toBe(4)
    expect(result.tableAttackRank).toBe(2)
    expect(result.tableDefenseRank).toBe(6)
    expect(result.teamStats).toEqual({ teamGamePlayed: 11, goalsFor: 20, goalsAgainst: 10 })
    expect(result.rosterSource).toBe('roster-v2')
  })

})

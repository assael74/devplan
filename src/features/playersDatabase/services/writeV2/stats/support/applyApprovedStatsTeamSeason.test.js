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
          setFields: {
            statsStatus: 'loaded',
            playerStats: { games: 9 },
            lineClassification: { line: 'DEFENSE' },
            rosterStatus: 'left',
            position: 'FW',
          },
          unsetFields: [],
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


  test('missing Stats patch removes stale rich scouting from the persisted player state', () => {
    const result = applyApprovedStatsTeamSeason({
      currentSeason: {
        teamPlayers: [player({
          statsStatus: 'loaded',
          playerStats: { games: 4, goals: 1 },
          scoutSignals: [{ id: 'signal-1' }],
          scoutCombinations: [{ id: 'combination-1' }],
          scoutCombinationIds: ['combination-1'],
          scoutEvidence: [{ id: 'evidence-1' }],
          scoutCandidateSignals: [{ id: 'candidate-1' }],
          scoutProfileCaseStrength: { score: 80 },
          scoutProfileProgression: { direction: 'up' },
          hierarchy: { primary: 'profile-1' },
          opportunity: { status: 'watch' },
          interest: { level: 'interesting' },
          progression: { level: 'rising' },
          combinations: [{ id: 'legacy-combination' }],
        })],
      },
      approvedTeamSeason: approved({
        playerOwnedPatches: [{
          playerKey: 'p1',
          setFields: {
            statsStatus: 'missing',
            playerStats: {
              games: 0,
              goals: 0,
              yellowCards: 0,
              minutes: 0,
              starts: 0,
              substituteIn: 0,
              substitutedOut: 0,
              teamMinutes: 0,
              teamGames: 0,
              teamRank: null,
              teamGoalsFor: 0,
              teamGoalsAgainst: 0,
              minutesPerGame: 0,
              goalsPer90: 0,
            },
            lineClassification: {
              line: '',
              position: null,
              source: '',
              evidenceLevel: '',
              modelVersion: 'test',
            },
            primaryScoutProfileId: '',
            primaryScoutProfileStrengthDepthPct: null,
            professionalScoutProfileIds: [],
            preliminaryScoutProfileIds: [],
            scoutEffectiveImmediacyStatus: '',
            scoutPlayerInterestLevel: '',
            scoutEngineVersion: 'test',
          },
          unsetFields: [
            'scoutSignals',
            'scoutCombinations',
            'scoutCombinationIds',
            'scoutEvidence',
            'scoutCandidateSignals',
            'scoutProfileCaseStrength',
            'scoutProfileProgression',
            'hierarchy',
            'opportunity',
            'interest',
            'progression',
            'combinations',
          ],
        }],
      }),
    })

    const persistedPlayer = result.teamPlayers[0]

    expect(persistedPlayer.statsStatus).toBe('missing')
    expect(persistedPlayer.scoutSignals).toBeUndefined()
    expect(persistedPlayer.scoutCombinations).toBeUndefined()
    expect(persistedPlayer.scoutCombinationIds).toBeUndefined()
    expect(persistedPlayer.scoutEvidence).toBeUndefined()
    expect(persistedPlayer.scoutCandidateSignals).toBeUndefined()
    expect(persistedPlayer.scoutProfileCaseStrength).toBeUndefined()
    expect(persistedPlayer.scoutProfileProgression).toBeUndefined()
    expect(persistedPlayer.hierarchy).toBeUndefined()
    expect(persistedPlayer.opportunity).toBeUndefined()
    expect(persistedPlayer.interest).toBeUndefined()
    expect(persistedPlayer.progression).toBeUndefined()
    expect(persistedPlayer.combinations).toBeUndefined()
    expect(persistedPlayer.rosterStatus).toBe('regular')
    expect(persistedPlayer.position).toBe('CB')
  })

  test('fails when an approved player patch has no canonical or approved participant target', () => {
    expect(() => applyApprovedStatsTeamSeason({
      currentSeason: { teamPlayers: [player()] },
      approvedTeamSeason: approved({
        playerOwnedPatches: [{
          playerKey: 'missing-player',
          setFields: {
            statsStatus: 'loaded',
            playerStats: { games: 1 },
          },
          unsetFields: [],
        }],
      }),
    })).toThrow('Approved Stats player patch target was not found')
  })

  test('rejects an approved unset field outside Stats ownership', () => {
    expect(() => applyApprovedStatsTeamSeason({
      currentSeason: { teamPlayers: [player()] },
      approvedTeamSeason: approved({
        playerOwnedPatches: [{
          playerKey: 'p1',
          setFields: {},
          unsetFields: ['rosterStatus'],
        }],
      }),
    })).toThrow('Approved Stats unset field is not Stats-owned')
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

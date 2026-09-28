// src/features/playersDatabase/domain/statsV2/clearStatsProjectionPlan.builder.test.js

import { prepareClearStatsPlanV2 } from '../../services/writeV2/stats/prepare/prepareClearStatsPlanV2.js'
import { buildClearStatsApprovedStateV2 } from './clearStatsApprovedState.builder.js'
import { buildClearStatsProjectionPlanV2 } from './clearStatsProjectionPlan.builder.js'
import { buildStatsAbsentTeamSeasonState } from './statsAbsence.builder.js'

const identity = {
  birthTeamDocumentId: 'team-1',
  seasonKey: '2026',
  leagueId: 'league-1',
}

const buildAbsentTeamSeason = (teamPlayers = []) => buildStatsAbsentTeamSeasonState({
  ...identity,
  teamPlayers,
})

const expectCode = (callback, code) => {
  try {
    callback()
    throw new Error('Expected CLEAR_STATS projection validation to fail')
  } catch (error) {
    expect(error.code).toBe(code)
  }
}

const prepareAbsentPlan = ({ teamPlayers = [], projectionSources = {} } = {}) => (
  prepareClearStatsPlanV2({
    teamRoot: { id: 'team-1' },
    teamSeason: buildAbsentTeamSeason(teamPlayers),
    league: { id: 'league-1' },
    ...identity,
    projectionSources,
  })
)

describe('buildClearStatsProjectionPlanV2', () => {
  test('removes every Stats-owned rich scouting field from the Player Document season row', () => {
    const player = {
      playerId: 'player-1',
      playerDocumentId: 'player-document-1',
      rosterStatus: 'active',
    }
    const sourceRow = {
      seasonKey: '2026',
      birthTeamDocumentId: 'team-1',
      rosterStatus: 'active',
      statsStatus: 'loaded',
      playerStats: { games: 8, goals: 3 },
      scoutSignals: [{ id: 'signal-1' }],
      scoutEvidence: [{ id: 'evidence-1' }],
      scoutProfiles: [{ profileId: 'profile-1' }],
      progression: { id: 'legacy-progression' },
    }

    const plan = buildClearStatsProjectionPlanV2({
      identity,
      finalTeamSeasonPreview: buildAbsentTeamSeason([player]),
      projectionSources: {
        playerDocumentsById: {
          'player-document-1': { id: 'player-document-1', current: [sourceRow], history: [] },
        },
      },
    })

    const nextRow = plan.playerDocumentOperations[0].setFields.current[0]
    expect(nextRow.rosterStatus).toBe('active')
    expect(nextRow.statsStatus).toBe('missing')
    expect(nextRow).not.toHaveProperty('scoutSignals')
    expect(nextRow).not.toHaveProperty('scoutEvidence')
    expect(nextRow).not.toHaveProperty('scoutProfiles')
    expect(nextRow).not.toHaveProperty('progression')
  })

  test('does not emit an unapprovable Player Document target when playerDocumentId is missing', () => {
    const plan = buildClearStatsProjectionPlanV2({
      identity,
      finalTeamSeasonPreview: buildAbsentTeamSeason([{ playerId: 'player-1' }]),
      projectionSources: { playerDocumentsById: {} },
    })

    expect(plan.playerDocumentOperations).toEqual([])
  })

  test('clears a Player Document discovered through an orphan Player SearchIndex', () => {
    const sourceRow = {
      seasonKey: '2026',
      birthTeamDocumentId: 'team-1',
      rosterStatus: 'left',
      statsStatus: 'loaded',
      primaryScoutProfileId: 'profile-1',
      professionalScoutProfileIds: ['profile-1'],
    }
    const plan = buildClearStatsProjectionPlanV2({
      identity,
      finalTeamSeasonPreview: buildAbsentTeamSeason([]),
      projectionSources: {
        playerDocumentsById: {
          'orphan-player-document': {
            id: 'orphan-player-document',
            current: [sourceRow],
            history: [],
          },
        },
        playerSearchIndexesById: {
          'orphan-player-index': {
            id: 'orphan-player-index',
            entityType: 'playerSeason',
            playerId: 'removed-player',
            playerDocumentId: 'orphan-player-document',
            birthTeamDocumentId: 'team-1',
            seasonKey: '2026',
            leagueId: 'league-1',
          },
        },
      },
    })

    expect(plan.playerDocumentOperations).toHaveLength(1)
    expect(plan.playerDocumentOperations[0].action).toBe('update')
    expect(plan.playerDocumentOperations[0].setFields.current[0]).toEqual(
      expect.objectContaining({
        rosterStatus: 'left',
        statsStatus: 'missing',
        primaryScoutProfileId: '',
        professionalScoutProfileIds: [],
      })
    )
  })

  test('clears every matching Player SearchIndex even when its player is no longer in the roster', () => {
    const plan = buildClearStatsProjectionPlanV2({
      identity,
      finalTeamSeasonPreview: buildAbsentTeamSeason([]),
      projectionSources: {
        playerSearchIndexesById: {
          'orphan-player-index': {
            id: 'orphan-player-index',
            entityType: 'playerSeason',
            playerId: 'removed-player',
            birthTeamDocumentId: 'team-1',
            seasonKey: '2026',
            leagueId: 'league-1',
            statsStatus: 'loaded',
            games: 12,
            goals: 4,
          },
        },
      },
    })

    expect(plan.playerSearchIndexOperations).toHaveLength(1)
    expect(plan.playerSearchIndexOperations[0]).toEqual(expect.objectContaining({
      action: 'update',
      target: expect.objectContaining({
        docId: 'orphan-player-index',
        playerKey: 'removed-player',
      }),
      setFields: expect.objectContaining({
        statsStatus: 'missing',
        games: 0,
        goals: 0,
      }),
    }))
  })

  test('keeps the Player SearchIndex linked to its Canonical Player Document', () => {
    const finalTeamSeasonPreview = {
      ...buildAbsentTeamSeason([{
        playerId: 'player-1',
        playerDocumentId: 'external__1',
        rosterStatus: 'regular',
      }]),
      seasonStatus: 'active',
    }
    const plan = buildClearStatsProjectionPlanV2({
      identity,
      finalTeamSeasonPreview,
      projectionSources: {
        playerSearchIndexesById: {
          'player-index-1': {
            id: 'player-index-1',
            entityType: 'playerSeason',
            playerId: 'player-1',
            playerDocumentId: 'external__1',
            birthTeamDocumentId: 'team-1',
            seasonKey: '2026',
            leagueId: 'league-1',
            seasonStatus: '',
            sourceCollection: 'players',
            sourceDocumentId: '',
            sourceTarget: '',
          },
        },
      },
    })

    expect(plan.playerSearchIndexOperations[0].setFields).toEqual(
      expect.objectContaining({
        playerDocumentId: 'external__1',
        seasonStatus: 'active',
        sourceCollection: 'players',
        sourceDocumentId: 'external__1',
        sourceTarget: 'current',
      })
    )
  })

  test('preserves League official teamStats while clearing only Stats-owned metadata', () => {
    const teamStats = { points: 21, goalsFor: 18, goalsAgainst: 7, teamGamePlayed: 9 }
    const plan = buildClearStatsProjectionPlanV2({
      identity,
      finalTeamSeasonPreview: buildAbsentTeamSeason([
        { playerId: 'player-1', rosterStatus: 'active' },
        { playerId: 'player-2', rosterStatus: 'active' },
      ]),
      projectionSources: {
        league: {
          id: 'league-1',
          current: {
            seasonKey: '2026',
            tableRank: [{
              birthTeamId: 'team-1',
              rank: 2,
              teamStats,
              hasStats: true,
              statsComplete: true,
              playersCount: 17,
              scoutProfilesSummary: { total: 4, profileCounts: { p1: 4 } },
            }],
          },
          history: [],
        },
      },
    })

    const nextRow = plan.leagueOperation.setFields.current.tableRank[0]
    expect(nextRow.teamStats).toEqual(teamStats)
    expect(nextRow.rank).toBe(2)
    expect(nextRow).toEqual(expect.objectContaining({
      hasStats: false,
      statsComplete: false,
      playersCount: 2,
      scoutProfilesSummary: { total: 0, profileCounts: {} },
    }))
  })

  test('keeps canonical roster playersCount in Team, League and Clubs Master projections', () => {
    const projectionIdentity = { ...identity, clubId: 'club-1' }
    const finalTeamSeasonPreview = {
      ...buildAbsentTeamSeason([
        { playerId: 'player-1', rosterStatus: 'active' },
        { playerId: 'player-2', rosterStatus: 'active' },
      ]),
      playersCount: 2,
    }
    const plan = buildClearStatsProjectionPlanV2({
      identity: projectionIdentity,
      finalTeamSeasonPreview,
      projectionSources: {
        teamSearchIndex: {
          id: 'team-index-1',
          birthTeamDocumentId: 'team-1',
          seasonKey: '2026',
          leagueId: 'league-1',
          playersCount: 0,
        },
        league: {
          id: 'league-1',
          current: {
            seasonKey: '2026',
            tableRank: [{
              birthTeamId: 'team-1',
              playersCount: 0,
              hasStats: true,
              statsComplete: true,
              scoutProfilesSummary: { total: 1, profileCounts: { p1: 1 } },
            }],
          },
          history: [],
        },
        clubsMaster: {
          id: 'all',
          clubs: [{
            clubId: 'club-1',
            ageGroups: [{
              current: [{
                teamId: 'team-1',
                seasonKey: '2026',
                playersCount: 0,
              }],
              previous: [],
            }],
          }],
        },
      },
    })

    expect(plan.teamSearchIndexOperation.setFields.playersCount).toBe(2)
    expect(plan.teamSearchIndexOperation.setFields.teamSeasonDocumentId)
      .toBe('team-1__2026')
    expect(plan.leagueOperation.setFields.current.tableRank[0].playersCount).toBe(2)
    expect(
      plan.clubsMasterOperation.setFields.clubs[0].ageGroups[0].current[0].playersCount
    ).toBe(2)
  })

  test('rejects a projection source whose identity does not match the CLEAR_STATS target', () => {
    expectCode(() => buildClearStatsProjectionPlanV2({
      identity,
      finalTeamSeasonPreview: buildAbsentTeamSeason(),
      projectionSources: {
        teamSearchIndex: {
          id: 'other-team-index',
          birthTeamDocumentId: 'other-team',
          seasonKey: '2025',
        },
      },
    }), 'CLEAR_STATS_PROJECTION_IDENTITY_MISMATCH')
  })

  test('rejects a supplied Team SearchIndex with incomplete identity', () => {
    expectCode(() => buildClearStatsProjectionPlanV2({
      identity,
      finalTeamSeasonPreview: buildAbsentTeamSeason(),
      projectionSources: {
        teamSearchIndex: { id: 'team-index-1' },
      },
    }), 'CLEAR_STATS_PROJECTION_IDENTITY_REQUIRED')
  })

  test('rejects a target Player Document season row without team identity', () => {
    const player = {
      playerId: 'player-1',
      playerDocumentId: 'player-document-1',
    }

    expectCode(() => buildClearStatsProjectionPlanV2({
      identity,
      finalTeamSeasonPreview: buildAbsentTeamSeason([player]),
      projectionSources: {
        playerDocumentsById: {
          'player-document-1': {
            id: 'player-document-1',
            current: [{ seasonKey: '2026', statsStatus: 'loaded' }],
            history: [],
          },
        },
      },
    }), 'CLEAR_STATS_PLAYER_DOCUMENT_IDENTITY_REQUIRED')
  })

  test('rejects a Projection Plan that changes preserved League teamStats', () => {
    const plan = prepareAbsentPlan({
      projectionSources: {
        league: {
          id: 'league-1',
          current: {
            seasonKey: '2026',
            tableRank: [{
              birthTeamId: 'team-1',
              teamStats: { points: 21, goalsFor: 18, goalsAgainst: 7, teamGamePlayed: 9 },
              hasStats: true,
              statsComplete: true,
              playersCount: 17,
              scoutProfilesSummary: { total: 4, profileCounts: { p1: 4 } },
            }],
          },
          history: [],
        },
      },
    })
    plan.projectionPlan.leagueOperation.setFields.current.tableRank[0].teamStats.points = 999

    expectCode(() => buildClearStatsApprovedStateV2({
      proposedPlan: plan,
      approvedAt: '2026-09-27T12:00:00.000Z',
    }), 'CLEAR_STATS_APPROVED_PROJECTION_OWNERSHIP_VIOLATION')
  })

  test('approves the untouched Projection Plan produced by Prepare', () => {
    const player = {
      playerId: 'player-1',
      playerDocumentId: 'player-document-1',
      rosterStatus: 'active',
    }
    const plan = prepareAbsentPlan({
      teamPlayers: [player],
      projectionSources: {
        playerDocumentsById: {
          'player-document-1': {
            id: 'player-document-1',
            current: [{
              seasonKey: '2026',
              birthTeamDocumentId: 'team-1',
              rosterStatus: 'active',
              statsStatus: 'loaded',
              playerStats: { games: 8, goals: 3 },
            }],
            history: [],
          },
        },
        league: {
          id: 'league-1',
          current: {
            seasonKey: '2026',
            tableRank: [{
              birthTeamId: 'team-1',
              teamStats: { points: 21, goalsFor: 18, goalsAgainst: 7, teamGamePlayed: 9 },
              hasStats: true,
              statsComplete: true,
              playersCount: 17,
              scoutProfilesSummary: { total: 4, profileCounts: { p1: 4 } },
            }],
          },
          history: [],
        },
      },
    })

    expect(() => buildClearStatsApprovedStateV2({
      proposedPlan: plan,
      approvedAt: '2026-09-27T12:00:00.000Z',
    })).not.toThrow()
  })

  test('rejects a Projection Plan whose owned League fields do not equal canonical absence', () => {
    const plan = prepareAbsentPlan({
      projectionSources: {
        league: {
          id: 'league-1',
          current: {
            seasonKey: '2026',
            tableRank: [{
              birthTeamId: 'team-1',
              teamStats: { points: 21, goalsFor: 18, goalsAgainst: 7, teamGamePlayed: 9 },
              hasStats: true,
              statsComplete: true,
              playersCount: 17,
              scoutProfilesSummary: { total: 4, profileCounts: { p1: 4 } },
            }],
          },
          history: [],
        },
      },
    })
    plan.projectionPlan.leagueOperation.setFields.current.tableRank[0].hasStats = true

    expectCode(() => buildClearStatsApprovedStateV2({
      proposedPlan: plan,
      approvedAt: '2026-09-27T12:00:00.000Z',
    }), 'CLEAR_STATS_APPROVED_PROJECTION_ABSENCE_MISMATCH')
  })

  test('rejects a Projection Plan that changes a preserved Player Document field', () => {
    const player = {
      playerId: 'player-1',
      playerDocumentId: 'player-document-1',
      rosterStatus: 'active',
    }
    const plan = prepareAbsentPlan({
      teamPlayers: [player],
      projectionSources: {
        playerDocumentsById: {
          'player-document-1': {
            id: 'player-document-1',
            current: [{
              seasonKey: '2026',
              birthTeamDocumentId: 'team-1',
              rosterStatus: 'active',
              statsStatus: 'loaded',
              playerStats: { games: 8, goals: 3 },
            }],
            history: [],
          },
        },
      },
    })
    plan.projectionPlan.playerDocumentOperations[0]
      .setFields.current[0].rosterStatus = 'removed'

    expectCode(() => buildClearStatsApprovedStateV2({
      proposedPlan: plan,
      approvedAt: '2026-09-27T12:00:00.000Z',
    }), 'CLEAR_STATS_APPROVED_PROJECTION_OWNERSHIP_VIOLATION')
  })

  test('rejects a Player Document mutation for another team in the same season', () => {
    const player = {
      playerId: 'player-1',
      playerDocumentId: 'player-document-1',
      rosterStatus: 'active',
    }
    const plan = prepareAbsentPlan({
      teamPlayers: [player],
      projectionSources: {
        playerDocumentsById: {
          'player-document-1': {
            id: 'player-document-1',
            current: [
              {
                seasonKey: '2026',
                birthTeamDocumentId: 'team-1',
                rosterStatus: 'active',
                statsStatus: 'loaded',
                playerStats: { games: 8, goals: 3 },
              },
              {
                seasonKey: '2026',
                birthTeamDocumentId: 'team-2',
                rosterStatus: 'active',
                statsStatus: 'loaded',
                playerStats: { games: 4, goals: 1 },
              },
            ],
            history: [],
          },
        },
      },
    })
    plan.projectionPlan.playerDocumentOperations[0]
      .setFields.current[1].statsStatus = 'missing'

    expectCode(() => buildClearStatsApprovedStateV2({
      proposedPlan: plan,
      approvedAt: '2026-09-27T12:00:00.000Z',
    }), 'CLEAR_STATS_APPROVED_PROJECTION_OWNERSHIP_VIOLATION')
  })
})

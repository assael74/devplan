// src/features/playersDatabase/services/auditV2/stats/clear/auditClearStatsV2.test.js

import { buildStatsAbsentTeamSeasonState } from '../../../../domain/statsV2/statsAbsence.builder.js'
import { auditClearStatsV2 } from './auditClearStatsV2.js'

const preview = () => buildStatsAbsentTeamSeasonState({
  birthTeamDocumentId: 'team-1',
  seasonKey: '2026',
  leagueId: 'league-1',
  rosterStatus: 'loaded',
  transfersIn: [{ movementId: 'in-1' }],
  transfersOut: [{ movementId: 'out-1' }],
  pendingPlayers: [],
  teamPlayers: [{
    playerId: 'player-1',
    rosterStatus: 'active',
    statsStatus: 'loaded',
    playerStats: { games: 5, goals: 2 },
  }],
  scoutProfilesSummary: { total: 1, profileCounts: { p1: 1 } },
  statsLoadState: { status: 'loaded' },
})

const basePlan = () => ({
  planVersion: 1,
  playerDocumentOperations: [],
  playerSearchIndexOperations: [],
  teamSearchIndexOperation: null,
  leagueOperation: null,
  clubOperations: [],
  clubsMasterOperation: null,
})

const approvedState = ({ projectionPlan = basePlan() } = {}) => ({
  identity: {
    birthTeamDocumentId: 'team-1',
    seasonKey: '2026',
    leagueId: 'league-1',
  },
  finalTeamSeasonPreview: preview(),
  projectionPlan,
})

const actualState = ({ approved = approvedState(), projections = {} } = {}) => ({
  teamSeasonDocumentId: 'team-1__2026',
  teamSeason: JSON.parse(JSON.stringify(approved.finalTeamSeasonPreview)),
  projections: {
    playerDocumentsById: {},
    playerSearchIndexesById: {},
    teamSearchIndex: null,
    league: null,
    clubsById: {},
    clubsMaster: null,
    ...projections,
  },
})

describe('auditClearStatsV2', () => {
  test('does not trust an approved Balance containing the same residue as actual', () => {
    const approved = approvedState()
    approved.finalTeamSeasonPreview.teamBalance.source.inputHash = 'old-roster-hash'
    const actual = actualState({ approved })
    const result = auditClearStatsV2({ approvedState: approved, actualState: actual })

    expect(result.checks).toEqual(expect.arrayContaining([
      expect.objectContaining({ check: 'canonical_stats_absent', status: 'failed' }),
    ]))
  })

  test('passes when Canonical and projections equal the approved expected state', () => {
    const projectionPlan = basePlan()
    projectionPlan.leagueOperation = {
      target: { docId: 'league-1' },
      action: 'update',
      sourceFields: { current: { value: 1 } },
      setFields: { current: { value: 2 } },
      unsetFields: [],
    }
    const approved = approvedState({ projectionPlan })
    const result = auditClearStatsV2({
      approvedState: approved,
      actualState: actualState({
        approved,
        projections: { league: { current: { value: 2 } } },
      }),
    })

    expect(result.status).toBe('passed')
    expect(result.failuresCount).toBe(0)
  })

  test('fails when Roster or Movement differs from the approved preview', () => {
    const approved = approvedState()
    const actual = actualState({ approved })
    actual.teamSeason.teamPlayers[0].rosterStatus = 'removed'
    actual.teamSeason.transfersIn = []

    const result = auditClearStatsV2({ approvedState: approved, actualState: actual })

    expect(result.status).toBe('failed')
    expect(result.checks).toEqual(expect.arrayContaining([
      expect.objectContaining({ check: 'canonical.teamPlayers', status: 'failed' }),
      expect.objectContaining({ check: 'canonical.transfersIn', status: 'failed' }),
    ]))
  })

  test('audits a skipped existing projection when expected fields are present', () => {
    const projectionPlan = basePlan()
    projectionPlan.teamSearchIndexOperation = {
      target: { docId: 'team-index-1' },
      action: 'skip',
      sourceFields: { playersCount: 0 },
      setFields: { playersCount: 0 },
      unsetFields: [],
    }
    const approved = approvedState({ projectionPlan })
    const result = auditClearStatsV2({
      approvedState: approved,
      actualState: actualState({
        approved,
        projections: { teamSearchIndex: { playersCount: 9 } },
      }),
    })

    expect(result.status).toBe('failed')
    expect(result.checks).toContainEqual(expect.objectContaining({
      targetType: 'teamSearchIndex',
      check: 'setFields.playersCount',
      status: 'failed',
    }))
  })

  test('fails when Team SearchIndex matches the plan but not the Canonical Team Season', () => {
    const projectionPlan = basePlan()
    projectionPlan.teamSearchIndexOperation = {
      target: { docId: 'team-index-1' },
      action: 'update',
      sourceFields: {},
      setFields: {
        teamSeasonDocumentId: '',
        playersCount: 0,
        scoutProfilesSummary: { total: 0, profileCounts: {} },
      },
      unsetFields: [],
    }
    const approved = approvedState({ projectionPlan })
    approved.finalTeamSeasonPreview.playersCount = 1
    const result = auditClearStatsV2({
      approvedState: approved,
      actualState: actualState({
        approved,
        projections: {
          teamSearchIndex: {
            teamSeasonDocumentId: '',
            playersCount: 0,
            scoutProfilesSummary: { total: 0, profileCounts: {} },
          },
        },
      }),
    })

    expect(result.status).toBe('failed')
    expect(result.checks).toEqual(expect.arrayContaining([
      expect.objectContaining({
        check: 'canonical.teamSeasonDocumentId',
        status: 'failed',
      }),
      expect.objectContaining({
        check: 'canonical.playersCount',
        status: 'failed',
      }),
    ]))
  })

  test('fails when Player SearchIndex loses its Canonical source link', () => {
    const projectionPlan = basePlan()
    projectionPlan.playerDocumentOperations = [{
      target: { docId: 'external__1' },
      action: 'skip',
      sourceFields: {},
      setFields: {},
      unsetFields: [],
    }]
    projectionPlan.playerSearchIndexOperations = [{
      target: { docId: 'player-index-1' },
      action: 'update',
      sourceFields: {},
      setFields: {
        playerDocumentId: 'external__1',
        seasonStatus: '',
        sourceCollection: 'players',
        sourceDocumentId: '',
        sourceTarget: '',
      },
      unsetFields: [],
    }]
    const approved = approvedState({ projectionPlan })
    approved.finalTeamSeasonPreview.seasonStatus = 'active'
    const result = auditClearStatsV2({
      approvedState: approved,
      actualState: actualState({
        approved,
        projections: {
          playerDocumentsById: {
            'external__1': {
              current: [{ seasonKey: '2026', birthTeamDocumentId: 'team-1' }],
              history: [],
            },
          },
          playerSearchIndexesById: {
            'player-index-1': {
              playerDocumentId: 'external__1',
              seasonStatus: '',
              sourceCollection: 'players',
              sourceDocumentId: '',
              sourceTarget: '',
            },
          },
        },
      }),
    })

    expect(result.status).toBe('failed')
    expect(result.checks).toEqual(expect.arrayContaining([
      expect.objectContaining({ check: 'canonical.seasonStatus', status: 'failed' }),
      expect.objectContaining({ check: 'canonical.sourceDocumentId', status: 'failed' }),
      expect.objectContaining({ check: 'canonical.sourceTarget', status: 'failed' }),
    ]))
  })
})

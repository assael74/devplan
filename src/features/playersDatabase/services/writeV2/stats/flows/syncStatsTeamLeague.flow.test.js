// src/features/playersDatabase/services/writeV2/stats/flows/syncStatsTeamLeague.flow.test.js

import { doc, serverTimestamp, writeBatch } from 'firebase/firestore'

import { SEARCHINDEX_BIRTH_TEAM_SEASON_GENERIC_OBJECT } from '../../../../catalog/firestoreDocuments/searchIndexBirthTeamSeason.catalog.js'
import { buildApprovedStatsState } from '../../../../domain/statsV2/approvedStatsState.builder.js'
import { syncStatsTeamLeagueV2 } from './syncStatsTeamLeague.flow.js'

const batchSet = jest.fn()
const batchUpdate = jest.fn()
const batchCommit = jest.fn()

jest.mock('firebase/firestore', () => ({
  doc: jest.fn((db, collectionName, id) => ({ collectionName, id })),
  serverTimestamp: jest.fn(() => 'SERVER_TIMESTAMP'),
  writeBatch: jest.fn(),
}))

jest.mock('../../../../../../services/firebase/firebase.js', () => ({ db: {} }))

const buildApproved = ({ target = 'current', teamAction = 'update' } = {}) => buildApprovedStatsState({
  identity: { birthTeamDocumentId: 'team-1', seasonKey: '26/27', leagueId: 'league-1' },
  approvedAt: '2026-09-25T12:00:00.000Z',
  canonical: {
    teamRoot: { id: 'team-1' },
    teamSeason: { id: 'team-1__26_27' },
    league: target === 'current'
      ? { id: 'league-1', current: { seasonKey: '26/27', tableRank: [{ birthTeamDocumentId: 'team-1' }] }, history: [] }
      : { id: 'league-1', current: { seasonKey: '27/28', tableRank: [] }, history: [{ seasonKey: '26/27', tableRank: [{ birthTeamDocumentId: 'team-1' }] }] },
  },
  reloadDecisionState: { isComplete: true, missingPlayers: [], resolved: [], unresolved: [] },
  teamSeason: {
    seasonStatus: target === 'history' ? 'completed' : 'active',
    playersCount: 21,
    playerOwnedPatches: [],
    approvedNewParticipants: [],
    localMovementPatch: null,
    teamBalance: { status: 'available' },
    teamScout: { players: [] },
    scoutProfilesSummary: { total: 2 },
    statsLoadState: { status: 'loaded' },
    finalTeamSeasonPreview: { id: 'team-1__26_27', teamPlayers: [] },
  },
  playerSearchIndexStates: [],
  teamSearchIndexPatch: {
    docId: 'birthTeamSeason__league-1__26_27__team-1',
    action: teamAction,
    fields: teamAction === 'create'
      ? {
        ...SEARCHINDEX_BIRTH_TEAM_SEASON_GENERIC_OBJECT,
        id: 'birthTeamSeason__league-1__26_27__team-1',
        entityId: 'birthTeamSeason__league-1__26_27__team-1',
        entityType: 'birthTeamSeason',
        leagueId: 'league-1',
        seasonKey: '26/27',
        birthTeamDocumentId: 'team-1',
      }
      : { playersCount: 21 },
  },
  leagueMetadataPatch: { seasonKey: '26/27', birthTeamDocumentId: 'team-1', fields: { playersCount: 21 } },
  leaguePatch: target === 'current'
    ? { leagueId: 'league-1', seasonKey: '26/27', target, tableRank: [{ birthTeamDocumentId: 'team-1', playersCount: 21 }] }
    : { leagueId: 'league-1', seasonKey: '26/27', target, history: [{ seasonKey: '26/27', tableRank: [{ birthTeamDocumentId: 'team-1', playersCount: 21 }] }] },
  leaguesMasterPatch: { id: 'all', docType: 'leagues_master', leagues: [{ id: 'league-1' }], summary: { total: 1 } },
  clubsMasterPatch: { id: 'all', entries: [] },
})

beforeEach(() => {
  jest.clearAllMocks()
  doc.mockImplementation((db, collectionName, id) => ({ collectionName, id }))
  serverTimestamp.mockReturnValue('SERVER_TIMESTAMP')
  writeBatch.mockReturnValue({ set: batchSet, update: batchUpdate, commit: batchCommit })
  batchCommit.mockResolvedValue(undefined)
})

describe('syncStatsTeamLeagueV2', () => {
  test('writes approved update payloads without reading Firestore', async () => {
    const result = await syncStatsTeamLeagueV2({ approved: buildApproved() })

    expect(batchSet).toHaveBeenCalledTimes(2)
    expect(batchUpdate).toHaveBeenCalledWith(expect.objectContaining({ id: 'league-1' }), {
      'current.tableRank': [{ birthTeamDocumentId: 'team-1', playersCount: 21 }],
      updatedAt: 'SERVER_TIMESTAMP',
    })
    expect(batchCommit).toHaveBeenCalledTimes(1)
    expect(result).toEqual({ teamSearchIndexUpdated: true, leagueUpdated: true, leaguesMasterUpdated: true })
  })

  test('creates a complete Team SearchIndex without merge', async () => {
    await syncStatsTeamLeagueV2({ approved: buildApproved({ teamAction: 'create' }) })

    const teamCall = batchSet.mock.calls.find(call => call[0]?.id === 'birthTeamSeason__league-1__26_27__team-1')
    expect(teamCall[2]).toEqual({ merge: false })
    expect(Object.keys(teamCall[1]).sort()).toEqual(Object.keys({
      ...SEARCHINDEX_BIRTH_TEAM_SEASON_GENERIC_OBJECT,
      updatedAt: 'SERVER_TIMESTAMP',
    }).sort())
  })

  test('rejects Team SearchIndex create payload with mismatched approved identity', async () => {
    const approved = buildApproved({ teamAction: 'create' })
    approved.teamSearchIndexPatch.fields.leagueId = 'wrong-league'

    await expect(syncStatsTeamLeagueV2({ approved })).rejects.toMatchObject({
      code: 'STATS_TEAM_INDEX_CREATE_IDENTITY_INVALID',
    })
  })

  test('writes approved history array atomically for completed season', async () => {
    const approved = buildApproved({ target: 'history' })
    await syncStatsTeamLeagueV2({ approved })

    expect(batchUpdate).toHaveBeenCalledWith(expect.objectContaining({ id: 'league-1' }), {
      history: approved.leaguePatch.history,
      updatedAt: 'SERVER_TIMESTAMP',
    })
  })

  test('rejects fields outside Stats ownership on Team SearchIndex update', async () => {
    const approved = buildApproved()
    approved.teamSearchIndexPatch.fields.rank = 1

    await expect(syncStatsTeamLeagueV2({ approved })).rejects.toMatchObject({
      code: 'STATS_TEAM_INDEX_SCOPE_INVALID',
    })
    expect(batchCommit).not.toHaveBeenCalled()
  })

  test('rejects incomplete Team SearchIndex create payload', async () => {
    const approved = buildApproved({ teamAction: 'create' })
    delete approved.teamSearchIndexPatch.fields.entityType

    await expect(syncStatsTeamLeagueV2({ approved })).rejects.toMatchObject({
      code: 'STATS_TEAM_INDEX_CREATE_INVALID',
    })
    expect(batchCommit).not.toHaveBeenCalled()
  })

  test('rerun sends the same approved business payload again', async () => {
    const approved = buildApproved()
    await syncStatsTeamLeagueV2({ approved })
    const firstUpdates = batchUpdate.mock.calls.map(call => call[1])

    batchSet.mockClear()
    batchUpdate.mockClear()
    batchCommit.mockClear()
    await syncStatsTeamLeagueV2({ approved })

    expect(batchUpdate.mock.calls.map(call => call[1])).toEqual(firstUpdates)
    expect(batchCommit).toHaveBeenCalledTimes(1)
  })
})

// src/features/playersDatabase/services/writeV2/stats/flows/syncStatsPlayerIndexes.flow.test.js

import {
  doc,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore'

import {
  buildApprovedStatsState,
} from '../../../../domain/statsV2/approvedStatsState.builder.js'
import { syncStatsPlayerIndexesV2 } from './syncStatsPlayerIndexes.flow.js'
import { SEARCHINDEX_PLAYER_SEASON_GENERIC_OBJECT } from '../../../../catalog/firestoreDocuments/searchIndexPlayerSeason.catalog.js'

jest.mock('firebase/firestore', () => ({
  doc: jest.fn((db, collectionName, id) => ({ collectionName, id })),
  setDoc: jest.fn(),
  serverTimestamp: jest.fn(() => 'SERVER_TIMESTAMP'),
}))

jest.mock('../../../../../../services/firebase/firebase.js', () => ({ db: {} }))

const buildApproved = ({ playerSearchIndexStates = [] } = {}) => buildApprovedStatsState({
  identity: { birthTeamDocumentId: 'team-1', seasonKey: '2026-2027', leagueId: 'league-1' },
  approvedAt: '2026-09-25T12:00:00.000Z',
  canonical: {
    teamRoot: { id: 'team-1' },
    teamSeason: { id: 'team-1__2026-2027' },
    league: { id: 'league-1', current: {
      seasonKey: '2026-2027',
      seasonStatus: 'active',
      tableRank: [{ teamDocumentId: 'team-1' }],
    },
    history: [] },
  },
  reloadDecisionState: { isComplete: true, missingPlayers: [], resolved: [], unresolved: [] },
  teamSeason: {
    seasonStatus: 'active', playersCount: 1, playerOwnedPatches: [], approvedNewParticipants: [],
    localMovementPatch: null, teamBalance: { status: 'available' }, teamScout: { players: [] },
    scoutProfilesSummary: { total: 0 }, statsLoadState: { status: 'loaded' },
    finalTeamSeasonPreview: { id: 'team-1__2026-2027', teamPlayers: [] },
  },
  playerSearchIndexStates,
  teamSearchIndexPatch: { action: 'update', docId: 'team-index-1', fields: {} },
  leagueMetadataPatch: { fields: {} },
  leaguePatch: {
    leagueId: 'league-1',
    seasonKey: '2026-2027',
    target: 'current',
    tableRank: [{ teamDocumentId: 'team-1' }],
  },
  leaguesMasterPatch: { id: 'all', leagues: [], summary: {} },
  clubsMasterPatch: { id: 'all', baselineClubs: [], touchedClubIds: [], clubs: [] },
})

beforeEach(() => {
  jest.clearAllMocks()

  doc.mockImplementation(
    (db, collectionName, id) => ({ collectionName, id })
  )

  serverTimestamp.mockReturnValue('SERVER_TIMESTAMP')
})

describe('syncStatsPlayerIndexesV2', () => {
  test('writes an approved update patch without reading Firestore', async () => {
    const approved = buildApproved({
      playerSearchIndexStates: [{
        docId: 'player-index-1',
        action: 'update',
        fields: { statsStatus: 'loaded', games: 5 },
      }],
    })

    const result = await syncStatsPlayerIndexesV2({ approved })

    expect(setDoc).toHaveBeenCalledTimes(1)
    expect(setDoc.mock.calls[0][1]).toEqual({
      statsStatus: 'loaded',
      games: 5,
      updatedAt: 'SERVER_TIMESTAMP',
    })
    expect(setDoc.mock.calls[0][2]).toEqual({ merge: true })
    expect(result).toEqual({ totalCount: 1, writtenCount: 1, skippedCount: 0 })
  })

  test('writes a complete approved create payload', async () => {
    const approved = buildApproved({
      playerSearchIndexStates: [{
        docId: 'player-index-1',
        action: 'create',
        fields: {
          ...Object.fromEntries(
            Object.entries(SEARCHINDEX_PLAYER_SEASON_GENERIC_OBJECT)
              .filter(([key]) => !['updatedAt', 'lastWriteAction', 'lastWriteAt'].includes(key))
          ),
          id: 'player-index-1',
          entityType: 'playerSeason',
          entityId: 'player-index-1',
          displayName: 'Player One',
          normalizedDisplayName: 'player one',
          identityKey: 'player-index-1',
          seasonKey: '2026-2027',
          birthTeamDocumentId: 'team-1',
          statsStatus: 'loaded',
        },
      }],
    })

    await syncStatsPlayerIndexesV2({ approved })

    expect(setDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        id: 'player-index-1',
        entityType: 'playerSeason',
        statsStatus: 'loaded',
        updatedAt: 'SERVER_TIMESTAMP',
      }),
      { merge: true }
    )
  })

  test('rejects fields outside Stats ownership for update', async () => {
    const approved = buildApproved({
      playerSearchIndexStates: [{
        docId: 'player-index-1',
        action: 'update',
        fields: { notes: 'forbidden' },
      }],
    })

    await expect(syncStatsPlayerIndexesV2({ approved })).rejects.toMatchObject({
      code: 'STATS_PLAYER_INDEX_SCOPE_INVALID',
    })
    expect(setDoc).not.toHaveBeenCalled()
  })

  test('rejects an incomplete create payload', async () => {
    const approved = buildApproved({
      playerSearchIndexStates: [{
        docId: 'player-index-1',
        action: 'create',
        fields: { statsStatus: 'loaded' },
      }],
    })

    await expect(syncStatsPlayerIndexesV2({ approved })).rejects.toMatchObject({
      code: 'STATS_PLAYER_INDEX_CREATE_INVALID',
    })
    expect(setDoc).not.toHaveBeenCalled()
  })
})

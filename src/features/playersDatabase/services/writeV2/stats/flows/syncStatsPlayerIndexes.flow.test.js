import { getDoc, setDoc } from 'firebase/firestore'

import {
  buildApprovedStatsState,
} from '../../../../domain/statsV2/approvedStatsState.builder.js'
import { syncStatsPlayerIndexesV2 } from './syncStatsPlayerIndexes.flow.js'

jest.mock('firebase/firestore', () => ({
  doc: jest.fn((db, collectionName, id) => ({ collectionName, id })),
  getDoc: jest.fn(),
  setDoc: jest.fn(),
  serverTimestamp: jest.fn(() => 'SERVER_TIMESTAMP'),
}))

jest.mock('../../../../../../services/firebase/firebase.js', () => ({ db: {} }))

const snapshot = ({ exists = true, data = {} } = {}) => ({
  exists: () => exists,
  data: () => data,
})

const buildApproved = ({ playerSearchIndexStates = [] } = {}) => buildApprovedStatsState({
  identity: { birthTeamDocumentId: 'team-1', seasonKey: '2026-2027', leagueId: 'league-1' },
  approvedAt: '2026-09-25T12:00:00.000Z',
  canonical: {
    teamRoot: { id: 'team-1' },
    teamSeason: { id: 'team-1__2026-2027' },
    league: { id: 'league-1', current: { seasonKey: '2026-2027', seasonStatus: 'active' }, history: [] },
  },
  reloadDecisionState: { isComplete: true, missingPlayers: [], resolved: [], unresolved: [] },
  teamSeason: {
    seasonStatus: 'active', playersCount: 1, playerOwnedPatches: [], approvedNewParticipants: [],
    localMovementPatch: null, teamBalance: { status: 'available' }, teamScout: { players: [] },
    scoutProfilesSummary: { total: 0 }, statsLoadState: { status: 'loaded' },
    finalTeamSeasonPreview: { id: 'team-1__2026-2027', teamPlayers: [] },
  },
  playerSearchIndexStates,
  teamSearchIndexPatch: { docId: 'team-index-1', fields: {} },
  leagueMetadataPatch: { fields: {} },
  leaguesMasterPatch: { id: 'all', leagues: [], summary: {} },
})

beforeEach(() => jest.clearAllMocks())

describe('syncStatsPlayerIndexesV2', () => {
  test('writes Approved State fields with merge and preserves external fields', async () => {
    getDoc.mockResolvedValue(snapshot({ data: { notes: 'manual', aliases: ['P1'], statsStatus: 'missing' } }))
    const approved = buildApproved({
      playerSearchIndexStates: [{ docId: 'player-index-1', fields: { statsStatus: 'loaded', games: 5 } }],
    })

    const result = await syncStatsPlayerIndexesV2({ approved })

    expect(setDoc).toHaveBeenCalledTimes(1)
    expect(setDoc.mock.calls[0][1]).toMatchObject({ statsStatus: 'loaded', games: 5 })
    expect(setDoc.mock.calls[0][2]).toEqual({ merge: true })
    expect(result.writtenCount).toBe(1)
  })

  test('skips an identical approved projection', async () => {
    getDoc.mockResolvedValue(snapshot({ data: { statsStatus: 'loaded', games: 5, notes: 'manual' } }))
    const approved = buildApproved({
      playerSearchIndexStates: [{ docId: 'player-index-1', fields: { statsStatus: 'loaded', games: 5 } }],
    })

    const result = await syncStatsPlayerIndexesV2({ approved })

    expect(setDoc).not.toHaveBeenCalled()
    expect(result.skippedCount).toBe(1)
  })

  test('rejects fields outside Stats ownership before writing', async () => {
    getDoc.mockResolvedValue(snapshot({ data: {} }))
    const approved = buildApproved({
      playerSearchIndexStates: [{ docId: 'player-index-1', fields: { notes: 'forbidden' } }],
    })

    await expect(syncStatsPlayerIndexesV2({ approved })).rejects.toMatchObject({
      code: 'STATS_PLAYER_INDEX_SCOPE_INVALID',
    })
    expect(setDoc).not.toHaveBeenCalled()
  })
})

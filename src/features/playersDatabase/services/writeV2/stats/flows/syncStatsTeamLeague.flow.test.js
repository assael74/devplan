import { getDoc, writeBatch } from 'firebase/firestore'

import { buildApprovedStatsState } from '../../../../domain/statsV2/approvedStatsState.builder.js'
import { applyLeagueMetadataPatch, syncStatsTeamLeagueV2 } from './syncStatsTeamLeague.flow.js'

const batchSet = jest.fn()
const batchCommit = jest.fn()

jest.mock('firebase/firestore', () => ({
  doc: jest.fn((db, collectionName, id) => ({ collectionName, id })),
  getDoc: jest.fn(),
  serverTimestamp: jest.fn(() => 'SERVER_TIMESTAMP'),
  writeBatch: jest.fn(),
}))

jest.mock('../../../../../../services/firebase/firebase.js', () => ({ db: {} }))

const snapshot = ({ id = '', exists = true, data = {} } = {}) => ({
  id,
  exists: () => exists,
  data: () => data,
})

const buildApproved = () => buildApprovedStatsState({
  identity: { birthTeamDocumentId: 'team-1', seasonKey: '2026-2027', leagueId: 'league-1' },
  approvedAt: '2026-09-25T12:00:00.000Z',
  canonical: {
    teamRoot: { id: 'team-1' },
    teamSeason: { id: 'team-1__2026-2027' },
    league: { id: 'league-1', current: { seasonKey: '2026-2027', seasonStatus: 'active' }, history: [] },
  },
  reloadDecisionState: { isComplete: true, missingPlayers: [], resolved: [], unresolved: [] },
  teamSeason: {
    seasonStatus: 'active', playersCount: 21, playerOwnedPatches: [], approvedNewParticipants: [],
    localMovementPatch: null, teamBalance: { status: 'available' }, teamScout: { players: [] },
    scoutProfilesSummary: { total: 2 }, statsLoadState: { status: 'loaded' },
    finalTeamSeasonPreview: { id: 'team-1__2026-2027', teamPlayers: [] },
  },
  playerSearchIndexStates: [],
  teamSearchIndexPatch: { docId: 'team-index-1', fields: { playersCount: 21 } },
  leagueMetadataPatch: { fields: { playersCount: 21, hasStats: true } },
  leaguesMasterPatch: {
    id: 'all',
    leagues: [{ id: 'league-1', playersCount: 21 }],
    summary: { playersCount: 21 },
  },
})

beforeEach(() => {
  jest.clearAllMocks()
  writeBatch.mockReturnValue({ set: batchSet, commit: batchCommit })
  batchCommit.mockResolvedValue(undefined)
})

describe('syncStatsTeamLeagueV2 ownership', () => {
  test('patches Stats metadata without changing official League facts', () => {
    const league = {
      id: 'league-1',
      current: {
        seasonKey: '2026-2027',
        tableRank: [{
          birthTeamDocumentId: 'team-1', rank: 2,
          teamStats: { points: 9, goalsFor: 7, goalsAgainst: 4, teamGamePlayed: 4 },
          playersCount: 20, hasStats: false,
        }],
      },
      history: [],
    }
    const approved = {
      identity: { birthTeamDocumentId: 'team-1', seasonKey: '2026-2027' },
      leagueMetadataPatch: { fields: { playersCount: 21, hasStats: true, statsComplete: true } },
    }

    const row = applyLeagueMetadataPatch({ league, approved }).current.tableRank[0]
    expect(row.playersCount).toBe(21)
    expect(row.hasStats).toBe(true)
    expect(row.rank).toBe(2)
    expect(row.teamStats).toEqual(league.current.tableRank[0].teamStats)
  })

  test('rejects official League facts outside Stats ownership', () => {
    expect(() => applyLeagueMetadataPatch({
      league: { current: { seasonKey: '2026-2027', tableRank: [{ birthTeamDocumentId: 'team-1', rank: 2 }] } },
      approved: {
        identity: { birthTeamDocumentId: 'team-1', seasonKey: '2026-2027' },
        leagueMetadataPatch: { fields: { rank: 1 } },
      },
    })).toThrow('outside ownership')
  })

  test('writes Approved State and merges Leagues Master to preserve external fields', async () => {
    const approved = buildApproved()
    getDoc
      .mockResolvedValueOnce(snapshot({ data: { playersCount: 20, externalTeamField: 'keep' } }))
      .mockResolvedValueOnce(snapshot({ id: 'league-1', data: {
        federationMeta: { keep: true },
        current: {
          seasonKey: '2026-2027',
          tableRank: [{
            birthTeamDocumentId: 'team-1', rank: 2,
            teamStats: { points: 9, teamGamePlayed: 4 }, playersCount: 20, hasStats: false,
          }],
        },
        history: [],
      } }))
      .mockResolvedValueOnce(snapshot({ data: {
        id: 'all', docType: 'leagues_master', externalMasterField: { keep: true },
        leagues: [], summary: {},
      } }))

    const result = await syncStatsTeamLeagueV2({ approved })

    expect(batchCommit).toHaveBeenCalledTimes(1)
    const masterCall = batchSet.mock.calls.find(call => call[0]?.id === 'all')
    expect(masterCall).toBeTruthy()
    expect(masterCall[2]).toEqual({ merge: true })
    expect(masterCall[1]).not.toHaveProperty('externalMasterField')
    expect(result).toEqual({ teamSearchIndexUpdated: true, leagueUpdated: true, leaguesMasterUpdated: true })
  })

  test('fails before writing when a required shared document is missing', async () => {
    const approved = buildApproved()
    getDoc
      .mockResolvedValueOnce(snapshot({ data: {} }))
      .mockResolvedValueOnce(snapshot({ id: 'league-1', exists: false }))
      .mockResolvedValueOnce(snapshot({ data: {} }))

    await expect(syncStatsTeamLeagueV2({ approved })).rejects.toMatchObject({ code: 'STATS_LEAGUE_NOT_FOUND' })
    expect(batchSet).not.toHaveBeenCalled()
    expect(batchCommit).not.toHaveBeenCalled()
  })

  test('skips all writes when Approved State already matches canonical documents', async () => {
    const approved = buildApproved()
    getDoc
      .mockResolvedValueOnce(snapshot({ data: { playersCount: 21 } }))
      .mockResolvedValueOnce(snapshot({ id: 'league-1', data: {
        current: {
          seasonKey: '2026-2027',
          tableRank: [{ birthTeamDocumentId: 'team-1', playersCount: 21, hasStats: true }],
        },
        history: [],
      } }))
      .mockResolvedValueOnce(snapshot({ data: {
        id: 'all', docType: 'leagues_master',
        leagues: [{ id: 'league-1', playersCount: 21 }], summary: { playersCount: 21 },
        externalMasterField: 'keep',
      } }))

    const result = await syncStatsTeamLeagueV2({ approved })

    expect(batchCommit).not.toHaveBeenCalled()
    expect(result).toEqual({ teamSearchIndexUpdated: false, leagueUpdated: false, leaguesMasterUpdated: false })
  })
})

// src/features/playersDatabase/services/writeV2/stats/flows/writeStatsCanonical.flow.test.js

import {
  getDoc,
  setDoc,
} from 'firebase/firestore'

import {
  APPROVED_STATS_STATE_VERSION,
  buildApprovedStatsState,
} from '../../../../domain/statsV2/approvedStatsState.builder.js'
import { writeStatsCanonicalV2 } from './writeStatsCanonical.flow.js'

jest.mock('firebase/firestore', () => ({
  doc: jest.fn((db, collectionName, id) => ({ collectionName, id })),
  getDoc: jest.fn(),
  setDoc: jest.fn(),
  serverTimestamp: jest.fn(() => 'SERVER_TIMESTAMP'),
}))

jest.mock('../../../../../../services/firebase/firebase.js', () => ({
  db: {},
}))

const snapshot = ({ exists = true, data = {} } = {}) => ({
  exists: () => exists,
  data: () => data,
})

const approvedState = overrides => ({
  planType: 'approvedStatsState',
  planVersion: APPROVED_STATS_STATE_VERSION,
  identity: {
    birthTeamDocumentId: 'team-1',
    seasonKey: '2026-2027',
  },
  teamSeason: {
    seasonStatus: 'active',
    playersCount: 1,
    playerOwnedPatches: [],
    approvedNewParticipants: [],
    localMovementPatch: null,
    teamBalance: { status: 'available' },
    teamScout: { offense: {}, defense: {} },
    scoutProfilesSummary: { total: 0 },
    statsLoadState: { status: 'loaded' },
  },
  ...overrides,
})

beforeEach(() => {
  jest.clearAllMocks()
})

describe('writeStatsCanonicalV2', () => {
  test('requires an existing Team Root and does not write when it is missing', async () => {
    getDoc.mockResolvedValueOnce(snapshot({ exists: false }))

    await expect(writeStatsCanonicalV2({ approvedState: approvedState() }))
      .rejects.toMatchObject({ code: 'STATS_TEAM_ROOT_NOT_FOUND' })

    expect(setDoc).not.toHaveBeenCalled()
  })

  test('requires an existing Team Season and never creates it', async () => {
    getDoc
      .mockResolvedValueOnce(snapshot())
      .mockResolvedValueOnce(snapshot({ exists: false }))

    await expect(writeStatsCanonicalV2({ approvedState: approvedState() }))
      .rejects.toMatchObject({ code: 'STATS_TEAM_SEASON_NOT_FOUND' })

    expect(setDoc).not.toHaveBeenCalled()
  })

  test('writes only Team Season and preserves fields outside Stats ownership', async () => {
    const currentSeason = {
      seasonStatus: 'active',
      teamPlayers: [{ playerId: 'p1', fullName: 'Player One', rosterStatus: 'regular' }],
      playersCount: 1,
      tableRank: 3,
      teamStats: { teamGamePlayed: 10, goalsFor: 15, goalsAgainst: 8 },
    }

    getDoc
      .mockResolvedValueOnce(snapshot())
      .mockResolvedValueOnce(snapshot({ data: currentSeason }))

    await writeStatsCanonicalV2({ approvedState: approvedState() })

    expect(setDoc).toHaveBeenCalledTimes(1)
    const [writtenRef, writtenData] = setDoc.mock.calls[0]
    expect(writtenRef.collectionName).toBe('dbBirthTeamSeasons')
    expect(writtenData.tableRank).toBe(3)
    expect(writtenData.teamStats).toEqual(currentSeason.teamStats)
  })


  test('writes playersCount from a real buildApprovedStatsState result', async () => {
    const builtState = buildApprovedStatsState({
      identity: {
        birthTeamDocumentId: 'team-1',
        seasonKey: '2026-2027',
        leagueId: 'league-1',
      },
      approvedAt: '2026-09-25T12:00:00.000Z',
      canonical: {
        teamRoot: { id: 'team-1' },
        teamSeason: { id: 'team-1__2026-2027' },
        league: {
          id: 'league-1',
          current: { seasonKey: '2026-2027', seasonStatus: 'active' },
          history: [],
        },
      },
      reloadDecisionState: {
        isComplete: true,
        resolved: [],
        unresolved: [],
      },
      teamSeason: {
        seasonStatus: 'active',
        playersCount: 2,
        playerOwnedPatches: [],
        approvedNewParticipants: [],
        localMovementPatch: null,
        teamBalance: { status: 'available' },
        teamScout: { players: [] },
        scoutProfilesSummary: { total: 0 },
        statsLoadState: { status: 'loaded' },
        finalTeamSeasonPreview: { id: 'team-1__2026-2027', teamPlayers: [] },
      },
      playerSearchIndexStates: [],
      teamSearchIndexPatch: { docId: 'team-index-1', fields: {} },
      leagueMetadataPatch: { fields: {} },
      leaguesMasterPatch: { id: 'all', leagues: [], summary: {} },
    })

    getDoc
      .mockResolvedValueOnce(snapshot())
      .mockResolvedValueOnce(snapshot({
        data: {
          seasonStatus: 'active',
          teamPlayers: [],
          playersCount: 1,
        },
      }))

    await writeStatsCanonicalV2({ approvedState: builtState })

    expect(setDoc).toHaveBeenCalledTimes(1)
    expect(setDoc.mock.calls[0][1].playersCount).toBe(2)
  })

  test('skips an identical approved state without writing', async () => {
    const currentSeason = {
      seasonStatus: 'active',
      teamPlayers: [],
      playersCount: 0,
      teamBalance: { status: 'available' },
      performance: { offense: {}, defense: {} },
      scoutProfilesSummary: { total: 0 },
      statsLoadState: { status: 'loaded' },
    }
    const state = approvedState({
      teamSeason: {
        ...approvedState().teamSeason,
        playersCount: 0,
      },
    })

    getDoc
      .mockResolvedValueOnce(snapshot())
      .mockResolvedValueOnce(snapshot({ data: currentSeason }))

    const result = await writeStatsCanonicalV2({ approvedState: state })

    expect(result.writeSkipped).toBe(true)
    expect(setDoc).not.toHaveBeenCalled()
  })
})

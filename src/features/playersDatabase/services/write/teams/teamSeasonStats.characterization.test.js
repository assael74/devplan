jest.mock('../../../../../services/firebase/firebase.js', () => ({ db: {} }))
jest.mock('firebase/firestore', () => ({
  doc: jest.fn((...args) => ({ id: args.at(-1) })),
  serverTimestamp: jest.fn(() => '__server_timestamp__'),
}))
jest.mock('../../../../../services/firestore/usage/index.js', () => ({
  trackedRunTransaction: jest.fn(),
}))

import { trackedRunTransaction } from '../../../../../services/firestore/usage/index.js'
import {
  buildTeamStatsCanonicalCommit,
  updateTeamSeasonPlayerStats,
} from './teamSeasonStats.js'

const team = {
  birthTeamDocumentId: 'team-a',
  birthTeamId: 'team-a',
  clubId: 'club-a',
  birthTeamSlot: 2,
  birthYear: 2012,
  displayName: 'Team A',
}
const season = {
  seasonId: 'season-25-26',
  seasonKey: '25-26',
  seasonStatus: 'active',
  ageGroupId: 'u14',
  leagueTotalRound: 22,
}
const teamPerformance = {
  teamGamePlayed: 10,
  goalsFor: 20,
  goalsAgainst: 12,
  tableRank: 3,
  tableAttackRank: 2,
  tableDefenseRank: 4,
}
const player = ({ games = 8, rosterStatus = 'regular' } = {}) => ({
  playerId: 'player-1',
  externalPlayerId: '1',
  fullName: 'Player One',
  rosterStatus,
  primaryPosition: 'CB',
  playerStats: { games, goals: 2, minutes: 540 },
})
const snapshot = data => ({
  exists: () => Boolean(data),
  data: () => data,
})

const runWriter = async ({ existingRoot = null, existingSeason = null, previousSeason = null, request = {} } = {}) => {
  const writes = []
  trackedRunTransaction.mockImplementationOnce(async (_db, callback) => callback({
    get: jest.fn()
      .mockResolvedValueOnce(snapshot(existingRoot))
      .mockResolvedValueOnce(snapshot(existingSeason))
      .mockResolvedValueOnce(snapshot(previousSeason)),
    set: jest.fn((ref, data, options) => writes.push({ ref, data, options })),
  }))
  const result = await updateTeamSeasonPlayerStats(request)
  return { result, writes }
}

describe('Team Stats canonical commit characterization', () => {
  beforeEach(() => jest.clearAllMocks())

  test('creates a Team Season and its Team Root index through the canonical builder', async () => {
    const request = {
      season, team, players: [player()], teamPerformance, teamPoints: 21,
      statsProjectionRevision: 'stats-r1',
    }
    const { result, writes } = await runWriter({ request })

    expect(result).toMatchObject({
      createdTeam: true,
      changed: true,
      writeSkipped: false,
      seasonDocument: expect.objectContaining({
        statsProjectionRevision: 'stats-r1',
        scoutIdentityContext: { clubId: 'club-a', birthTeamSlot: 2 },
        teamStats: expect.objectContaining({ points: 21, teamGamePlayed: 10 }),
      }),
    })
    expect(result.teamBalance).toEqual(expect.objectContaining({ snapshotFormat: 'team-balance-summary-v14' }))
    expect(writes).toHaveLength(2)
    expect(writes[0]).toMatchObject({ data: result.seasonData, options: { merge: true } })
    expect(writes[1].data.seasons).toEqual([expect.objectContaining({ seasonKey: '25-26' })])
  })

  test('updates existing Stats while preserving participants, movement and identity context', async () => {
    const baseline = buildTeamStatsCanonicalCommit({
      season, team, players: [player({ rosterStatus: 'left' })], teamPerformance,
      statsProjectionRevision: 'stats-r1',
    }).seasonData
    const root = { id: 'team-a', seasons: [{ seasonKey: '25-26', seasonStatus: 'active' }] }
    const reconcileMovement = jest.fn(() => ({
      transfersIn: [{ movementId: 'in-1' }],
      transfersOut: [{ movementId: 'out-1' }],
      pendingPlayers: [{ pendingId: 'pending-1' }],
    }))
    const request = {
      season, team: { ...team, clubId: '', birthTeamSlot: undefined },
      players: [{ ...player({ games: 12 }), rosterStatus: undefined }], teamPerformance, statsProjectionRevision: 'stats-r2', reconcileMovement,
    }
    const { result, writes } = await runWriter({ existingRoot: root, existingSeason: baseline, request })

    expect(reconcileMovement).toHaveBeenCalledWith(expect.objectContaining({ currentSeason: baseline }))
    expect(result).toMatchObject({ changed: true, writeSkipped: false })
    expect(result.seasonDocument).toMatchObject({
      statsProjectionRevision: 'stats-r2',
      scoutIdentityContext: { clubId: 'club-a', birthTeamSlot: 2 },
      transfersIn: [{ movementId: 'in-1' }],
      transfersOut: [{ movementId: 'out-1' }],
      pendingPlayers: [{ pendingId: 'pending-1' }],
    })
    expect(result.seasonDocument.teamPlayers[0]).toMatchObject({
      rosterStatus: 'left',
      playerStats: expect.objectContaining({ games: 12 }),
    })
    expect(writes).toHaveLength(2)
  })

  test('reports writeSkipped and still maintains the Team Root index', async () => {
    const existingSeason = buildTeamStatsCanonicalCommit({
      season, team, players: [player()], teamPerformance, teamPoints: 21,
      statsProjectionRevision: 'stats-r1',
    }).seasonData
    const existingRoot = { id: 'team-a', seasons: [{ seasonKey: '25-26', seasonStatus: 'active' }] }
    const request = {
      season, team, players: [player()], teamPerformance, teamPoints: 21,
      statsProjectionRevision: 'stats-r1',
    }
    const { result, writes } = await runWriter({ existingRoot, existingSeason, request })

    expect(result).toMatchObject({ changed: false, writeSkipped: true })
    expect(result.seasonDocument).toBe(existingSeason)
    expect(writes).toHaveLength(1)
    expect(writes[0].data.seasons).toEqual([expect.objectContaining({ seasonKey: '25-26' })])
  })
})



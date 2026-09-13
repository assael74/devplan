jest.mock('./clubProjectionSync.js', () => ({
  syncClubProjectionPersistence: jest.fn(),
}))

jest.mock('./clubsMaster.js', () => ({
  syncClubsMasterDocument: jest.fn(),
}))

import { syncClubProjectionPersistence } from './clubProjectionSync.js'
import { syncClubsMasterDocument } from './clubsMaster.js'
import {
  ensureRequiredClubProjectionCompleted,
  syncClubProjectionFromTeamSeason,
  syncClubProjectionsFromLeagueTable,
} from './clubFlowProjection.js'

const league = { id: 'league-a', ageGroupId: 'u15', level: 2 }
const season = { seasonKey: '26/27', seasonStatus: 'active', birthYear: 2012 }
const rows = [
  { clubId: 'club-a', teamId: '1001', points: 8, gamesPlayed: 4 },
  { clubId: 'club-b', teamId: '1002', points: 6, gamesPlayed: 4 },
]

describe('League table Club Master batching', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    syncClubProjectionPersistence.mockResolvedValue({
      results: { club: { changed: true } },
    })
    syncClubsMasterDocument.mockResolvedValue({ changed: true })
  })

  test('reports recovery instead of success when a required Team flow has no clubId', async () => {
    const result = await syncClubProjectionFromTeamSeason({
      league,
      season,
      team: { teamId: '1001' },
      teamSeason: { teamId: '1001' },
      canonicalCommitted: true,
    })

    expect(result).toMatchObject({
      completed: false,
      canonicalCommitted: true,
      projectionsCompleted: false,
      recoveryRequired: true,
      reason: 'MISSING_CLUB_ID',
      skipped: true,
    })
    expect(syncClubProjectionPersistence).not.toHaveBeenCalled()
    expect(syncClubsMasterDocument).not.toHaveBeenCalled()
    expect(() => ensureRequiredClubProjectionCompleted(result)).toThrow('MISSING_CLUB_ID')
  })

  test('allows a retry to complete once the required clubId exists', async () => {
    syncClubProjectionPersistence.mockResolvedValueOnce({
      completed: true,
      canonicalCommitted: true,
      projectionsCompleted: true,
      results: { club: { changed: true } },
    })

    const result = await syncClubProjectionFromTeamSeason({
      league,
      season,
      team: { clubId: 'club-a', teamId: '1001' },
      teamSeason: { teamId: '1001', teamPlayers: [] },
      canonicalCommitted: true,
    })

    expect(ensureRequiredClubProjectionCompleted(result)).toBe(result)
    expect(syncClubProjectionPersistence).toHaveBeenCalledTimes(1)
  })

  test('writes every Club first and syncs Clubs Master once', async () => {
    const result = await syncClubProjectionsFromLeagueTable({
      league,
      season,
      rows,
      canonicalCommitted: true,
    })

    expect(syncClubProjectionPersistence).toHaveBeenCalledTimes(2)
    expect(syncClubProjectionPersistence.mock.calls.map(([input]) => input.syncMaster)).toEqual([
      false,
      false,
    ])
    expect(syncClubsMasterDocument).toHaveBeenCalledTimes(1)
    expect(syncClubsMasterDocument).toHaveBeenCalledWith(expect.objectContaining({
      clubIds: ['club-a', 'club-b'],
    }))
    expect(result).toMatchObject({
      completed: true,
      projectionsCompleted: true,
      failedCount: 0,
    })
  })

  test('does not sync Clubs Master when a Club write fails', async () => {
    syncClubProjectionPersistence
      .mockRejectedValueOnce(new Error('Club write failed'))
      .mockResolvedValueOnce({ results: { club: { changed: true } } })

    const result = await syncClubProjectionsFromLeagueTable({
      league,
      season,
      rows,
      canonicalCommitted: true,
    })

    expect(syncClubsMasterDocument).not.toHaveBeenCalled()
    expect(result).toMatchObject({
      completed: false,
      projectionsCompleted: false,
      recoveryRequired: true,
      failedCount: 1,
    })
  })

  test('does not write Club or Master when a league row is missing a required clubId', async () => {
    const result = await syncClubProjectionsFromLeagueTable({
      league,
      season,
      rows: [{ teamId: '1001', points: 8, gamesPlayed: 4 }],
      canonicalCommitted: true,
    })

    expect(syncClubProjectionPersistence).not.toHaveBeenCalled()
    expect(syncClubsMasterDocument).not.toHaveBeenCalled()
    expect(result).toMatchObject({
      completed: false,
      canonicalCommitted: true,
      projectionsCompleted: false,
      recoveryRequired: true,
      failedCount: 1,
    })
    expect(result.failures[0]).toMatchObject({ reason: 'MISSING_CLUB_ID' })
  })
})

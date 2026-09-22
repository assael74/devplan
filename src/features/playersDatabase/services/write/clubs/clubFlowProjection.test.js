jest.mock('./clubProjectionSync.js', () => ({
  syncClubProjectionPersistence: jest.fn(),
}))

jest.mock('./clubsMaster.js', () => ({
  syncClubsMasterDocument: jest.fn(),
}))

jest.mock('./clubDoc.js', () => ({
  readClubDocument: jest.fn(),
  removeClubDocumentAgeGroupSeasonProjections: jest.fn(),
}))

import { syncClubProjectionPersistence } from './clubProjectionSync.js'
import { syncClubsMasterDocument } from './clubsMaster.js'
import {
  readClubDocument,
  removeClubDocumentAgeGroupSeasonProjections,
} from './clubDoc.js'
import {
  ensureRequiredClubProjectionCompleted,
  findClubIdsWithLeagueProjection,
  reconcileClubProjectionsFromLeagueTable,
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
    readClubDocument.mockResolvedValue({ exists: false, club: null })
    removeClubDocumentAgeGroupSeasonProjections.mockResolvedValue({ changed: true })
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

  test('removes a stale Club projection when a league re-import changes a team slot', async () => {
    readClubDocument.mockResolvedValue({
      exists: true,
      club: {
        ageGroups: [{
          ageGroupId: 'u15',
          seasons: [
            {
              teamId: 'club-a_2012_3',
              seasonKey: '26/27',
              league: { leagueId: 'league-a' },
            },
            {
              teamId: 'club-a_2012_1',
              seasonKey: '26/27',
              league: { leagueId: 'league-a' },
            },
            {
              teamId: 'club-a_2012_2',
              seasonKey: '26/27',
              league: { leagueId: 'league-b' },
            },
          ],
        }],
      },
    })

    const result = await reconcileClubProjectionsFromLeagueTable({
      league,
      season,
      rows: [{ clubId: 'club-a', teamId: 'club-a_2012_1' }],
      lastWriteAction: 'PASTE_LEAGUE_TABLE',
    })

    expect(removeClubDocumentAgeGroupSeasonProjections).toHaveBeenCalledWith({
      clubId: 'club-a',
      removals: [{
        ageGroupId: 'u15',
        seasonKey: '26/27',
        leagueId: 'league-a',
        teamId: 'club-a_2012_3',
      }],
      projectionVersion: 1,
      lastWriteAction: 'PASTE_LEAGUE_TABLE',
    })
    expect(result).toMatchObject({
      checkedClubCount: 1,
      removedProjectionCount: 1,
    })
  })

  test('removes a Club projection when its team is replaced in a league re-import', async () => {
    readClubDocument.mockImplementation(({ clubId }) => (
      clubId === 'club-removed'
        ? Promise.resolve({
            exists: true,
            club: {
              ageGroups: [{
                ageGroupId: 'u15',
                seasons: [{
                  teamId: 'club-removed_2012_1',
                  seasonKey: '26/27',
                  league: { leagueId: 'league-a' },
                }],
              }],
            },
          })
        : Promise.resolve({ exists: false, club: null })
    ))

    const result = await reconcileClubProjectionsFromLeagueTable({
      league,
      season,
      rows: [{ clubId: 'club-current', teamId: 'club-current_2012_1' }],
      removedLeagueEntries: [{
        clubId: 'club-removed',
        teamId: 'club-removed_2012_1',
      }],
      lastWriteAction: 'PASTE_LEAGUE_TABLE',
    })

    expect(removeClubDocumentAgeGroupSeasonProjections).toHaveBeenCalledWith({
      clubId: 'club-removed',
      removals: [{
        ageGroupId: 'u15',
        seasonKey: '26/27',
        leagueId: 'league-a',
        teamId: 'club-removed_2012_1',
      }],
      projectionVersion: 1,
      lastWriteAction: 'PASTE_LEAGUE_TABLE',
    })
    expect(result).toMatchObject({
      checkedClubCount: 2,
      removedProjectionCount: 1,
    })
  })

  test('finds a legacy Club candidate from the compact Clubs Master projection', () => {
    expect(findClubIdsWithLeagueProjection({
      league,
      season,
      clubsMaster: {
        clubs: [{
          clubId: 'club-removed',
          ageGroups: [{
            ageGroupId: 'u15',
            current: [{
              seasonKey: '26/27',
              league: { leagueId: 'league-a' },
            }],
          }],
        }, {
          clubId: 'club-other-league',
          ageGroups: [{
            ageGroupId: 'u15',
            current: [{
              seasonKey: '26/27',
              league: { leagueId: 'league-b' },
            }],
          }],
        }],
      },
    })).toEqual(['club-removed'])
  })
})

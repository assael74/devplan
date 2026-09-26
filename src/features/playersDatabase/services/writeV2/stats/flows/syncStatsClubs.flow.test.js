jest.mock('firebase/firestore', () => ({
  doc: jest.fn((db, collection, id) => ({ collection, id })),
  getDoc: jest.fn(),
  serverTimestamp: jest.fn(() => 'SERVER_TS'),
  writeBatch: jest.fn(),
}))
jest.mock('../../../../../../services/firebase/firebase.js', () => ({ db: {} }))
jest.mock('../../../cache/index.js', () => ({ invalidateClubsMasterDocumentCache: jest.fn() }))

import { getDoc, writeBatch } from 'firebase/firestore'
import { syncStatsClubsV2 } from './syncStatsClubs.flow.js'

const approved = {
  planType: 'approvedStatsState', planVersion: 1,
  clubProjectionPatches: [{ clubId: 'c1', fields: { ageGroups: [{ ageGroupId: 'u15' }] } }],
  clubsMasterPatch: { id: 'all', entries: [{ clubId: 'c1', fields: { name: 'Club 1', ageGroups: [] } }] },
}

describe('syncStatsClubsV2', () => {
  test('preserves non-owned Club and Clubs Master fields', async () => {
    getDoc
      .mockResolvedValueOnce({ exists: () => true, data: () => ({ clubId: 'c1', manualNote: 'keep', ageGroups: [] }) })
      .mockResolvedValueOnce({ exists: () => true, data: () => ({ id: 'all', external: 'keep', clubs: [{ clubId: 'c1', notes: 'keep', name: 'Old' }] }) })
    const set = jest.fn(); const commit = jest.fn().mockResolvedValue()
    writeBatch.mockReturnValue({ set, commit })
    await syncStatsClubsV2({ approvedState: approved })
    expect(set.mock.calls[0][1].manualNote).toBe('keep')
    expect(set.mock.calls[1][1].external).toBe('keep')
    expect(set.mock.calls[1][1].clubs[0].notes).toBe('keep')
  })

  test('rejects fields outside Stats ownership', async () => {
    const invalid = { ...approved, clubProjectionPatches: [{ clubId: 'c1', fields: { manualNote: 'overwrite' } }] }
    getDoc
      .mockResolvedValueOnce({ exists: () => true, data: () => ({ clubId: 'c1' }) })
      .mockResolvedValueOnce({ exists: () => true, data: () => ({ id: 'all', clubs: [] }) })
    await expect(syncStatsClubsV2({ approvedState: invalid })).rejects.toMatchObject({ code: 'STATS_CLUB_OWNERSHIP_INVALID' })
  })

  test('writes both local and counterpart Club patches in the same clubs stage', async () => {
    const twoClubs = {
      ...approved,
      clubProjectionPatches: [
        { clubId: 'c1', fields: { ageGroups: [{ ageGroupId: 'u15' }] } },
        { clubId: 'c2', fields: { ageGroups: [{ ageGroupId: 'u15' }] } },
      ],
      clubsMasterPatch: {
        id: 'all',
        entries: [
          { clubId: 'c1', fields: { name: 'Club 1', ageGroups: [] } },
          { clubId: 'c2', fields: { name: 'Club 2', ageGroups: [] } },
        ],
      },
    }
    getDoc
      .mockResolvedValueOnce({ exists: () => true, data: () => ({ clubId: 'c1', ageGroups: [] }) })
      .mockResolvedValueOnce({ exists: () => true, data: () => ({ clubId: 'c2', ageGroups: [] }) })
      .mockResolvedValueOnce({ exists: () => true, data: () => ({ id: 'all', clubs: [] }) })
    const set = jest.fn(); const commit = jest.fn().mockResolvedValue()
    writeBatch.mockReturnValue({ set, commit })

    await syncStatsClubsV2({ approvedState: twoClubs })

    expect(set).toHaveBeenCalledTimes(3)
    expect(commit).toHaveBeenCalledTimes(1)
  })

  test('does not create a missing counterpart Club', async () => {
    const twoClubs = {
      ...approved,
      clubProjectionPatches: [
        { clubId: 'c1', fields: { ageGroups: [] } },
        { clubId: 'c2', fields: { ageGroups: [] } },
      ],
      clubsMasterPatch: { id: 'all', entries: [] },
    }
    getDoc
      .mockResolvedValueOnce({ exists: () => true, data: () => ({ clubId: 'c1' }) })
      .mockResolvedValueOnce({ exists: () => false, data: () => ({}) })
      .mockResolvedValueOnce({ exists: () => true, data: () => ({ id: 'all', clubs: [] }) })
    const set = jest.fn(); const commit = jest.fn().mockResolvedValue()
    writeBatch.mockReturnValue({ set, commit })

    await expect(syncStatsClubsV2({ approvedState: twoClubs })).rejects.toMatchObject({ code: 'STATS_CLUB_NOT_FOUND' })
    expect(set).not.toHaveBeenCalled()
    expect(commit).not.toHaveBeenCalled()
  })

})

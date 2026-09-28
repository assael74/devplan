// src/features/playersDatabase/services/writeV2/stats/flows/syncStatsClubs.flow.test.js

jest.mock('firebase/firestore', () => ({
  doc: jest.fn((db, collection, id) => ({ collection, id })),
  serverTimestamp: jest.fn(() => 'SERVER_TS'),
  writeBatch: jest.fn(),
}))
jest.mock('../../../../../../services/firebase/firebase.js', () => ({ db: {} }))
jest.mock('../../../cache/index.js', () => ({ invalidateClubsMasterDocumentCache: jest.fn() }))

import { doc, serverTimestamp, writeBatch } from 'firebase/firestore'
import { invalidateClubsMasterDocumentCache } from '../../../cache/index.js'
import { syncStatsClubsV2 } from './syncStatsClubs.flow.js'

const approved = {
  planType: 'approvedStatsState',
  planVersion: 1,
  clubProjectionPatches: [{
    clubId: 'c1',
    fields: { ageGroups: [{ ageGroupId: 'u15', seasons: [] }], competitionPaths: [] },
  }],
  clubsMasterPatch: {
    id: 'all',
    clubs: [{ clubId: 'c1', name: 'Club 1', notes: 'keep' }],
  },
}

describe('syncStatsClubsV2', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    doc.mockImplementation((db, collection, id) => ({ collection, id }))
    serverTimestamp.mockImplementation(() => 'SERVER_TS')
  })

  test('writes approved Club ownership and final Clubs Master without Firestore reads', async () => {
    const update = jest.fn()
    const commit = jest.fn().mockResolvedValue()
    writeBatch.mockReturnValue({ update, commit })

    const result = await syncStatsClubsV2({ approvedState: approved })

    expect(update).toHaveBeenCalledTimes(2)
    expect(update.mock.calls[0]).toEqual([
      { collection: 'dbClubs', id: 'c1' },
      {
        ageGroups: [{ ageGroupId: 'u15', seasons: [] }],
        competitionPaths: [],
        updatedAt: 'SERVER_TS',
      },
    ])
    expect(update.mock.calls[1]).toEqual([
      { collection: 'dbClubsMaster', id: 'all' },
      {
        clubs: [{ clubId: 'c1', name: 'Club 1', notes: 'keep' }],
        updatedAt: 'SERVER_TS',
      },
    ])
    expect(commit).toHaveBeenCalledTimes(1)
    expect(invalidateClubsMasterDocumentCache).toHaveBeenCalledTimes(1)
    expect(result).toEqual({ updatedClubs: 1, masterUpdated: true, skipped: false })
  })

  test('writes local and counterpart Club patches in the same deterministic batch', async () => {
    const update = jest.fn()
    const commit = jest.fn().mockResolvedValue()
    writeBatch.mockReturnValue({ update, commit })
    const state = {
      ...approved,
      clubProjectionPatches: [
        { clubId: 'c1', fields: { ageGroups: [], competitionPaths: [] } },
        { clubId: 'c2', fields: { ageGroups: [], competitionPaths: [] } },
      ],
      clubsMasterPatch: { id: 'all', clubs: [{ clubId: 'c1' }, { clubId: 'c2' }] },
    }

    await syncStatsClubsV2({ approvedState: state })

    expect(update).toHaveBeenCalledTimes(3)
    expect(commit).toHaveBeenCalledTimes(1)
  })

  test('rejects fields outside Stats Club ownership', async () => {
    writeBatch.mockReturnValue({ update: jest.fn(), commit: jest.fn() })
    const invalid = {
      ...approved,
      clubProjectionPatches: [{ clubId: 'c1', fields: { manualNote: 'overwrite' } }],
    }
    await expect(syncStatsClubsV2({ approvedState: invalid }))
      .rejects.toMatchObject({ code: 'STATS_CLUB_OWNERSHIP_INVALID' })
  })

  test('rerun sends the same business payload to the same targets', async () => {
    const firstUpdate = jest.fn()
    writeBatch
      .mockReturnValueOnce({ update: firstUpdate, commit: jest.fn().mockResolvedValue() })
    await syncStatsClubsV2({ approvedState: approved })
    const first = firstUpdate.mock.calls.map(([ref, payload]) => [ref, { ...payload, updatedAt: undefined }])

    const secondUpdate = jest.fn()
    writeBatch
      .mockReturnValueOnce({ update: secondUpdate, commit: jest.fn().mockResolvedValue() })
    await syncStatsClubsV2({ approvedState: approved })
    const second = secondUpdate.mock.calls.map(([ref, payload]) => [ref, { ...payload, updatedAt: undefined }])

    expect(second).toEqual(first)
  })
})

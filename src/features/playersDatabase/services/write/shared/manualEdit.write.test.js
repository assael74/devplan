// src/features/playersDatabase/services/write/shared/manualEdit.write.test.js

import { executeManualEdit } from './manualEdit.write.js'
import { trackedRunTransaction } from '../../../../../services/firestore/usage/index.js'
import { refreshTeamSignalSummaries } from '../signals/refreshTeamSignalSummaries.js'

jest.mock('../signals/refreshTeamSignalSummaries.js', () => ({
  collectSignalClubIds: jest.requireActual('../signals/refreshTeamSignalSummaries.js').collectSignalClubIds,
  refreshTeamSignalSummaries: jest.fn(),
}))

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  doc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
}))

jest.mock('../../../../../services/firebase/firebase.js', () => ({ db: {} }))

jest.mock('../../../../../services/firestore/usage/index.js', () => ({
  trackedGetDocFromServer: jest.fn(),
  trackedGetDocsFromServer: jest.fn(),
  trackedRunTransaction: jest.fn(),
}))

beforeEach(() => jest.clearAllMocks())

test('manual edit creates a missing canonical document and updates its projections atomically', async () => {
  const rootRef = { path: 'playerRoots/player-a' }
  const indexRef = { path: 'playerSearchIndexes/index-a' }
  const transaction = {
    get: jest.fn(async ref => ({ exists: () => ref.path !== rootRef.path })),
    set: jest.fn(),
    update: jest.fn(),
  }
  trackedRunTransaction.mockImplementation(async (_db, callback) => callback(transaction))

  const result = await executeManualEdit({
    refs: [rootRef, indexRef],
    build: ({ get }) => {
      expect(get(rootRef).exists()).toBe(false)
      return [
        { ref: rootRef, document: { identity: { playerId: 'player-a' } } },
        { ref: indexRef, patch: { player: { primaryPosition: 'CB' } } },
      ]
    },
  })

  expect(transaction.set).toHaveBeenCalledWith(rootRef, {
    identity: { playerId: 'player-a' },
  })
  expect(transaction.update).toHaveBeenCalledWith(indexRef, expect.objectContaining({
    player: { primaryPosition: 'CB' },
    updatedAt: expect.any(String),
  }))
  expect(result).toEqual({ completed: true, changedCount: 2 })
})

test('a failed signal refresh rejects the edit and a retry refreshes even when the source already matches', async () => {
  const ref = { path: 'dbBirthTeamSeasons/club_2012_1__2026_2027' }
  const transaction = {
    get: jest.fn(async () => ({ exists: () => true, data: () => ({ identity: { clubId: 'club' } }) })),
    update: jest.fn(),
  }
  trackedRunTransaction.mockImplementation(async (_db, callback) => callback(transaction))
  refreshTeamSignalSummaries.mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce({ teams: 1 })
  const edit = { refs: [ref], refreshSignals: true, build: () => [] }
  await expect(executeManualEdit(edit)).rejects.toThrow('offline')
  await expect(executeManualEdit(edit)).resolves.toEqual({ completed: true, changedCount: 0 })
  expect(refreshTeamSignalSummaries).toHaveBeenLastCalledWith({ clubIds: ['club'] })
})

test('explicit refresh scope uses fresh canonical input on every retry and never expands from Center documents', async () => {
  const leagueRef = { path: 'dbLeagues/league' }
  const centerRef = { path: 'dbLeaguesCenter/all' }
  let clubId = 'club-a'
  const transaction = {
    get: async ref => ({
      exists: () => true,
      data: () => ref.path === leagueRef.path ? { clubId } : { clubId: 'unrelated-club' },
    }),
    update: jest.fn(),
  }
  trackedRunTransaction.mockImplementation(async (_db, callback) => callback(transaction))
  refreshTeamSignalSummaries.mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce({ teams: 1 })
  const edit = {
    refs: [leagueRef, centerRef], refreshSignals: true, build: () => [],
    getSignalRefresh: ({ get }) => ({
      clubIds: [get(leagueRef).data().clubId], scope: { seasonId: '2026_2027', birthYear: 2012 },
    }),
  }
  await expect(executeManualEdit(edit)).rejects.toThrow('offline')
  clubId = 'club-b'
  await expect(executeManualEdit(edit)).resolves.toEqual({ completed: true, changedCount: 0 })
  expect(refreshTeamSignalSummaries.mock.calls.map(([input]) => input)).toEqual([
    { clubIds: ['club-a'], scope: { seasonId: '2026_2027', birthYear: 2012 } },
    { clubIds: ['club-b'], scope: { seasonId: '2026_2027', birthYear: 2012 } },
  ])
  expect(transaction.update).not.toHaveBeenCalled()
})

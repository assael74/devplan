// src/features/playersDatabase/services/writeV2/league/clear/writeClearLeagueTeamsStep.test.js

import { doc, serverTimestamp, updateDoc } from 'firebase/firestore'
import { invalidateLeagueImportCacheV2 } from '../invalidateLeagueImportCache.js'
import { readClearLeagueDocument } from './readClearLeagueTeams.js'
import { trackedRunTransaction } from '../../../../../../services/firestore/usage/index.js'
import { writeClearLeagueTeamsStep } from './writeClearLeagueTeamsStep.js'

jest.mock('firebase/firestore', () => ({
  doc: jest.fn((db, collection, id) => ({ collection, id })),
  serverTimestamp: jest.fn(() => 'SERVER_TIME'), updateDoc: jest.fn(), deleteDoc: jest.fn(),
}))
jest.mock('../../../../../../services/firebase/firebase.js', () => ({ db: {} }))
jest.mock('../../../../../../services/firestore/usage/index.js', () => ({ trackedRunTransaction: jest.fn() }))
jest.mock('../../../../domain/leagueV2/clear/clearLeagueTeamsApprovedState.builder.js', () => ({ assertClearLeagueApprovedState: jest.fn() }))
jest.mock('./readClearLeagueTeams.js', () => ({
  CLEAR_LEAGUE_COLLECTIONS: { league: 'leagues', team: 'seasons', root: 'roots' }, readClearLeagueDocument: jest.fn(),
}))

jest.mock('../invalidateLeagueImportCache.js', () => ({ invalidateLeagueImportCacheV2: jest.fn() }))

const operation = {
  kind: 'team', docId: 'season-1', before: { clean: true }, rootId: 'root-1',
  rootBefore: { seasons: [{ seasonDocumentId: 'season-1' }, { seasonDocumentId: 'other' }], name: 'keep' },
  rootPatch: { seasons: [{ seasonDocumentId: 'other' }] },
}
const snapshot = data => ({ exists: () => data !== null, data: () => data })

beforeEach(() => {
  jest.resetAllMocks()
  doc.mockImplementation((db, collection, id) => ({ collection, id }))
  serverTimestamp.mockReturnValue('SERVER_TIME')
})

test('deletes the season and changes the Root in the same transaction', async () => {
  const transaction = {
    get: jest.fn().mockResolvedValueOnce(snapshot(operation.before)).mockResolvedValueOnce(snapshot(operation.rootBefore)),
    delete: jest.fn(), update: jest.fn(),
  }
  trackedRunTransaction.mockImplementation((db, callback) => callback(transaction))
  await expect(writeClearLeagueTeamsStep({ approvedState: { operations: [operation] }, step: 'team' })).resolves.toEqual({ written: 1, skipped: 0, failed: 0 })
  expect(trackedRunTransaction).toHaveBeenCalledTimes(1)
  expect(invalidateLeagueImportCacheV2).toHaveBeenCalledTimes(1)
  expect(transaction.delete).toHaveBeenCalledWith({ collection: 'seasons', id: 'season-1' })
  expect(transaction.update).toHaveBeenCalledWith({ collection: 'roots', id: 'root-1' }, {
    seasons: [{ seasonDocumentId: 'other' }], updatedAt: 'SERVER_TIME',
  })
})

test('missing Root blocks before either mutation and reports the failed target', async () => {
  const transaction = {
    get: jest.fn().mockResolvedValueOnce(snapshot(operation.before)).mockResolvedValueOnce(snapshot(null)),
    delete: jest.fn(), update: jest.fn(),
  }
  trackedRunTransaction.mockImplementation((db, callback) => callback(transaction))
  await expect(writeClearLeagueTeamsStep({ approvedState: { operations: [operation] }, step: 'team' })).rejects.toMatchObject({
    failedTarget: { targetType: 'team', documentId: 'season-1' },
  })
  expect(transaction.delete).not.toHaveBeenCalled()
  expect(transaction.update).not.toHaveBeenCalled()
})

test('a committed pair is skipped on a repeated call', async () => {
  const transaction = {
    get: jest.fn().mockResolvedValueOnce(snapshot(null)).mockResolvedValueOnce(snapshot({ ...operation.rootBefore, ...operation.rootPatch })),
    delete: jest.fn(), update: jest.fn(),
  }
  trackedRunTransaction.mockImplementation((db, callback) => callback(transaction))
  await expect(writeClearLeagueTeamsStep({ approvedState: { operations: [operation] }, step: 'team' })).resolves.toEqual({ written: 0, skipped: 1, failed: 0 })
  expect(transaction.delete).not.toHaveBeenCalled()
})

 test('invalidates caches even if a write rejects with an unknown server outcome', async () => {
  readClearLeagueDocument.mockResolvedValue({ current: { tableRank: [] } })
  updateDoc.mockRejectedValue(new Error('connection lost'))
  const approvedState = {
    identity: { leagueId: 'league-1', seasonKey: '26/27' },
    operations: [{ kind: 'league', docId: 'league-1', before: { current: { tableRank: [] } }, patch: { current: { tableRank: null } } }, operation],
  }
  await expect(writeClearLeagueTeamsStep({ approvedState, step: 'league' })).rejects.toThrow('connection lost')
  expect(invalidateLeagueImportCacheV2).toHaveBeenCalledWith({
    leagueId: 'league-1', seasonKey: '26/27', rows: [{ birthTeamDocumentId: 'root-1' }],
  })
})

test('an unchanged fresh canonical season skips the Firestore write', async () => {
  const before = { current: { seasonKey: '26/27', tableRank: null } }
  readClearLeagueDocument.mockResolvedValue(before)
  const approvedState = { operations: [{ kind: 'league', docId: 'league', before, patch: before }] }
  await expect(writeClearLeagueTeamsStep({ approvedState, step: 'league' })).resolves.toEqual({ written: 0, skipped: 1, failed: 0 })
  expect(updateDoc).not.toHaveBeenCalled()
})

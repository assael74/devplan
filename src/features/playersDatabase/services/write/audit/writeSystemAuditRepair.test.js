// src/features/playersDatabase/services/write/audit/writeSystemAuditRepair.test.js

import { doc } from 'firebase/firestore'
import { trackedRunTransaction } from '../../../../../services/firestore/usage/index.js'
import { writeSystemAuditRepair } from './writeSystemAuditRepair.js'

jest.mock('firebase/firestore', () => ({ doc: jest.fn((_db, collection, id) => `${collection}/${id}`) }))
jest.mock('../../../../../services/firebase/firebase.js', () => ({ db: {} }))
jest.mock('../../../../../services/firestore/usage/index.js', () => ({ trackedRunTransaction: jest.fn() }))

const change = { target: 'teamRoots', documentId: 'a', before: null, after: { identity: { teamId: 'a' } } }
let transaction

beforeEach(() => {
  jest.clearAllMocks()
  doc.mockImplementation((_db, collection, id) => `${collection}/${id}`)
  transaction = { get: jest.fn().mockResolvedValue({ exists: () => false }), set: jest.fn(), delete: jest.fn() }
  trackedRunTransaction.mockImplementation((_db, callback) => callback(transaction))
})

test('checks absence of a destination before creating it', async () => {
  await writeSystemAuditRepair({ changes: [change] })
  expect(transaction.get).toHaveBeenCalledTimes(1)
  expect(transaction.set).toHaveBeenCalledWith(expect.any(String), change.after)
  expect(transaction.get.mock.invocationCallOrder[0]).toBeLessThan(transaction.set.mock.invocationCallOrder[0])
})

test('rejects an existing destination without any write', async () => {
  transaction.get.mockResolvedValue({ exists: () => true, data: () => ({ notes: 'keep' }) })
  await expect(writeSystemAuditRepair({ changes: [change] })).rejects.toThrow('השתנו')
  expect(transaction.set).not.toHaveBeenCalled()
})

test('checks source guards before staging writes and rejects stale source content', async () => {
  transaction.get.mockResolvedValue({ exists: () => true, data: () => ({ clubId: 'changed' }) })
  await expect(writeSystemAuditRepair({
    changes: [change], guards: [{ target: 'clubProfiles', documentId: 'club', before: { clubId: 'club' } }],
  })).rejects.toThrow('השתנו')
  expect(transaction.set).not.toHaveBeenCalled()
})

test('moves a document with a checked source and an absent destination in one transaction', async () => {
  const source = { identity: { teamId: 'a' }, notes: 'preserved' }
  transaction.get.mockResolvedValueOnce({ exists: () => true, data: () => source }).mockResolvedValueOnce({ exists: () => false })
  await writeSystemAuditRepair({ changes: [
    { target: 'teamRoots', documentId: 'wrong', before: source, after: null },
    { ...change, after: source },
  ] })
  expect(trackedRunTransaction).toHaveBeenCalledTimes(1)
  expect(transaction.delete).toHaveBeenCalledTimes(1)
  expect(transaction.set).toHaveBeenCalledWith(expect.any(String), source)
  expect(transaction.get.mock.invocationCallOrder[1]).toBeLessThan(transaction.delete.mock.invocationCallOrder[0])
})

test('rejects receipt collections, duplicate operations and oversized repairs', async () => {
  await expect(writeSystemAuditRepair({ changes: [{ ...change, target: 'writeActions' }] })).rejects.toThrow('יעד')
  await expect(writeSystemAuditRepair({ changes: [change, change] })).rejects.toThrow('כפול')
  await expect(writeSystemAuditRepair({ changes: Array(401).fill(change) })).rejects.toThrow('400')
  expect(trackedRunTransaction).not.toHaveBeenCalled()
})

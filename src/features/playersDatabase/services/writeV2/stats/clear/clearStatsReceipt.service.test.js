// src/features/playersDatabase/services/writeV2/stats/clear/clearStatsReceipt.service.test.js

import { doc, serverTimestamp, updateDoc } from 'firebase/firestore'
import { trackedGetDocsFromServer } from '../../../../../../services/firestore/usage/index.js'
import {
  closeWriteActionReceiptV2,
  createWriteActionReceiptV2,
  reportWriteActionCanonicalStatusV2,
  saveWriteActionAuditSummaryV2,
} from '../../receipt/index.js'
import {
  closeClearStatsReceiptV2,
  createClearStatsReceiptV2,
  reportClearStatsCanonicalV2,
  saveClearStatsAuditSummaryV2,
} from './clearStatsReceipt.service.js'

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(), query: jest.fn(), where: jest.fn(),
  doc: jest.fn((db, collectionName, id) => ({ collectionName, id })),
  serverTimestamp: jest.fn(() => 'SERVER_TIMESTAMP'),
  updateDoc: jest.fn(),
}))

jest.mock('../../../../../../services/firebase/firebase.js', () => ({ db: {} }))
jest.mock('../../../../../../services/firestore/usage/index.js', () => ({ trackedGetDocsFromServer: jest.fn() }))

jest.mock('../../receipt/index.js', () => ({
  WRITE_ACTION_V2_CANONICAL_STATUS: {
    REPORTED: 'reported',
    FAILED_OR_UNKNOWN: 'failed_or_unknown',
  },
  WRITE_ACTION_V2_FLOW_TYPE: { STATS: 'stats' },
  closeWriteActionReceiptV2: jest.fn(),
  createWriteActionReceiptV2: jest.fn(),
  reportWriteActionCanonicalStatusV2: jest.fn(),
  saveWriteActionAuditSummaryV2: jest.fn(),
}))

beforeEach(() => {
  jest.clearAllMocks()
  doc.mockImplementation((db, collectionName, id) => ({ collectionName, id }))
  serverTimestamp.mockReturnValue('SERVER_TIMESTAMP')
  createWriteActionReceiptV2.mockResolvedValue('receipt-1')
  trackedGetDocsFromServer.mockResolvedValue({ docs: [] })
})

test('creates the complete Clear Stats receipt atomically without a metadata update', async () => {
  const receiptId = await createClearStatsReceiptV2({
    approvedState: {
      approvedAt: '2026-09-27T12:00:00.000Z',
      currentStatsState: 'present',
      identity: {
        birthTeamDocumentId: 'team-1',
        seasonKey: '2026',
        leagueId: 'league-1',
      },
    },
    startedAt: '2026-09-27T12:01:00.000Z',
  })

  expect(receiptId).toBe('receipt-1')
  expect(createWriteActionReceiptV2).toHaveBeenCalledWith({
    flowType: 'stats',
    operationType: 'clear',
    label: 'CLEAR_STATS',
    auditTarget: {
      birthTeamDocumentId: 'team-1',
      seasonKey: '2026',
    },
    initialFields: expect.objectContaining({
      executionStatus: 'running',
      failedStep: null,
      canonicalWrite: { status: 'pending', writeSkipped: false, playersAffected: 0 },
    }),
  })
  expect(updateDoc).not.toHaveBeenCalled()
})

const approvedState = {
  identity: { birthTeamDocumentId: 'team-1', seasonKey: '26/27', leagueId: 'league-1' },
  approvedAt: '2026-09-28T00:00:00Z', currentStatsState: 'absent',
}
const openRow = (id, canonicalStatus = 'reported') => ({
  id,
  data: () => ({
    status: 'open', operationType: 'clear', canonicalStatus,
    auditTarget: { birthTeamDocumentId: 'team-1', seasonKey: '2026_2027' },
  }),
})

test.each(['pending', 'reported', 'failed_or_unknown'])('reuses %s receipt and clears attempt metadata only', async canonicalStatus => {
  trackedGetDocsFromServer.mockResolvedValue({ docs: [openRow('original', canonicalStatus)] })
  await expect(createClearStatsReceiptV2({ approvedState, startedAt: 'now' })).resolves.toBe('original')
  expect(createWriteActionReceiptV2).not.toHaveBeenCalled()
  expect(updateDoc.mock.calls[0][1]).toEqual(expect.objectContaining({
    executionStatus: 'running', failedStep: null, error: null, lastAuditSummary: null,
  }))
  expect(updateDoc.mock.calls[0][1]).not.toHaveProperty('canonicalStatus')
  expect(updateDoc.mock.calls[0][1]).not.toHaveProperty('status')
})

test('duplicate open receipts block without writes', async () => {
  trackedGetDocsFromServer.mockResolvedValue({ docs: [openRow('one'), openRow('two')] })
  await expect(createClearStatsReceiptV2({ approvedState, startedAt: 'now' })).rejects.toMatchObject({ code: 'CLEAR_STATS_MULTIPLE_OPEN_RECEIPTS' })
  expect(createWriteActionReceiptV2).not.toHaveBeenCalled()
  expect(updateDoc).not.toHaveBeenCalled()
})

test('failed server lookup does not create a replacement', async () => {
  trackedGetDocsFromServer.mockRejectedValueOnce(new Error('offline'))
  await expect(createClearStatsReceiptV2({ approvedState, startedAt: 'now' })).rejects.toThrow('offline')
  expect(createWriteActionReceiptV2).not.toHaveBeenCalled()
})

test('recognizes a legacy partial Clear Stats receipt by label', async () => {
  const row = openRow('legacy')
  trackedGetDocsFromServer.mockResolvedValue({ docs: [{
    id: row.id, data: () => ({ ...row.data(), operationType: undefined, label: 'CLEAR_STATS' }),
  }] })
  await expect(createClearStatsReceiptV2({ approvedState, startedAt: 'now' })).resolves.toBe('legacy')
  expect(createWriteActionReceiptV2).not.toHaveBeenCalled()
})

test('failed reset of the existing receipt cannot create a replacement', async () => {
  trackedGetDocsFromServer.mockResolvedValue({ docs: [openRow('original')] })
  updateDoc.mockRejectedValueOnce(new Error('offline'))
  await expect(createClearStatsReceiptV2({ approvedState, startedAt: 'now' })).rejects.toThrow('offline')
  expect(createWriteActionReceiptV2).not.toHaveBeenCalled()
})

test('closed receipts do not block creating a receipt', async () => {
  const row = openRow('old').data()
  trackedGetDocsFromServer.mockResolvedValue({ docs: [
    { id: 'closed', data: () => ({ ...row, status: 'closed' }) },
  ] })
  await expect(createClearStatsReceiptV2({ approvedState, startedAt: 'now' })).resolves.toBe('receipt-1')
  expect(createWriteActionReceiptV2).toHaveBeenCalledTimes(1)
  expect(updateDoc).not.toHaveBeenCalled()
})

test.each([
  { birthTeamDocumentId: 'other', seasonKey: '26/27' },
  { birthTeamDocumentId: 'team-1', seasonKey: '25/26' },
])('an open Stats receipt for another target does not block: %j', async auditTarget => {
  trackedGetDocsFromServer.mockResolvedValue({ docs: [{
    id: 'foreign', data: () => ({ ...openRow('foreign').data(), auditTarget }),
  }] })
  await expect(createClearStatsReceiptV2({ approvedState, startedAt: 'now' })).resolves.toBe('receipt-1')
  expect(createWriteActionReceiptV2).toHaveBeenCalledTimes(1)
  expect(updateDoc).not.toHaveBeenCalled()
})

test('an open Stats import for the same target does not block and is not reused', async () => {
  trackedGetDocsFromServer.mockResolvedValue({ docs: [{
    id: 'import', data: () => ({ ...openRow('import').data(), operationType: 'import' }),
  }] })
  await expect(createClearStatsReceiptV2({ approvedState, startedAt: 'now' })).resolves.toBe('receipt-1')
  expect(createWriteActionReceiptV2).toHaveBeenCalledTimes(1)
  expect(updateDoc).not.toHaveBeenCalled()
})

test('matching and foreign open Stats receipts reuse only the matching receipt', async () => {
  trackedGetDocsFromServer.mockResolvedValue({ docs: [openRow('matching'), {
    id: 'foreign', data: () => ({ ...openRow('foreign').data(), auditTarget: { birthTeamDocumentId: 'other', seasonKey: '25/26' } }),
  }] })
  await expect(createClearStatsReceiptV2({ approvedState, startedAt: 'now' })).resolves.toBe('matching')
  expect(createWriteActionReceiptV2).not.toHaveBeenCalled()
  expect(updateDoc).toHaveBeenCalledTimes(1)
})

test('uses the shared canonical, Audit and close lifecycle', async () => {
  await reportClearStatsCanonicalV2({ receiptId: 'receipt-1', succeeded: true })
  await saveClearStatsAuditSummaryV2({
    receiptId: 'receipt-1',
    ranAt: '2026-09-27T12:02:00.000Z',
    audit: {
      failuresCount: 0,
      checks: [
        { targetType: 'teamSeason' },
        { targetType: 'teamSeason' },
        { targetType: 'league' },
      ],
    },
  })
  await closeClearStatsReceiptV2({ receiptId: 'receipt-1' })

  expect(reportWriteActionCanonicalStatusV2).toHaveBeenCalledWith({
    receiptId: 'receipt-1',
    canonicalStatus: 'reported',
  })
  expect(saveWriteActionAuditSummaryV2).toHaveBeenCalledWith({
    receiptId: 'receipt-1',
    ranAt: '2026-09-27T12:02:00.000Z',
    coverage: 'complete',
    findingsCount: 0,
    checkedDomains: ['teamSeason', 'league'],
  })
  expect(closeWriteActionReceiptV2).toHaveBeenCalledWith({ receiptId: 'receipt-1' })
})

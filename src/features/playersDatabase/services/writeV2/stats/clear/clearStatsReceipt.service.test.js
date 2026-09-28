// src/features/playersDatabase/services/writeV2/stats/clear/clearStatsReceipt.service.test.js

import { doc, serverTimestamp, updateDoc } from 'firebase/firestore'
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
  doc: jest.fn((db, collectionName, id) => ({ collectionName, id })),
  serverTimestamp: jest.fn(() => 'SERVER_TIMESTAMP'),
  updateDoc: jest.fn(),
}))

jest.mock('../../../../../../services/firebase/firebase.js', () => ({ db: {} }))

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
})

test('creates an open shared Receipt V2 before adding CLEAR_STATS metadata', async () => {
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
    label: 'CLEAR_STATS',
    auditTarget: {
      birthTeamDocumentId: 'team-1',
      seasonKey: '2026',
    },
  })
  expect(updateDoc).toHaveBeenCalledWith(
    expect.objectContaining({ id: 'receipt-1' }),
    expect.objectContaining({
      operationType: 'clear',
      executionStatus: 'running',
      updatedAt: 'SERVER_TIMESTAMP',
    })
  )
  expect(updateDoc.mock.calls[0][1]).not.toHaveProperty('status')
  expect(updateDoc.mock.calls[0][1].projectionWrite).toEqual({
    writesAttempted: 0,
    writesCompleted: 0,
    writesSkipped: 0,
    targets: [],
    failedTarget: null,
  })
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

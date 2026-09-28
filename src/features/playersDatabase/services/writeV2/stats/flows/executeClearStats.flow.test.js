// src/features/playersDatabase/services/writeV2/stats/flows/executeClearStats.flow.test.js

import { auditClearStatsV2 } from '../../../auditV2/stats/clear/auditClearStatsV2.js'
import { readClearStatsActualV2 } from '../../../auditV2/stats/clear/readClearStatsActual.js'
import {
  closeClearStatsReceiptV2,
  createClearStatsReceiptV2,
  patchClearStatsReceiptV2,
  reportClearStatsCanonicalV2,
  saveClearStatsAuditSummaryV2,
} from '../clear/clearStatsReceipt.service.js'
import { writeClearStatsProjectionsV2 } from '../clear/clearStatsProjectionWriters.js'
import { executeClearStatsV2 } from './executeClearStats.flow.js'
import { writeClearStatsCanonicalV2 } from './writeClearStatsCanonical.flow.js'

jest.mock('../../../auditV2/stats/clear/auditClearStatsV2.js', () => ({
  auditClearStatsV2: jest.fn(),
}))
jest.mock('../../../auditV2/stats/clear/readClearStatsActual.js', () => ({
  readClearStatsActualV2: jest.fn(),
}))
jest.mock('../clear/clearStatsReceipt.service.js', () => ({
  closeClearStatsReceiptV2: jest.fn(),
  createClearStatsReceiptV2: jest.fn(),
  patchClearStatsReceiptV2: jest.fn(),
  reportClearStatsCanonicalV2: jest.fn(),
  saveClearStatsAuditSummaryV2: jest.fn(),
}))
jest.mock('../clear/clearStatsProjectionWriters.js', () => ({
  writeClearStatsProjectionsV2: jest.fn(),
}))
jest.mock('./writeClearStatsCanonical.flow.js', () => ({
  writeClearStatsCanonicalV2: jest.fn(),
}))

const approvedState = {
  stateType: 'clearStatsApprovedState',
  stateVersion: 1,
  flowType: 'stats',
  operationType: 'clear',
  label: 'CLEAR_STATS',
  approvedAt: '2026-09-27T12:00:00.000Z',
  currentStatsState: 'present',
  identity: {
    birthTeamDocumentId: 'team-1',
    seasonKey: '2026',
    leagueId: 'league-1',
    clubId: 'club-1',
  },
  projectionPlan: { planVersion: 1 },
}

const canonicalWrite = { writeSkipped: false, playersAffected: 1 }
const projectionWrite = {
  writesAttempted: 1,
  writesCompleted: 1,
  writesSkipped: 0,
  targets: [],
}

beforeEach(() => {
  jest.clearAllMocks()
  createClearStatsReceiptV2.mockResolvedValue('receipt-1')
  closeClearStatsReceiptV2.mockResolvedValue(undefined)
  patchClearStatsReceiptV2.mockResolvedValue(undefined)
  reportClearStatsCanonicalV2.mockResolvedValue(undefined)
  saveClearStatsAuditSummaryV2.mockResolvedValue(undefined)
  writeClearStatsCanonicalV2.mockResolvedValue(canonicalWrite)
  writeClearStatsProjectionsV2.mockResolvedValue(projectionWrite)
  readClearStatsActualV2.mockResolvedValue({})
  auditClearStatsV2.mockReturnValue({ status: 'passed', failuresCount: 0, checks: [] })
})

describe('executeClearStatsV2', () => {
  test('runs Receipt, Canonical, Projections and Audit in order', async () => {
    const events = []
    createClearStatsReceiptV2.mockImplementation(async () => { events.push('receipt'); return 'receipt-1' })
    writeClearStatsCanonicalV2.mockImplementation(async () => { events.push('canonical'); return canonicalWrite })
    writeClearStatsProjectionsV2.mockImplementation(async () => { events.push('projections'); return projectionWrite })
    readClearStatsActualV2.mockImplementation(async () => { events.push('read'); return {} })
    auditClearStatsV2.mockImplementation(() => { events.push('audit'); return { status: 'passed', failuresCount: 0 } })

    const result = await executeClearStatsV2({
      approvedState,
      now: '2026-09-27T13:00:00.000Z',
    })

    expect(events).toEqual(['receipt', 'canonical', 'projections', 'read', 'audit'])
    expect(writeClearStatsProjectionsV2).toHaveBeenCalledWith({ approvedState })
    expect(result.status).toBe('succeeded')
    expect(reportClearStatsCanonicalV2).toHaveBeenCalledWith({
      receiptId: 'receipt-1',
      succeeded: true,
    })
    expect(saveClearStatsAuditSummaryV2).toHaveBeenCalledWith(expect.objectContaining({
      receiptId: 'receipt-1',
      audit: expect.objectContaining({ status: 'passed', failuresCount: 0 }),
    }))
    expect(closeClearStatsReceiptV2).toHaveBeenCalledWith({ receiptId: 'receipt-1' })
    expect(patchClearStatsReceiptV2).toHaveBeenLastCalledWith(expect.objectContaining({
      receiptId: 'receipt-1',
      patch: expect.objectContaining({ executionStatus: 'succeeded', failedStep: null }),
    }))
  })

  test('stores partial projection progress and stops before Audit', async () => {
    const error = Object.assign(new Error('source mismatch'), {
      code: 'CLEAR_STATS_PROJECTION_SOURCE_MISMATCH',
      projectionWrite: {
        writesAttempted: 2,
        writesCompleted: 1,
        writesSkipped: 0,
        targets: [{ docId: 'player-1', status: 'written' }],
      },
    })
    writeClearStatsProjectionsV2.mockRejectedValue(error)

    await expect(executeClearStatsV2({ approvedState }))
      .rejects.toBe(error)

    expect(readClearStatsActualV2).not.toHaveBeenCalled()
    expect(patchClearStatsReceiptV2).toHaveBeenLastCalledWith(expect.objectContaining({
      patch: expect.objectContaining({
        executionStatus: 'failed',
        failedStep: 'projections',
        projectionWrite: error.projectionWrite,
      }),
    }))
  })

  test('stores the exact Audit failure count', async () => {
    const audit = { status: 'failed', failuresCount: 3, checks: [] }
    auditClearStatsV2.mockReturnValue(audit)

    await expect(executeClearStatsV2({ approvedState }))
      .rejects.toMatchObject({
        code: 'CLEAR_STATS_AUDIT_FAILED',
        failedStep: 'audit',
        receiptId: 'receipt-1',
        canonicalWrite,
        projectionWrite,
        audit,
      })

    expect(patchClearStatsReceiptV2).toHaveBeenLastCalledWith(expect.objectContaining({
      patch: expect.objectContaining({
        executionStatus: 'failed',
        failedStep: 'audit',
        audit: { status: 'failed', failuresCount: 3 },
      }),
    }))
    expect(saveClearStatsAuditSummaryV2).toHaveBeenCalledWith(expect.objectContaining({
      receiptId: 'receipt-1',
      audit,
    }))
    expect(closeClearStatsReceiptV2).not.toHaveBeenCalled()
  })

  test('preserves the original failure when the failed Receipt patch also fails', async () => {
    const original = Object.assign(new Error('canonical failed'), { code: 'CANONICAL_FAILED' })
    writeClearStatsCanonicalV2.mockRejectedValue(original)
    patchClearStatsReceiptV2.mockRejectedValue(Object.assign(new Error('receipt failed'), { code: 'RECEIPT_FAILED' }))

    await expect(executeClearStatsV2({ approvedState }))
      .rejects.toBe(original)

    expect(original.receiptUpdateError).toEqual({
      code: 'RECEIPT_FAILED',
      message: 'receipt failed',
    })
    expect(reportClearStatsCanonicalV2).toHaveBeenCalledWith({
      receiptId: 'receipt-1',
      succeeded: false,
    })
  })

  test('identifies a Receipt creation failure before any data write', async () => {
    const error = Object.assign(new Error('receipt create failed'), {
      code: 'RECEIPT_CREATE_FAILED',
    })
    createClearStatsReceiptV2.mockRejectedValue(error)

    await expect(executeClearStatsV2({ approvedState })).rejects.toMatchObject({
      code: 'RECEIPT_CREATE_FAILED',
      failedStep: 'receipt',
      receiptId: '',
      canonicalWrite: null,
      projectionWrite: null,
    })
    expect(writeClearStatsCanonicalV2).not.toHaveBeenCalled()
    expect(patchClearStatsReceiptV2).not.toHaveBeenCalled()
  })
})

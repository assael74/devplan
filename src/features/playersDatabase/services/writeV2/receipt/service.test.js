// src/features/playersDatabase/services/writeV2/receipt/service.test.js

jest.mock('./repository.js', () => ({
  createWriteActionReceiptReferenceV2: jest.fn(),
  patchWriteActionReceiptV2: jest.fn(),
  readWriteActionReceiptV2: jest.fn(),
  writeWriteActionReceiptV2: jest.fn(),
}))

import {
  createWriteActionReceiptReferenceV2,
  writeWriteActionReceiptV2,
  patchWriteActionReceiptV2,
  readWriteActionReceiptV2,
} from './repository.js'
import {
  createWriteActionReceiptV2,
  closeWriteActionReceiptV2,
  reopenWriteActionReceiptV2,
  persistWriteActionAuditResultV2,
} from './service.js'

describe('WriteAction V2 receipt lifecycle', () => {
  test('general Audit closes Clear Roster and marks execution succeeded in the same patch', async () => {
    readWriteActionReceiptV2.mockResolvedValue({
      flowType: 'roster', operationType: 'clear', status: 'open', executionStatus: 'failed',
    })
    await persistWriteActionAuditResultV2({
      receiptId: 'roster-clear', audit: { coverage: { complete: true, coveredTargets: [] }, findings: [] },
    })
    expect(patchWriteActionReceiptV2).toHaveBeenLastCalledWith({
      receiptId: 'roster-clear', patch: {
        status: 'closed', executionStatus: 'succeeded', lastCompletedStep: 'audit',
        failedStep: null, failedTarget: null,
      },
    })
  })

  test('creates a clear receipt with operationType in its initial write', async () => {
    createWriteActionReceiptReferenceV2.mockReturnValue({ id: 'clear-1' })
    await createWriteActionReceiptV2({
      flowType: 'roster', operationType: 'clear', label: 'מחיקת סגל',
      auditTarget: { birthTeamDocumentId: 'team-1', seasonKey: '26/27' },
      initialFields: { executionStatus: 'running', failedStep: null },
    })
    expect(writeWriteActionReceiptV2).toHaveBeenCalledWith(expect.objectContaining({
      receipt: expect.objectContaining({ operationType: 'clear', status: 'open', executionStatus: 'running', failedStep: null }),
    }))
    expect(patchWriteActionReceiptV2).not.toHaveBeenCalled()
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('does not close before Audit ran', async () => {
    readWriteActionReceiptV2.mockResolvedValue({
      id: 'receipt-1',
      status: 'open',
      canonicalStatus: 'reported',
      lastAuditSummary: null,
    })

    await expect(closeWriteActionReceiptV2({
      receiptId: 'receipt-1',
    })).rejects.toThrow('cannot close before Audit')

    expect(patchWriteActionReceiptV2).not.toHaveBeenCalled()
  })

  test('does not close a receipt with partial Audit coverage', async () => {
    readWriteActionReceiptV2.mockResolvedValue({
      id: 'receipt-1',
      status: 'open',
      canonicalStatus: 'reported',
      lastAuditSummary: {
        coverage: 'partial',
        findingsCount: 0,
      },
    })

    await expect(closeWriteActionReceiptV2({
      receiptId: 'receipt-1',
    })).rejects.toThrow(
      'WriteAction V2 receipt cannot close before a complete Audit'
    )

    expect(patchWriteActionReceiptV2).not.toHaveBeenCalled()
  })

  test('closes a receipt after a complete clean Audit', async () => {
    readWriteActionReceiptV2.mockResolvedValue({
      id: 'receipt-1',
      status: 'open',
      canonicalStatus: 'reported',
      lastAuditSummary: {
        coverage: 'complete',
        findingsCount: 0,
      },
    })
    patchWriteActionReceiptV2.mockResolvedValue('receipt-1')

    await expect(closeWriteActionReceiptV2({
      receiptId: 'receipt-1',
    })).resolves.toBe('receipt-1')

    expect(patchWriteActionReceiptV2).toHaveBeenCalledWith({
      receiptId: 'receipt-1',
      patch: {
        status: 'closed',
      },
    })
  })

  test('does not close a receipt while Audit findings remain', async () => {
    readWriteActionReceiptV2.mockResolvedValue({
      id: 'receipt-1',
      status: 'open',
      lastAuditSummary: {
        coverage: 'complete',
        findingsCount: 2,
      },
    })

    await expect(closeWriteActionReceiptV2({
      receiptId: 'receipt-1',
    })).rejects.toThrow(
      'WriteAction V2 receipt cannot close while Audit findings remain'
    )

    expect(patchWriteActionReceiptV2).not.toHaveBeenCalled()
  })


  test('reopens a closed receipt', async () => {
    readWriteActionReceiptV2.mockResolvedValue({
      id: 'receipt-1',
      status: 'closed',
    })
    patchWriteActionReceiptV2.mockResolvedValue('receipt-1')

    await expect(reopenWriteActionReceiptV2({
      receiptId: 'receipt-1',
    })).resolves.toBe('receipt-1')

    expect(patchWriteActionReceiptV2).toHaveBeenCalledWith({
      receiptId: 'receipt-1',
      patch: { status: 'open' },
    })
  })

  test('does not reopen an open receipt', async () => {
    readWriteActionReceiptV2.mockResolvedValue({
      id: 'receipt-1',
      status: 'open',
    })

    await expect(reopenWriteActionReceiptV2({
      receiptId: 'receipt-1',
    })).rejects.toThrow('Only a closed WriteAction V2 receipt can be reopened')

    expect(patchWriteActionReceiptV2).not.toHaveBeenCalled()
  })


  test('shared Audit lifecycle closes an open receipt after a complete clean Audit', async () => {
    readWriteActionReceiptV2
      .mockResolvedValueOnce({ id: 'receipt-1', status: 'open' })
      .mockResolvedValueOnce({
        id: 'receipt-1',
        status: 'open',
        lastAuditSummary: { coverage: 'complete', findingsCount: 0 },
      })
    patchWriteActionReceiptV2.mockResolvedValue('receipt-1')

    await expect(persistWriteActionAuditResultV2({
      receiptId: 'receipt-1',
      audit: { coverage: { complete: true }, findings: [] },
      ranAt: '2026-09-26T00:00:00.000Z',
    })).resolves.toBe('closed')
  })

  test('shared Audit lifecycle reopens a closed receipt when a Finding exists', async () => {
    readWriteActionReceiptV2
      .mockResolvedValueOnce({ id: 'receipt-1', status: 'closed' })
      .mockResolvedValueOnce({ id: 'receipt-1', status: 'closed' })
    patchWriteActionReceiptV2.mockResolvedValue('receipt-1')

    await expect(persistWriteActionAuditResultV2({
      receiptId: 'receipt-1',
      audit: {
        coverage: { complete: true },
        findings: [{ target: 'teamSearchIndex' }],
      },
    })).resolves.toBe('open')

    expect(patchWriteActionReceiptV2).toHaveBeenLastCalledWith({
      receiptId: 'receipt-1',
      patch: {
        status: 'open',
      },
    })
  })

})

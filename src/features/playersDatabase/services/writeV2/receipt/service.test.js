// src/features/playersDatabase/services/writeV2/receipt/service.test.js

jest.mock('./repository.js', () => ({
  createWriteActionReceiptReferenceV2: jest.fn(),
  patchWriteActionReceiptV2: jest.fn(),
  readWriteActionReceiptV2: jest.fn(),
  writeWriteActionReceiptV2: jest.fn(),
}))

import {
  patchWriteActionReceiptV2,
  readWriteActionReceiptV2,
} from './repository.js'
import {
  closeWriteActionReceiptV2,
} from './service.js'

describe('WriteAction V2 receipt lifecycle', () => {
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

  test('requires explicit approval to close with partial Audit', async () => {
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
    })).rejects.toThrow('partial Audit requires explicit approval')

    expect(patchWriteActionReceiptV2).not.toHaveBeenCalled()
  })

  test('allows explicitly approved close with partial Audit', async () => {
    readWriteActionReceiptV2.mockResolvedValue({
      id: 'receipt-1',
      status: 'open',
      canonicalStatus: 'reported',
      lastAuditSummary: {
        coverage: 'partial',
        findingsCount: 0,
      },
    })
    patchWriteActionReceiptV2.mockResolvedValue('receipt-1')

    await expect(closeWriteActionReceiptV2({
      receiptId: 'receipt-1',
      allowPartialAudit: true,
    })).resolves.toBe('receipt-1')

    expect(patchWriteActionReceiptV2).toHaveBeenCalledWith({
      receiptId: 'receipt-1',
      patch: {
        status: 'closed',
      },
    })
  })


})

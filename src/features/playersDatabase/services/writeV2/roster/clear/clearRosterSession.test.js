// src/features/playersDatabase/services/writeV2/roster/clear/clearRosterSession.test.js

import { startClearRosterSession, reportClearRosterStep, reportClearRosterFailure, finishClearRosterSession } from './clearRosterSession.js'
import { createWriteActionReceiptV2, persistWriteActionAuditResultV2 } from '../../receipt/index.js'
import { patchWriteActionReceiptV2 } from '../../receipt/repository.js'
import { auditRosterAbsentState } from '../../../auditV2/roster/auditRosterAbsentState.js'
import { sameClearRosterValue } from '../../../../domain/rosterV2/clear/clearRosterPlan.builder.js'
import { readClearRosterEligibility } from './readClearRoster.js'
import { findOpenClearRosterReceipt } from './clearRosterPrerequisites.js'

jest.mock('../../receipt/index.js', () => ({ createWriteActionReceiptV2: jest.fn(), persistWriteActionAuditResultV2: jest.fn() }))
jest.mock('../../receipt/repository.js', () => ({ patchWriteActionReceiptV2: jest.fn() }))
jest.mock('../../../../domain/rosterV2/clear/clearRosterApprovedState.builder.js', () => ({ assertClearRosterApprovedState: jest.fn() }))
jest.mock('../../../auditV2/roster/auditRosterAbsentState.js', () => ({ auditRosterAbsentState: jest.fn() }))
jest.mock('../invalidateRosterImportCache.js', () => ({ invalidateRosterImportCacheV2: jest.fn() }))
jest.mock('./readClearRoster.js', () => ({ readClearRosterEligibility: jest.fn(), readClearRosterDocument: jest.fn() }))
jest.mock('./clearRosterPrerequisites.js', () => ({ findOpenClearRosterReceipt: jest.fn() }))
jest.mock('../../../../domain/rosterV2/clear/clearRosterPlan.builder.js', () => ({ sameClearRosterValue: jest.fn(), applyClearRosterChanges: jest.fn() }))

const approved = { identity: { birthTeamDocumentId: 'team-1', seasonKey: '26_27', leagueId: 'league-1' } }

beforeEach(() => {
  jest.resetAllMocks()
  readClearRosterEligibility.mockResolvedValue(true)
  findOpenClearRosterReceipt.mockResolvedValue('')
  createWriteActionReceiptV2.mockResolvedValue('new-receipt')
})

test('fresh approval resumes the existing operation without creating a replacement receipt', async () => {
  findOpenClearRosterReceipt.mockResolvedValue('original-receipt')
  await expect(startClearRosterSession(approved)).resolves.toBe('original-receipt')
  expect(findOpenClearRosterReceipt).toHaveBeenCalledWith(approved.identity)
  expect(createWriteActionReceiptV2).not.toHaveBeenCalled()
  expect(patchWriteActionReceiptV2).toHaveBeenCalledWith({
    receiptId: 'original-receipt',
    patch: {
      executionStatus: 'running', lastCompletedStep: null, failedStep: null,
      failedTarget: null, lastAuditAt: null, lastAuditSummary: null,
    },
  })
})

test('records each completed step and leaves the last completed step intact on failure', async () => {
  await reportClearRosterStep('original', 'playerIndex')
  await reportClearRosterFailure('original', 'league', { failedTarget: 'league-1' })
  expect(patchWriteActionReceiptV2.mock.calls[0][0].patch).toEqual({
    executionStatus: 'running', lastCompletedStep: 'playerIndex', failedStep: null, failedTarget: null,
  })
  expect(patchWriteActionReceiptV2.mock.calls[1][0].patch).toEqual({
    status: 'open', executionStatus: 'failed', failedStep: 'league',
    failedTarget: { targetType: 'league', documentId: 'league-1' },
  })
})

test('receipt progress failure identifies the receipt target', async () => {
  patchWriteActionReceiptV2.mockRejectedValueOnce(new Error('offline'))
  await expect(reportClearRosterStep('original', 'league')).rejects.toMatchObject({
    failedTarget: { targetType: 'writeAction', documentId: 'original' },
  })
})

test.each([true, false])('fresh audit result is passed to the shared receipt finalizer (clean=%s)', async clean => {
  sameClearRosterValue.mockReturnValue(true)
  auditRosterAbsentState.mockResolvedValue({
    coverage: { complete: clean, coveredTargets: [] }, findings: [], summary: {},
  })
  await finishClearRosterSession({
    receiptId: 'original', approvedState: { ...approved, sources: { teamRoot: {} }, operations: [] },
  })
  expect(auditRosterAbsentState).toHaveBeenCalledWith(approved.identity)
  expect(persistWriteActionAuditResultV2).toHaveBeenCalledWith({
    receiptId: 'original',
    audit: expect.objectContaining({ result: clean ? 'clean' : 'partial' }),
  })
})

test('creates a clear receipt only when no matching operation is open', async () => {
  await expect(startClearRosterSession(approved)).resolves.toBe('new-receipt')
  expect(createWriteActionReceiptV2).toHaveBeenCalledWith(expect.objectContaining({
    flowType: 'roster', operationType: 'clear', auditTarget: approved.identity,
  }))
})

test('a failed receipt read never creates a replacement operation', async () => {
  findOpenClearRosterReceipt.mockRejectedValue(new Error('offline'))
  await expect(startClearRosterSession(approved)).rejects.toThrow('offline')
  expect(createWriteActionReceiptV2).not.toHaveBeenCalled()
})

test('resuming still requires fresh Stats eligibility', async () => {
  readClearRosterEligibility.mockResolvedValue(false)
  await expect(startClearRosterSession(approved)).rejects.toThrow('Stats prerequisite')
  expect(findOpenClearRosterReceipt).not.toHaveBeenCalled()
  expect(createWriteActionReceiptV2).not.toHaveBeenCalled()
})

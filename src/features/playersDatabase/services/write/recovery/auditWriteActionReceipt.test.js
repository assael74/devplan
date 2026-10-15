// src/features/playersDatabase/services/write/recovery/auditWriteActionReceipt.test.js

import { auditWriteActionReceipt } from './auditWriteActionReceipt.js'
import { auditLeague } from '../../audit/league/index.js'
import { auditRoster } from '../../audit/roster/index.js'
import { auditStats } from '../../audit/stats/index.js'
import { completeWriteActionAudit, getWriteActionReceipt } from '../receipt/index.js'
import {
  prepareRosterReceiptState,
  prepareStatsReceiptState,
  requireWriteActionReceiptTarget,
} from './repairWriteAction.js'

jest.mock('../../audit/league/index.js', () => ({ auditLeague: jest.fn() }))
jest.mock('../../audit/roster/index.js', () => ({ auditRoster: jest.fn() }))
jest.mock('../../audit/stats/index.js', () => ({ auditStats: jest.fn() }))
jest.mock('../receipt/index.js', () => ({ getWriteActionReceipt: jest.fn(), completeWriteActionAudit: jest.fn() }))
jest.mock('./repairWriteAction.js', () => ({
  prepareRosterReceiptState: jest.fn(),
  prepareStatsReceiptState: jest.fn(),
  requireWriteActionReceiptTarget: jest.fn(receipt => receipt.target),
}))

const target = {
  leagueId: 'league-1',
  teamId: 'team-1',
  seasonId: '2026-27',
}

beforeEach(() => {
  jest.clearAllMocks()
  requireWriteActionReceiptTarget.mockImplementation(receipt => receipt.target)
})

describe('auditWriteActionReceipt', () => {
  test('checks a closed League receipt from fresh canonical sources', async () => {
    const audit = { result: 'CLEAN', findings: [], coverage: { complete: true } }
    getWriteActionReceipt.mockResolvedValue({
      id: 'receipt-1',
      actionType: 'leagueOpen',
      status: 'closed',
      progress: { completedByStage: {} },
      target,
    })
    auditLeague.mockResolvedValue(audit)

    await expect(auditWriteActionReceipt({ receiptId: 'receipt-1' })).resolves.toEqual({
      receiptId: 'receipt-1',
      actionType: 'leagueOpen',
      audit,
    })
    expect(auditLeague).toHaveBeenCalledWith(target)
  })

  test('rebuilds a fresh approved state before checking a Roster receipt', async () => {
    const approvedState = { kind: 'rosterProjectionRepair' }
    const audit = { status: 'FINDINGS', findings: [{ target: 'playerSeason' }] }
    getWriteActionReceipt.mockResolvedValue({ id: 'receipt-2', actionType: 'rosterLoad', target })
    prepareRosterReceiptState.mockResolvedValue(approvedState)
    auditRoster.mockResolvedValue(audit)

    await auditWriteActionReceipt({ receiptId: 'receipt-2' })

    expect(prepareRosterReceiptState).toHaveBeenCalledWith({ actionType: 'rosterLoad', target })
    expect(auditRoster).toHaveBeenCalledWith({ approvedState })
  })

  test('checks a Stats receipt without changing receipt progress', async () => {
    const statsState = { kind: 'statsProjectionRepair' }
    const statsAudit = { status: 'CLEAN', findings: [] }
    getWriteActionReceipt.mockResolvedValue({ id: 'receipt-3', actionType: 'statsClear', target })
    prepareStatsReceiptState.mockResolvedValue(statsState)
    auditStats.mockResolvedValue(statsAudit)

    await auditWriteActionReceipt({ receiptId: 'receipt-3' })

    expect(auditStats).toHaveBeenCalledWith({ ...target, approvedState: statsState })
  })
})

 test.each([
  ['confirmed', 'failed', true, [], 1],
  ['confirmed', 'failed', false, [], 0],
  ['confirmed', 'failed', true, [{ type: 'mismatch' }], 0],
  ['pending', 'failed', true, [], 0],
  ['confirmed', 'running', true, [], 0],
 ])('closes only clean, complete and confirmed receipts: %s %s %s', async (canonicalOutcome, executionStatus, complete, findings, calls) => {
   const audit = { coverage: { complete }, findings }
   getWriteActionReceipt.mockResolvedValue({ id: 'receipt-close', actionType: 'statsLoad', status: 'open', canonicalOutcome, executionStatus, target })
   auditStats.mockResolvedValue(audit)
   await auditWriteActionReceipt({ receiptId: 'receipt-close', closeIfClean: true })
   expect(completeWriteActionAudit).toHaveBeenCalledTimes(calls)
   if (calls) expect(completeWriteActionAudit).toHaveBeenCalledWith({ receiptId: 'receipt-close', audit })
 })

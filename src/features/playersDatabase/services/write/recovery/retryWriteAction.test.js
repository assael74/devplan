// src/features/playersDatabase/services/write/recovery/retryWriteAction.test.js

import { bootstrapClubs } from '../club/index.js'
import { clearLeagueTeams, deleteLeagueSeason } from '../league/index.js'
import { clearRoster, prepareRosterClear } from '../roster/index.js'
import { clearStats } from '../stats/index.js'
import { getWriteActionReceipt } from '../receipt/index.js'
import { repairWriteActionReceipt } from './repairWriteAction.js'
import {
  canRetryWriteActionFromReceipt,
  retryWriteActionReceipt,
} from './retryWriteAction.js'

jest.mock('../club/index.js', () => ({ bootstrapClubs: jest.fn() }))
jest.mock('../league/index.js', () => ({
  clearLeagueTeams: jest.fn(),
  deleteLeagueSeason: jest.fn(),
}))
jest.mock('../roster/index.js', () => ({
  clearRoster: jest.fn(),
  prepareRosterClear: jest.fn(),
}))
jest.mock('../stats/index.js', () => ({ clearStats: jest.fn() }))
jest.mock('../receipt/index.js', () => ({ getWriteActionReceipt: jest.fn() }))
jest.mock('./repairWriteAction.js', () => ({ repairWriteActionReceipt: jest.fn() }))

const target = {
  domain: 'stats',
  leagueId: 'league-a',
  teamId: 'club-a_2011_1',
  seasonId: '2026_2027',
}

const receipt = actionType => ({
  id: 'receipt-1',
  actionType,
  status: 'open',
  target,
  display: { teamName: 'קבוצה א' },
})

describe('retryWriteActionReceipt', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    clearLeagueTeams.mockResolvedValue({ receiptId: 'receipt-1' })
    deleteLeagueSeason.mockResolvedValue({ receiptId: 'receipt-1' })
    clearRoster.mockResolvedValue({ receiptId: 'receipt-1' })
    prepareRosterClear.mockResolvedValue({ actionType: 'rosterClear' })
    clearStats.mockResolvedValue({ receiptId: 'receipt-1' })
    bootstrapClubs.mockResolvedValue({ receiptId: 'receipt-1' })
    repairWriteActionReceipt.mockResolvedValue({ receiptId: 'receipt-1' })
  })

  test.each([
    ['leagueTeamsClear', clearLeagueTeams],
    ['leagueSeasonDelete', deleteLeagueSeason],
    ['statsClear', clearStats],
  ])('retries %s through its canonical owner with fresh target input', async (actionType, action) => {
    getWriteActionReceipt.mockResolvedValue(receipt(actionType))

    await retryWriteActionReceipt({ receiptId: 'receipt-1' })

    expect(action).toHaveBeenCalledWith({
      input: target,
      receiptId: 'receipt-1',
      display: { teamName: 'קבוצה א' },
    })
  })

  test('prepares Roster Clear once before retrying when no Approved State was supplied', async () => {
    getWriteActionReceipt.mockResolvedValue(receipt('rosterClear'))

    await retryWriteActionReceipt({ receiptId: 'receipt-1' })

    expect(prepareRosterClear).toHaveBeenCalledWith({ input: target })
    expect(clearRoster).toHaveBeenCalledWith({
      approvedState: { actionType: 'rosterClear' },
      receiptId: 'receipt-1',
      display: { teamName: 'קבוצה א' },
    })
  })

  test('reuses the Roster Clear Approved State supplied by the modal', async () => {
    const approvedState = { actionType: 'rosterClear', teamId: target.teamId }
    getWriteActionReceipt.mockResolvedValue(receipt('rosterClear'))

    await retryWriteActionReceipt({ receiptId: 'receipt-1', approvedState })

    expect(prepareRosterClear).not.toHaveBeenCalled()
    expect(clearRoster).toHaveBeenCalledWith({
      approvedState,
      receiptId: 'receipt-1',
      display: { teamName: 'קבוצה א' },
    })
  })

  test('retries club bootstrap through the canonical owner', async () => {
    getWriteActionReceipt.mockResolvedValue(receipt('clubsBootstrap'))

    await retryWriteActionReceipt({ receiptId: 'receipt-1' })

    expect(bootstrapClubs).toHaveBeenCalledWith({ receiptId: 'receipt-1' })
  })

  test('repairs projections without reopening a receipt after canonical confirmation', async () => {
    getWriteActionReceipt.mockResolvedValue({
      ...receipt('rosterClear'),
      canonicalOutcome: 'confirmed',
      recoveryRequired: true,
    })

    await retryWriteActionReceipt({ receiptId: 'receipt-1' })

    expect(repairWriteActionReceipt).toHaveBeenCalledWith({ receiptId: 'receipt-1' })
    expect(clearRoster).not.toHaveBeenCalled()
  })

  test('does not claim that a load receipt can be retried without its original input', async () => {
    getWriteActionReceipt.mockResolvedValue(receipt('statsLoad'))

    await expect(retryWriteActionReceipt({ receiptId: 'receipt-1' }))
      .rejects.toThrow('הפעולה דורשת את קלט הטעינה המקורי')
    expect(canRetryWriteActionFromReceipt('statsLoad')).toBe(false)
  })

  test('does not retry a closed receipt', async () => {
    getWriteActionReceipt.mockResolvedValue({
      ...receipt('statsClear'),
      status: 'closed',
    })

    await expect(retryWriteActionReceipt({ receiptId: 'receipt-1' }))
      .rejects.toThrow('אפשר לנסות שוב רק קבלה פתוחה')
  })
})

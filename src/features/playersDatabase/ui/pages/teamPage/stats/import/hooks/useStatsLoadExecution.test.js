// src/features/playersDatabase/ui/pages/teamPage/stats/import/hooks/useStatsLoadExecution.test.js

import { act, renderHook, waitFor } from '@testing-library/react'

import useStatsLoadExecution from './useStatsLoadExecution.js'

const mockLoadStats = jest.fn()
const mockGetWriteActionReceipt = jest.fn()
const mockRepairWriteActionReceipt = jest.fn()

jest.mock('../../../../../../services/write/stats/index.js', () => ({
  loadStats: (...args) => mockLoadStats(...args),
}))
jest.mock('../../../../../../services/write/receipt/index.js', () => ({
  getWriteActionReceipt: (...args) => mockGetWriteActionReceipt(...args),
}))
jest.mock('../../../../../../services/write/recovery/index.js', () => ({
  repairWriteActionReceipt: (...args) => mockRepairWriteActionReceipt(...args),
}))

describe('useStatsLoadExecution active Stats Load retry', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('waits for an explicit execution and retries with a fresh Approved State before canonical confirmation', async () => {
    const input = {
      leagueId: 'league-1',
      teamId: 'club-1_2011_1',
      seasonId: '2026_2027',
      incomingPlayers: [{ playerId: 'player__2011__100' }],
      reloadDecisions: {},
      updatedAt: '2026-10-02T10:00:00.000Z',
    }
    const approvedState = {
      actionType: 'statsLoad',
      teamSeasonDocumentId: 'team-season-1',
      canonicalTeamSeason: { stats: { statsLoadState: { updatedAt: input.updatedAt } } },
    }
    const freshApprovedState = {
      ...approvedState,
      canonicalTeamSeason: { stats: { statsLoadState: { updatedAt: '2026-10-02T10:01:00.000Z' } } },
    }
    const prepareFreshApprovedState = jest.fn(async () => freshApprovedState)
    mockGetWriteActionReceipt.mockResolvedValue({ canonicalOutcome: 'failed_or_unknown' })
    mockLoadStats
      .mockResolvedValueOnce({
        receiptId: 'receipt-1',
        status: 'open',
        executionStatus: 'failed',
        audit: { coverage: { complete: true }, findings: [{ target: 'teamSeason' }] },
      })
      .mockResolvedValueOnce({
        receiptId: 'receipt-1',
        status: 'closed',
        executionStatus: 'succeeded',
        audit: { coverage: { complete: true }, findings: [] },
      })

    const { result } = renderHook(() => useStatsLoadExecution({
      actionInput: input,
      approvedState,
      prepareFreshApprovedState,
    }))
    await waitFor(() => expect(result.current.status).toBe('ready'))
    expect(mockLoadStats).not.toHaveBeenCalled()

    await act(async () => {
      await result.current.execute()
    })
    await waitFor(() => expect(result.current.status).toBe('audit_failed'))

    await act(async () => {
      await result.current.retry()
    })

    expect(mockLoadStats).toHaveBeenNthCalledWith(1, expect.objectContaining({
      approvedState,
      receiptId: '',
      display: {},
    }))
    expect(mockLoadStats).toHaveBeenNthCalledWith(2, expect.objectContaining({
      approvedState: freshApprovedState,
      receiptId: 'receipt-1',
      display: {},
    }))
    expect(prepareFreshApprovedState).toHaveBeenCalledTimes(1)
    expect(mockRepairWriteActionReceipt).not.toHaveBeenCalled()
    expect(result.current.status).toBe('success')
  })
})

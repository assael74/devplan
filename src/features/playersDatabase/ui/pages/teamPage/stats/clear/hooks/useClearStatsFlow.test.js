// src/features/playersDatabase/ui/pages/teamPage/stats/clear/hooks/useClearStatsFlow.test.js

import { act, renderHook, waitFor } from '@testing-library/react'

import { buildClearStatsApprovedStateV2 } from '../../../../../../domain/statsV2/index.js'
import {
  executeClearStatsV2,
  prepareClearStatsForUiV2,
} from '../../../../../../services/writeV2/stats/index.js'
import useClearStatsFlow from './useClearStatsFlow.js'

jest.mock('../../../../../../domain/statsV2/index.js', () => ({
  buildClearStatsApprovedStateV2: jest.fn(() => ({ approved: true })),
}))

jest.mock('../../../../../../services/writeV2/stats/index.js', () => ({
  executeClearStatsV2: jest.fn(),
  prepareClearStatsForUiV2: jest.fn(),
}))

const target = {
  team: { birthTeamDocumentId: 'team-1' },
  selectedSeasonOption: { seasonKey: '2026', leagueId: 'league-1' },
  leagueId: 'league-fallback',
}

beforeEach(() => {
  jest.clearAllMocks()
  buildClearStatsApprovedStateV2.mockReturnValue({ approved: true })
})

describe('useClearStatsFlow', () => {
  test('builds a fresh preview and keeps a successful delete successful when page reload fails', async () => {
    const plan = {
      isIdempotent: false,
      projectionPlan: { impact: { operationsRequired: 1 } },
    }
    const resultValue = { receiptId: 'receipt-1', status: 'succeeded' }
    const reloadError = new Error('reload failed')
    const reload = jest.fn().mockRejectedValue(reloadError)
    prepareClearStatsForUiV2.mockResolvedValue(plan)
    executeClearStatsV2.mockResolvedValue(resultValue)

    const { result } = renderHook(() => useClearStatsFlow({ ...target, reload }))

    act(() => result.current.openModal({
      seasonKey: '25/26',
      leagueId: 'league-history',
    }))
    await waitFor(() => expect(result.current.status).toBe('ready'))

    expect(prepareClearStatsForUiV2).toHaveBeenCalledWith({
      birthTeamDocumentId: 'team-1',
      seasonKey: '25/26',
      leagueId: 'league-history',
    })

    await act(async () => result.current.execute())

    expect(buildClearStatsApprovedStateV2).toHaveBeenCalledWith({
      proposedPlan: plan,
      approvedAt: expect.any(String),
    })
    expect(executeClearStatsV2).toHaveBeenCalledWith({ approvedState: { approved: true } })
    expect(reload).toHaveBeenCalledTimes(1)
    expect(result.current.status).toBe('succeeded')
    expect(result.current.result).toBe(resultValue)
    expect(result.current.error).toBe(reloadError)
  })

  test('allows explicit receipt creation and Audit when Stats are already clean', async () => {
    prepareClearStatsForUiV2.mockResolvedValue({
      isIdempotent: true,
      projectionPlan: { impact: { operationsRequired: 0 } },
    })
    executeClearStatsV2.mockResolvedValue({ receiptId: 'verified-empty', status: 'succeeded' })

    const { result } = renderHook(() => useClearStatsFlow({
      ...target,
      reload: jest.fn(),
    }))

    act(() => result.current.openModal())
    await waitFor(() => expect(result.current.status).toBe('ready'))
    await act(async () => result.current.execute())

    expect(buildClearStatsApprovedStateV2).toHaveBeenCalledTimes(1)
    expect(executeClearStatsV2).toHaveBeenCalledTimes(1)
    expect(result.current.status).toBe('succeeded')
    expect(result.current.result.receiptId).toBe('verified-empty')
  })
})

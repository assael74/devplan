// src/features/playersDatabase/ui/pages/teamPage/stats/clear/hooks/useClearStatsFlow.test.js

import { act, renderHook, waitFor } from '@testing-library/react'

import {
  clearStats,
  prepareStatsClear,
} from '../../../../../../services/write/stats/index.js'
import useClearStatsFlow from './useClearStatsFlow.js'

jest.mock('../../../../../../services/write/stats/index.js', () => ({
  clearStats: jest.fn(),
  prepareStatsClear: jest.fn(),
}))

const target = {
  team: { birthTeamDocumentId: 'team-1' },
  selectedSeasonOption: { seasonId: '2025_2026', seasonKey: '25/26', leagueId: 'league-1' },
  leagueId: 'league-fallback',
}

beforeEach(() => {
  jest.clearAllMocks()
})

describe('useClearStatsFlow', () => {
  test('executes the Approved State built by the preview without a reload', async () => {
    const plan = {
      isIdempotent: false,
      projectionPlan: { impact: { operationsRequired: 1 } },
    }
    const resultValue = { receiptId: 'receipt-1', status: 'succeeded' }
    prepareStatsClear.mockResolvedValue(plan)
    clearStats.mockResolvedValue(resultValue)

    const { result } = renderHook(() => useClearStatsFlow(target))

    act(() => result.current.openModal({
      seasonId: '2025_2026',
      seasonKey: '25/26',
      leagueId: 'league-history',
    }))
    await waitFor(() => expect(result.current.status).toBe('ready'))

    expect(prepareStatsClear).toHaveBeenCalledWith({
      input: {
        teamId: 'team-1',
        seasonId: '2025_2026',
        seasonKey: '25/26',
        leagueId: 'league-history',
      },
    })

    await act(async () => result.current.execute())

    expect(clearStats).toHaveBeenCalledWith({
      approvedState: plan,
      display: {
        teamName: '',
      },
    })
    expect(result.current.status).toBe('succeeded')
    expect(result.current.result).toBe(resultValue)
    expect(result.current.error).toBe(null)
  })

  test('allows explicit receipt creation and Audit when Stats are already clean', async () => {
    prepareStatsClear.mockResolvedValue({
      isIdempotent: true,
      projectionPlan: { impact: { operationsRequired: 0 } },
    })
    clearStats.mockResolvedValue({ receiptId: 'verified-empty', status: 'succeeded' })

    const { result } = renderHook(() => useClearStatsFlow(target))

    act(() => result.current.openModal())
    await waitFor(() => expect(result.current.status).toBe('ready'))
    await act(async () => result.current.execute())

    expect(prepareStatsClear).toHaveBeenCalledTimes(1)
    expect(clearStats).toHaveBeenCalledTimes(1)
    expect(result.current.status).toBe('succeeded')
    expect(result.current.result.receiptId).toBe('verified-empty')
  })
})

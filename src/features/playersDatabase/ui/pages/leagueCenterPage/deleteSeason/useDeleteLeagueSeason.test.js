// src/features/playersDatabase/ui/pages/leagueCenterPage/deleteSeason/useDeleteLeagueSeason.test.js

import { act, renderHook } from '@testing-library/react'

import { deleteLeagueSeason } from '../../../../services/write/league/index.js'
import useDeleteLeagueSeason from './useDeleteLeagueSeason.js'

jest.mock('../../../../services/write/league/index.js', () => ({
  deleteLeagueSeason: jest.fn(),
}))

const row = {
  leagueId: 'league-1',
  leagueName: 'ליגת נוער',
  seasonId: '2026_2027',
  seasonKey: '26/27',
  birthYear: 2008,
  teamsCount: 0,
  tableStatus: 'missing',
  hasSelectedSeason: true,
}

const succeededResult = receiptId => ({
  receiptId,
  status: 'closed',
  executionStatus: 'succeeded',
  recoveryRequired: false,
  audit: { findings: [] },
})

beforeEach(() => {
  jest.resetAllMocks()
  deleteLeagueSeason.mockResolvedValue(succeededResult('receipt-1'))
})

test('opens a preview without writing and sends the final League Delete API input', async () => {
  const { result } = renderHook(() => useDeleteLeagueSeason({ reload: jest.fn() }))

  expect(result.current.availability(row).allowed).toBe(true)
  act(() => result.current.open(row))
  expect(deleteLeagueSeason).not.toHaveBeenCalled()

  await act(async () => result.current.approve())

  expect(deleteLeagueSeason).toHaveBeenCalledWith({
    input: {
      leagueId: 'league-1',
      seasonId: '2026_2027',
      updatedAt: expect.any(String),
    },
    receiptId: '',
    display: {
      leagueName: 'ליגת נוער',
      seasonKey: '26/27',
      birthYear: 2008,
    },
  })
  expect(result.current.status).toBe('succeeded')
})

test('retry preserves the action input and reuses the returned receipt', async () => {
  deleteLeagueSeason
    .mockResolvedValueOnce({
      receiptId: 'receipt-open',
      status: 'open',
      executionStatus: 'failed',
      recoveryRequired: true,
      audit: { findings: [{ type: 'stale_projection' }] },
    })
    .mockResolvedValueOnce(succeededResult('receipt-open'))
  const { result } = renderHook(() => useDeleteLeagueSeason({ reload: jest.fn() }))

  act(() => result.current.open(row))
  await act(async () => result.current.approve())
  const firstInput = deleteLeagueSeason.mock.calls[0][0].input
  await act(async () => result.current.retry())

  expect(deleteLeagueSeason.mock.calls[1][0]).toEqual(expect.objectContaining({
    input: firstInput,
    receiptId: 'receipt-open',
  }))
  expect(result.current.status).toBe('succeeded')
})

test('successful Delete reloads the selected League row', async () => {
  const reload = jest.fn().mockResolvedValue(undefined)
  const { result } = renderHook(() => useDeleteLeagueSeason({ reload }))

  act(() => result.current.open(row))
  await act(async () => result.current.approve())

  expect(result.current.status).toBe('succeeded')
  expect(reload).toHaveBeenCalledWith(row)
})

test('blocks Delete while the League table is still loaded', () => {
  const { result } = renderHook(() => useDeleteLeagueSeason({ reload: jest.fn() }))

  expect(result.current.availability({
    ...row,
    tableStatus: 'full',
  }).allowed).toBe(false)
  expect(deleteLeagueSeason).not.toHaveBeenCalled()
})

// src/features/playersDatabase/ui/pages/leagueCenterPage/deleteSeason/useDeleteLeagueSeason.test.js

import { readOpenDeleteSeasonReceipts, matchesDeleteSeasonReceipt } from '../../../../services/writeV2/league/deleteSeason/deleteLeagueSeasonReceipt.js'
import { act, renderHook, waitFor } from '@testing-library/react'
import useDeleteLeagueSeason from './useDeleteLeagueSeason.js'
import { readClearLeagueSources } from '../../../../services/writeV2/league/clear/readClearLeagueTeams.js'
import { buildDeleteLeagueSeasonPlan } from '../../../../domain/leagueV2/deleteSeason/deleteLeagueSeason.builder.js'
import { approveDeleteSeason } from '../../../../domain/leagueV2/deleteSeason/deleteLeagueSeasonApprovedState.builder.js'
import { prepareDeleteLeagueSeason } from '../../../../services/writeV2/league/deleteSeason/prepareDeleteLeagueSeason.js'
import { startDeleteSeasonSession, writeDeleteSeasonStep, finishDeleteSeasonSession } from '../../../../services/writeV2/league/deleteSeason/deleteLeagueSeasonSession.js'

jest.mock('../../../../services/writeV2/league/clear/readClearLeagueTeams.js', () => ({ readClearLeagueSources: jest.fn() }))
jest.mock('../../../../domain/leagueV2/deleteSeason/deleteLeagueSeason.builder.js', () => ({ buildDeleteLeagueSeasonPlan: jest.fn() }))
jest.mock('../../../../domain/leagueV2/deleteSeason/deleteLeagueSeasonApprovedState.builder.js', () => ({ approveDeleteSeason: jest.fn() }))
jest.mock('../../../../services/writeV2/league/deleteSeason/prepareDeleteLeagueSeason.js', () => ({ prepareDeleteLeagueSeason: jest.fn() }))
jest.mock('../../../../services/writeV2/league/deleteSeason/deleteLeagueSeasonSession.js', () => ({
  startDeleteSeasonSession: jest.fn(), writeDeleteSeasonStep: jest.fn(),
  finishDeleteSeasonSession: jest.fn(), failDeleteSeasonSession: jest.fn(),
}))
jest.mock('../../../../services/writeV2/league/deleteSeason/deleteLeagueSeasonReceipt.js', () => ({ readOpenDeleteSeasonReceipts: jest.fn(), matchesDeleteSeasonReceipt: jest.fn() }))
const row = { leagueId: 'league', seasonKey: '26/27', hasSelectedSeason: true }
beforeEach(() => {
  jest.resetAllMocks()
  readClearLeagueSources.mockResolvedValue({})
  buildDeleteLeagueSeasonPlan.mockReturnValue({ retryState: 'season_present' })
  readOpenDeleteSeasonReceipts.mockResolvedValue([])
  matchesDeleteSeasonReceipt.mockImplementation((receipt, target) => receipt.data.auditTarget.leagueId === target.leagueId)
  prepareDeleteLeagueSeason.mockResolvedValue({ identity: row })
  approveDeleteSeason.mockImplementation(value => value)
  startDeleteSeasonSession.mockResolvedValue('receipt')
  writeDeleteSeasonStep.mockResolvedValue({ written: 1, skipped: 0, failed: 0 })
  finishDeleteSeasonSession.mockResolvedValue({ result: 'clean', findings: [] })
})

test('availability reads Domain only; no receipt session opens before approval', async () => {
  const { result } = renderHook(() => useDeleteLeagueSeason({ reload: jest.fn(), refreshKey: 'initial' }))
  await waitFor(() => expect(result.current.availability(row).allowed).toBe(true))
  expect(startDeleteSeasonSession).not.toHaveBeenCalled()
  buildDeleteLeagueSeasonPlan.mockImplementation(() => {
    const error = new Error('loaded')
    error.code = 'DELETE_SEASON_TABLE_LOADED'
    throw error
  })
  expect(result.current.availability(row).allowed).toBe(false)
})

test('successful center action reloads from the server without navigation', async () => {
  const reload = jest.fn().mockResolvedValue(undefined)
  const { result } = renderHook(() => useDeleteLeagueSeason({ reload, refreshKey: 'initial' }))
  await act(async () => result.current.open(row))
  await act(async () => result.current.approve())
  await act(async () => result.current.close())
  expect(result.current.selected).toEqual(row)
  await act(async () => result.current.next())
  await act(async () => result.current.next())
  await act(async () => result.current.next())
  expect(result.current.status).toBe('succeeded')
  expect(reload).toHaveBeenCalledWith({ fromServer: true })
})

 test('absent season without a matching open receipt is hidden, including unrelated receipts', async () => {
  buildDeleteLeagueSeasonPlan.mockReturnValue({ retryState: 'season_absent_clean' })
  readOpenDeleteSeasonReceipts.mockResolvedValue([{ data: { auditTarget: { leagueId: 'foreign' } } }])
  const { result } = renderHook(() => useDeleteLeagueSeason({ reload: jest.fn(), refreshKey: 'initial' }))
  await waitFor(() => expect(result.current.availability(row).hidden).toBe(true))
  expect(result.current.availability(row).allowed).toBe(false)
})

test('absent season with a matching open receipt offers completion and disappears after refresh', async () => {
  buildDeleteLeagueSeasonPlan.mockReturnValue({ retryState: 'season_absent_master_stale' })
  readOpenDeleteSeasonReceipts.mockResolvedValue([{ docId: 'receipt', data: { auditTarget: { leagueId: 'league' } } }])
  const { result, rerender } = renderHook(({ refreshKey }) => useDeleteLeagueSeason({ reload: jest.fn(), refreshKey }), { initialProps: { refreshKey: 'before' } })
  await waitFor(() => expect(result.current.availability(row)).toMatchObject({ allowed: true, label: 'השלמת מחיקה' }))
  readOpenDeleteSeasonReceipts.mockResolvedValue([])
  buildDeleteLeagueSeasonPlan.mockReturnValue({ retryState: 'season_absent_clean' })
  rerender({ refreshKey: 'after-server-reload' })
  await waitFor(() => expect(result.current.availability(row)).toMatchObject({ allowed: false, hidden: true }))
})

test('receipt read failure disables deletion instead of assuming there are no open receipts', async () => {
  readOpenDeleteSeasonReceipts.mockRejectedValue(new Error('read failed'))
  const { result } = renderHook(() => useDeleteLeagueSeason({ reload: jest.fn(), refreshKey: 'initial' }))
  await waitFor(() => expect(result.current.availability(row)).toMatchObject({
    allowed: false,
    reason: 'קריאת תיעודי המחיקה נכשלה. יש לרענן את המרכז.',
  }))
  expect(result.current.availability(row).hidden).not.toBe(true)
})

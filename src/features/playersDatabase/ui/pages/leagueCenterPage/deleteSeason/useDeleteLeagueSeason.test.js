// src/features/playersDatabase/ui/pages/leagueCenterPage/deleteSeason/useDeleteLeagueSeason.test.js

import { act, renderHook } from '@testing-library/react'
import useDeleteLeagueSeason from './useDeleteLeagueSeason.js'
import { approveDeleteSeason } from '../../../../domain/leagueV2/deleteSeason/deleteLeagueSeasonApprovedState.builder.js'
import { prepareDeleteLeagueSeason } from '../../../../services/writeV2/league/deleteSeason/prepareDeleteLeagueSeason.js'
import { startDeleteSeasonSession, writeDeleteSeasonStep, finishDeleteSeasonSession } from '../../../../services/writeV2/league/deleteSeason/deleteLeagueSeasonSession.js'

jest.mock('../../../../domain/leagueV2/deleteSeason/deleteLeagueSeasonApprovedState.builder.js', () => ({ approveDeleteSeason: jest.fn() }))
jest.mock('../../../../services/writeV2/league/deleteSeason/prepareDeleteLeagueSeason.js', () => ({ prepareDeleteLeagueSeason: jest.fn() }))
jest.mock('../../../../services/writeV2/league/deleteSeason/deleteLeagueSeasonSession.js', () => ({
  startDeleteSeasonSession: jest.fn(), writeDeleteSeasonStep: jest.fn(),
  finishDeleteSeasonSession: jest.fn(), failDeleteSeasonSession: jest.fn(),
}))
const row = { leagueId: 'league', seasonKey: '26/27', hasSelectedSeason: true }
beforeEach(() => {
  jest.resetAllMocks()
  prepareDeleteLeagueSeason.mockResolvedValue({ identity: row })
  approveDeleteSeason.mockImplementation(value => value)
  startDeleteSeasonSession.mockResolvedValue('receipt')
  writeDeleteSeasonStep.mockResolvedValue({ written: 1, skipped: 0, failed: 0 })
  finishDeleteSeasonSession.mockResolvedValue({ result: 'clean', findings: [] })
})

test('does not prepare deletion before the delete button is clicked', async () => {
  const { result } = renderHook(() => useDeleteLeagueSeason({ reload: jest.fn() }))

  expect(result.current.availability(row).allowed).toBe(true)
  expect(prepareDeleteLeagueSeason).not.toHaveBeenCalled()
  expect(startDeleteSeasonSession).not.toHaveBeenCalled()

  await act(async () => result.current.open(row))
  expect(prepareDeleteLeagueSeason).toHaveBeenCalledTimes(1)
  expect(prepareDeleteLeagueSeason).toHaveBeenCalledWith({ leagueId: 'league', seasonKey: '26/27' })
})

test('successful center action reloads from the server without navigation', async () => {
  const reload = jest.fn().mockResolvedValue(undefined)
  const { result } = renderHook(() => useDeleteLeagueSeason({ reload }))
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

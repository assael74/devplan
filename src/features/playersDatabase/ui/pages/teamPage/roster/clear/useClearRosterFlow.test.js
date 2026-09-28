// src/features/playersDatabase/ui/pages/teamPage/roster/clear/useClearRosterFlow.test.js

import { act, renderHook, waitFor } from '@testing-library/react'
import useClearRosterFlow from './useClearRosterFlow.js'
import { prepareClearRoster } from '../../../../../services/writeV2/roster/clear/prepareClearRoster.js'
import { buildClearRosterApprovedState } from '../../../../../domain/rosterV2/clear/clearRosterApprovedState.builder.js'
import { writeClearRosterStep } from '../../../../../services/writeV2/roster/clear/writeClearRosterStep.js'
import { startClearRosterSession, reportClearRosterStep, reportClearRosterFailure } from '../../../../../services/writeV2/roster/clear/clearRosterSession.js'

jest.mock('../../../../../services/writeV2/roster/clear/readClearRoster.js', () => ({
  readNextTeamSeasonDeleteAction: jest.fn().mockResolvedValue('roster'),
}))
jest.mock('../../../../../services/writeV2/roster/clear/prepareClearRoster.js', () => ({ prepareClearRoster: jest.fn() }))
jest.mock('../../../../../domain/rosterV2/clear/clearRosterApprovedState.builder.js', () => ({ buildClearRosterApprovedState: jest.fn() }))
jest.mock('../../../../../services/writeV2/roster/clear/writeClearRosterStep.js', () => ({ writeClearRosterStep: jest.fn() }))
jest.mock('../../../../../services/writeV2/roster/clear/clearRosterSession.js', () => ({
  CLEAR_ROSTER_STEPS: [{ id: 'teamSeason', label: 'עונת הקבוצה' }, { id: 'playerIndex', label: 'אינדקסים' }],
  startClearRosterSession: jest.fn(),
  reportClearRosterCanonical: jest.fn(),
  reportClearRosterStep: jest.fn(),
  reportClearRosterFailure: jest.fn(),
  finishClearRosterSession: jest.fn(),
}))

test('failure after canonical retries from step one with a fresh approved state and same receipt', async () => {
  const firstPlan = { attempt: 1 }
  const secondPlan = { attempt: 2 }
  prepareClearRoster.mockResolvedValueOnce(firstPlan).mockResolvedValueOnce(secondPlan)
  buildClearRosterApprovedState.mockImplementation(plan => ({ ...plan, approved: true }))
  startClearRosterSession.mockResolvedValue('original')
  const error = Object.assign(new Error('offline'), { failedTarget: 'index-1' })
  writeClearRosterStep.mockResolvedValueOnce({}).mockRejectedValueOnce(error).mockResolvedValueOnce({})
  const historicalSeason = { seasonKey: '25/26', leagueId: 'league-history' }
  const { result } = renderHook(() => useClearRosterFlow({
    team: { id: 'team-1' },
    selectedSeasonOption: { seasonKey: '26/27', leagueId: 'league-1' },
    seasonOptions: [
      { seasonKey: '26/27', leagueId: 'league-1' },
      historicalSeason,
    ],
  }))

  await waitFor(() => expect(result.current.getDeleteActionFor(historicalSeason)).toBe('roster'))

  await act(async () => result.current.openModal(historicalSeason))
  expect(prepareClearRoster).toHaveBeenCalledWith({
    birthTeamDocumentId: 'team-1',
    seasonKey: '25/26',
    leagueId: 'league-history',
  })
  await act(async () => result.current.approve())
  await act(async () => result.current.next())
  expect(reportClearRosterStep).toHaveBeenCalledWith('original', 'teamSeason')
  await act(async () => result.current.next())
  expect(result.current.status).toBe('failed')
  expect(reportClearRosterFailure).toHaveBeenCalledWith('original', 'playerIndex', error)

  await act(async () => result.current.retry())
  expect(prepareClearRoster).toHaveBeenLastCalledWith({
    birthTeamDocumentId: 'team-1',
    seasonKey: '25/26',
    leagueId: 'league-history',
  })
  expect(result.current.status).toBe('preview')
  expect(result.current.stepIndex).toBe(0)
  expect(writeClearRosterStep).toHaveBeenCalledTimes(2)
  await act(async () => result.current.approve())
  await act(async () => result.current.next())
  expect(prepareClearRoster).toHaveBeenCalledTimes(2)
  expect(buildClearRosterApprovedState).toHaveBeenLastCalledWith(secondPlan)
  expect(writeClearRosterStep.mock.calls[2][0]).toEqual(expect.objectContaining({
    step: 'teamSeason', approvedState: { attempt: 2, approved: true },
  }))
})

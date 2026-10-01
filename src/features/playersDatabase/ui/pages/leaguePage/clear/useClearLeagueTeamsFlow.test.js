// src/features/playersDatabase/ui/pages/leaguePage/clear/useClearLeagueTeamsFlow.test.js

import { act, renderHook, waitFor } from '@testing-library/react'
import { buildClearLeagueTeamsApprovedState } from '../../../../domain/leagueV2/clear/clearLeagueTeamsApprovedState.builder.js'
import useClearLeagueTeamsFlow from './useClearLeagueTeamsFlow.js'
import { prepareClearLeagueTeams } from '../../../../services/writeV2/league/clear/prepareClearLeagueTeams.js'
import { writeClearLeagueTeamsStep } from '../../../../services/writeV2/league/clear/writeClearLeagueTeamsStep.js'
import { finishClearLeagueTeamsSession, startClearLeagueTeamsSession } from '../../../../services/writeV2/league/clear/clearLeagueTeamsSession.js'

jest.mock('../../../../services/writeV2/league/clear/prepareClearLeagueTeams.js', () => ({ prepareClearLeagueTeams: jest.fn() }))
jest.mock('../../../../domain/leagueV2/clear/clearLeagueTeamsApprovedState.builder.js', () => ({ buildClearLeagueTeamsApprovedState: jest.fn(value => value) }))
jest.mock('../../../../domain/leagueV2/clear/clearLeagueTeamsPlan.builder.js', () => ({ CLEAR_LEAGUE_STEPS: [{ id: 'league', label: 'ליגה' }] }))
jest.mock('../../../../services/writeV2/league/clear/writeClearLeagueTeamsStep.js', () => ({ writeClearLeagueTeamsStep: jest.fn() }))
jest.mock('../../../../services/writeV2/league/clear/clearLeagueTeamsSession.js', () => ({
  startClearLeagueTeamsSession: jest.fn(), reportClearLeagueStep: jest.fn(),
  reportClearLeagueFailure: jest.fn(), finishClearLeagueTeamsSession: jest.fn(),
}))

const props = { league: { id: 'league' }, selectedSeasonOption: { seasonKey: '26/27' } }

beforeEach(() => {
  jest.resetAllMocks()
  buildClearLeagueTeamsApprovedState.mockImplementation(value => value)
  prepareClearLeagueTeams.mockResolvedValue({ identity: {}, operations: [] })
  startClearLeagueTeamsSession.mockResolvedValue('original')
  writeClearLeagueTeamsStep.mockResolvedValue({})
  finishClearLeagueTeamsSession.mockResolvedValue({ result: 'clean', findings: [] })
})

test('Retry prepares and approves again and restarts at the first step', async () => {
  writeClearLeagueTeamsStep.mockRejectedValueOnce(new Error('offline'))
  const { result } = renderHook(() => useClearLeagueTeamsFlow(props))
  await waitFor(() => expect(result.current.disabled).toBe(false))
  await act(async () => result.current.openModal())
  await act(async () => result.current.approve())
  await act(async () => result.current.next())
  expect(result.current.status).toBe('failed')
  const previousReads = prepareClearLeagueTeams.mock.calls.length
  await act(async () => result.current.retry())
  expect(prepareClearLeagueTeams.mock.calls.length).toBe(previousReads + 1)
  expect(result.current.status).toBe('preview')
  expect(result.current.stepIndex).toBe(0)
  await act(async () => result.current.approve())
  await act(async () => result.current.next())
  expect(startClearLeagueTeamsSession).toHaveBeenCalledTimes(2)
  expect(writeClearLeagueTeamsStep).toHaveBeenLastCalledWith(expect.objectContaining({ step: 'league' }))
})

test('reload failure after clean Audit does not turn deletion into failure', async () => {
  const { result } = renderHook(() => useClearLeagueTeamsFlow({ ...props, reload: jest.fn().mockRejectedValue(new Error('reload')) }))
  await waitFor(() => expect(result.current.disabled).toBe(false))
  await act(async () => result.current.openModal())
  await act(async () => result.current.approve())
  await act(async () => result.current.next())
  await act(async () => result.current.next())
  expect(result.current.status).toBe('succeeded')
  expect(result.current.message).toContain('רענון התצוגה נכשל')
})

test('exposes the next safe team deletion action when League clear is blocked', async () => {
  const error = new Error('Stats is not absent')
  error.code = 'CLEAR_LEAGUE_STATS_PRESENT'
  error.details = {
    nextAction: 'stats',
    birthTeamDocumentId: 'team-1',
  }
  prepareClearLeagueTeams.mockRejectedValue(error)

  const { result } = renderHook(() => useClearLeagueTeamsFlow(props))

  expect(prepareClearLeagueTeams).not.toHaveBeenCalled()
  await act(async () => result.current.openModal())
  await waitFor(() => expect(result.current.nextDeleteAction).toBe('stats'))
  expect(result.current.nextDeleteTargetId).toBe('team-1')
  expect(result.current.disabled).toBe(true)
})

test('disables League clear when the complete plan is already absent', async () => {
  prepareClearLeagueTeams.mockResolvedValue({
    identity: {},
    operations: [],
    state: 'absent',
  })

  const { result } = renderHook(() => useClearLeagueTeamsFlow(props))

  expect(prepareClearLeagueTeams).not.toHaveBeenCalled()
  await act(async () => result.current.openModal())
  await waitFor(() => expect(result.current.alreadyCleared).toBe(true))
  expect(result.current.disabled).toBe(true)
  expect(result.current.disabledReason).toBe('קבוצות העונה כבר נמחקו.')
})

 test('a failed step reloads server-backed state and remains retryable', async () => {
  const reload = jest.fn().mockResolvedValue(undefined)
  writeClearLeagueTeamsStep.mockRejectedValueOnce(new Error('partial failure'))
  const { result } = renderHook(() => useClearLeagueTeamsFlow({ ...props, reload }))
  await waitFor(() => expect(result.current.disabled).toBe(false))
  await act(async () => result.current.openModal())
  await act(async () => result.current.approve())
  await act(async () => result.current.next())
  expect(reload).toHaveBeenCalledTimes(1)
  expect(result.current.status).toBe('failed')
})

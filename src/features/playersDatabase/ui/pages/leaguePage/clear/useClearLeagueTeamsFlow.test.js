// src/features/playersDatabase/ui/pages/leaguePage/clear/useClearLeagueTeamsFlow.test.js

import { act, renderHook } from '@testing-library/react'

import { clearLeagueTeams } from '../../../../services/write/league/index.js'
import { getWriteActionReceipt } from '../../../../services/write/receipt/index.js'
import { repairWriteActionReceipt } from '../../../../services/write/recovery/index.js'
import useClearLeagueTeamsFlow from './useClearLeagueTeamsFlow.js'

jest.mock('../../../../services/write/league/index.js', () => ({
  clearLeagueTeams: jest.fn(),
}))
jest.mock('../../../../services/write/receipt/index.js', () => ({
  getWriteActionReceipt: jest.fn(),
}))
jest.mock('../../../../services/write/recovery/index.js', () => ({
  repairWriteActionReceipt: jest.fn(),
}))

const buildProps = ({ reload = jest.fn(), tableState = 'LOADED' } = {}) => ({
  league: { id: 'league-1', name: 'ליגת נוער' },
  selectedSeasonOption: {
    seasonId: '2026_2027',
    seasonKey: '26/27',
    season: {
      birthYear: 2008,
      table: {
        tableState,
        teamsById: {
          'club-1_2008_1': { clubId: 'club-1', teamSlot: 1 },
        },
      },
    },
  },
  reload,
})

const succeededResult = receiptId => ({
  receiptId,
  status: 'closed',
  executionStatus: 'succeeded',
  recoveryRequired: false,
  audit: { findings: [] },
})

const succeededReceipt = receiptId => ({
  id: receiptId,
  status: 'closed',
  executionStatus: 'succeeded',
  recoveryRequired: false,
  canonicalOutcome: 'confirmed',
  progress: {
    completedByStage: {
      canonical: true,
      teamSeasonCompetitionSnapshots: true,
      leaguesCenter: true,
      clubsCenter: true,
      audit: true,
    },
    failed: {},
  },
})

beforeEach(() => {
  jest.resetAllMocks()
  clearLeagueTeams.mockResolvedValue(succeededResult('receipt-1'))
  getWriteActionReceipt.mockResolvedValue(succeededReceipt('receipt-1'))
  repairWriteActionReceipt.mockResolvedValue(succeededResult('receipt-1'))
})

test('opens a preview without writing and sends the final League Clear API input', async () => {
  const { result } = renderHook(() => useClearLeagueTeamsFlow(buildProps()))

  act(() => result.current.openModal())
  expect(clearLeagueTeams).not.toHaveBeenCalled()
  expect(result.current.proposal.impact.teams).toBe(1)

  await act(async () => result.current.approve())

  expect(clearLeagueTeams).toHaveBeenCalledWith({
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
    onProgress: expect.any(Function),
  })
  expect(result.current.status).toBe('succeeded')
})

test('retry preserves the action input and reuses the returned receipt', async () => {
  clearLeagueTeams
    .mockResolvedValueOnce({
      receiptId: 'receipt-open',
      status: 'open',
      executionStatus: 'failed',
      recoveryRequired: true,
      audit: { findings: [{ type: 'projection_mismatch' }] },
    })
    .mockResolvedValueOnce(succeededResult('receipt-open'))
  getWriteActionReceipt
    .mockResolvedValueOnce({
      id: 'receipt-open',
      status: 'open',
      executionStatus: 'failed',
      recoveryRequired: true,
      canonicalOutcome: 'failed_or_unknown',
      progress: { completedByStage: {}, failed: { stageId: 'canonical' } },
    })
    .mockResolvedValueOnce(succeededReceipt('receipt-open'))
  const { result } = renderHook(() => useClearLeagueTeamsFlow(buildProps()))

  act(() => result.current.openModal())
  await act(async () => result.current.approve())
  const firstInput = clearLeagueTeams.mock.calls[0][0].input
  await act(async () => result.current.retry())

  expect(clearLeagueTeams.mock.calls[1][0]).toEqual(expect.objectContaining({
    input: firstInput,
    receiptId: 'receipt-open',
  }))
  expect(result.current.status).toBe('succeeded')
})

test('repairs projections without reopening Clear after canonical confirmation', async () => {
  const failure = Object.assign(new Error('center failed'), { receiptId: 'receipt-clear' })
  clearLeagueTeams.mockImplementation(async ({ onProgress }) => {
    onProgress({ type: 'receiptOpened', receiptId: 'receipt-clear' })
    onProgress({ type: 'stageCompleted', receiptId: 'receipt-clear', stageId: 'canonical' })
    onProgress({ type: 'stageFailed', receiptId: 'receipt-clear', stageId: 'leaguesCenter' })
    throw failure
  })
  getWriteActionReceipt
    .mockResolvedValueOnce({
      id: 'receipt-clear',
      status: 'open',
      executionStatus: 'failed',
      recoveryRequired: true,
      canonicalOutcome: 'confirmed',
      progress: {
        completedByStage: { canonical: true },
        failed: { stageId: 'leaguesCenter' },
      },
    })
    .mockResolvedValueOnce(succeededReceipt('receipt-clear'))
  repairWriteActionReceipt.mockResolvedValue(succeededResult('receipt-clear'))
  const { result } = renderHook(() => useClearLeagueTeamsFlow(buildProps()))

  act(() => result.current.openModal())
  await act(async () => result.current.approve())

  expect(result.current.status).toBe('failed')
  expect(result.current.retryMode).toBe('repair')
  expect(result.current.syncStages.find(stage => stage.id === 'canonical').state)
    .toBe('completed')
  expect(result.current.syncStages.find(stage => stage.id === 'leaguesCenter').state)
    .toBe('failed')

  await act(async () => result.current.retry())

  expect(clearLeagueTeams).toHaveBeenCalledTimes(1)
  expect(repairWriteActionReceipt).toHaveBeenCalledWith({ receiptId: 'receipt-clear' })
  expect(result.current.status).toBe('succeeded')
})

test('reload failure after success does not turn Clear into failure', async () => {
  const reload = jest.fn().mockRejectedValue(new Error('reload failed'))
  const { result } = renderHook(() => useClearLeagueTeamsFlow(buildProps({ reload })))

  act(() => result.current.openModal())
  await act(async () => result.current.approve())

  expect(result.current.status).toBe('succeeded')
  expect(result.current.message).toContain('רענון התצוגה נכשל')
})

test('disables Clear when the canonical season is already not loaded', () => {
  const { result } = renderHook(() => useClearLeagueTeamsFlow(buildProps({
    tableState: 'NOT_LOADED',
  })))

  expect(result.current.disabled).toBe(true)
  expect(result.current.alreadyCleared).toBe(true)
  expect(clearLeagueTeams).not.toHaveBeenCalled()
})

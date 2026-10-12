// src/features/playersDatabase/ui/pages/leaguePage/hooks/useLeagueTableImport.test.js

import { act, renderHook } from '@testing-library/react'

import { PLAYERS_DATABASE_CLUBS_CATALOG } from '../../../../catalog/clubs.catalog.js'
import {
  loadLeague,
  readOtherLeagueTeamOwners,
} from '../../../../services/write/league/index.js'
import { getWriteActionReceipt } from '../../../../services/write/receipt/index.js'
import { repairWriteActionReceipt } from '../../../../services/write/recovery/index.js'
import { loadLeagueForAuditRepair } from '../../../../services/audit/repair/reloadLeague.js'
import { useLeagueTableImport } from './useLeagueTableImport.js'

jest.mock('../../../../services/write/league/index.js', () => ({
  loadLeague: jest.fn(),
  readOtherLeagueTeamOwners: jest.fn(),
}))
jest.mock('../../../../services/write/receipt/index.js', () => ({
  getWriteActionReceipt: jest.fn(),
}))
jest.mock('../../../../services/write/recovery/index.js', () => ({
  repairWriteActionReceipt: jest.fn(),
}))
jest.mock('../../../../services/audit/repair/reloadLeague.js', () => ({
  loadLeagueForAuditRepair: jest.fn(),
}))
jest.mock('../../../../../../ui/core/feedback/snackbar/SnackbarProvider.js', () => ({
  useSnackbar: () => ({ notify: jest.fn() }),
}))

const props = {
  league: {
    id: 'league-1',
    name: 'ליגת נוער',
    ageGroupId: 'youth',
    ageGroup: 'נוער',
    birthYear: 2008,
  },
  leagueDoc: {
    leagueId: 'league-1',
    names: { display: 'ליגת נוער' },
    ageGroupId: 'youth',
    ageGroupLabel: 'נוער',
    level: 1,
    region: 'national',
  },
  selectedSeasonOption: {
    season: {
      seasonId: '2026_2027',
      seasonKey: '26/27',
      birthYear: 2008,
      gameDurationMinutes: 90,
      table: { teamsById: {} },
    },
  },
  reload: jest.fn(),
}

const failedReceipt = {
  id: 'receipt-1',
  actionType: 'leagueLoad',
  status: 'open',
  executionStatus: 'failed',
  recoveryRequired: true,
  canonicalOutcome: 'confirmed',
  progress: {
    completedByStage: { canonical: true },
    failed: { stageId: 'leaguesCenter' },
  },
}

const completedReceipt = {
  ...failedReceipt,
  status: 'closed',
  executionStatus: 'succeeded',
  recoveryRequired: false,
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
}

beforeEach(() => {
  jest.resetAllMocks()
  props.reload.mockResolvedValue(undefined)
  readOtherLeagueTeamOwners.mockResolvedValue({})
})

test('repairs projections without reopening a receipt after canonical confirmation', async () => {
  const failure = Object.assign(new Error('center failed'), { receiptId: 'receipt-1' })
  loadLeague.mockImplementation(async ({ onProgress }) => {
    onProgress({ type: 'receiptOpened', receiptId: 'receipt-1' })
    onProgress({ type: 'stageCompleted', receiptId: 'receipt-1', stageId: 'canonical' })
    onProgress({ type: 'stageFailed', receiptId: 'receipt-1', stageId: 'leaguesCenter' })
    throw failure
  })
  getWriteActionReceipt
    .mockResolvedValueOnce(failedReceipt)
    .mockResolvedValueOnce(completedReceipt)
  repairWriteActionReceipt.mockResolvedValue({
    receiptId: 'receipt-1',
    status: 'closed',
    executionStatus: 'succeeded',
    recoveryRequired: false,
    audit: { findings: [], coverage: { complete: true } },
  })

  const { result } = renderHook(() => useLeagueTableImport(props))
  const club = PLAYERS_DATABASE_CLUBS_CATALOG[0]
  const pasteValue = [
    'מיקום\tקבוצה\tמשחקים\tניצחונות\tתיקו\tהפסדים\tשערי זכות\tשערי חובה\tנקודות',
    `1\t${club.name}\t0\t0\t0\t0\t0\t0\t0`,
  ].join('\n')

  act(() => {
    result.current.setSeasonStatus('not_started')
    result.current.setPasteValue(pasteValue)
  })
  await act(async () => result.current.handlePreview())
  expect(result.current.rows[0].teamSlot).toBe('1')
  expect(result.current.canConfirm).toBe(true)
  act(() => {
    expect(result.current.handleApproveForSync()).toBe(true)
  })
  await act(async () => result.current.executeApprovedImport())

  expect(result.current.executionStatus).toBe('failed')
  expect(result.current.retryMode).toBe('repair')
  expect(result.current.syncStages.find(stage => stage.id === 'canonical').state)
    .toBe('completed')
  expect(result.current.syncStages.find(stage => stage.id === 'leaguesCenter').state)
    .toBe('failed')

  await act(async () => result.current.retryApprovedImport())

  expect(loadLeague).toHaveBeenCalledTimes(1)
  expect(repairWriteActionReceipt).toHaveBeenCalledWith({ receiptId: 'receipt-1' })
  expect(result.current.executionStatus).toBe('succeeded')
})

test('locks a historical league season to completed when the import opens', () => {
  const historicalProps = {
    ...props,
    selectedSeasonOption: {
      ...props.selectedSeasonOption,
      season: {
        ...props.selectedSeasonOption.season,
        seasonKey: '25/26',
      },
    },
  }
  const { result } = renderHook(() => useLeagueTableImport(historicalProps))

  act(() => result.current.handleOpen())

  expect(result.current.historicalSeason).toBe(true)
  expect(result.current.seasonStatus).toBe('completed')
})

test('blocks an occupied team slot and allows selecting a free second-team slot', async () => {
  const club = PLAYERS_DATABASE_CLUBS_CATALOG[0]
  readOtherLeagueTeamOwners.mockResolvedValue({
    [`${club.id}_2008_1`]: ['u19-premier'],
  })
  const { result } = renderHook(() => useLeagueTableImport(props))
  const pasteValue = [
    'מיקום\tקבוצה\tמשחקים\tניצחונות\tתיקו\tהפסדים\tשערי זכות\tשערי חובה\tנקודות',
    `1\t${club.name}\t0\t0\t0\t0\t0\t0\t0`,
  ].join('\n')

  act(() => {
    result.current.setSeasonStatus('not_started')
    result.current.setPasteValue(pasteValue)
  })
  await act(async () => result.current.handlePreview())

  expect(result.current.rows[0]).toEqual(expect.objectContaining({
    teamSlot: '1',
    valid: false,
    requiresTeamSlotResolution: true,
  }))
  expect(result.current.rows[0].errors.join(' ')).toContain('כבר קיימת בעונה זו')
  expect(result.current.canConfirm).toBe(false)

  act(() => result.current.handleCellChange({
    rowIndex: 0,
    column: { key: 'teamSlot' },
    value: '2',
  }))

  expect(result.current.rows[0]).toEqual(expect.objectContaining({
    teamSlot: '2',
    valid: true,
    requiresTeamSlotResolution: false,
  }))
  expect(result.current.canConfirm).toBe(true)
})

test('reloads audit source with the approved input without accessing receipts', async () => {
  loadLeagueForAuditRepair.mockImplementation(async ({ onProgress }) => {
    onProgress({ type: 'stageCompleted', stageId: 'canonical' })
    onProgress({ type: 'stageCompleted', stageId: 'audit' })
    return { status: 'succeeded', executionStatus: 'succeeded', audit: { findings: [] } }
  })
  const { result } = renderHook(() => useLeagueTableImport({
    ...props, repairReload: true, repairSeasonId: '2026_2027',
  }))
  const club = PLAYERS_DATABASE_CLUBS_CATALOG[0]
  const pasteValue = [
    'מיקום\tקבוצה\tמשחקים\tניצחונות\tתיקו\tהפסדים\tשערי זכות\tשערי חובה\tנקודות',
    `1\t${club.name}\t0\t0\t0\t0\t0\t0\t0`,
  ].join('\n')

  act(() => {
    result.current.setSeasonStatus('not_started')
    result.current.setPasteValue(pasteValue)
  })
  await act(async () => result.current.handlePreview())
  act(() => expect(result.current.handleApproveForSync()).toBe(true))
  await act(async () => result.current.executeApprovedImport())

  expect(loadLeagueForAuditRepair).toHaveBeenCalledTimes(1)
  expect(loadLeagueForAuditRepair.mock.calls[0][0].input.season.seasonId).toBe('2026_2027')
  expect(loadLeague).not.toHaveBeenCalled()
  expect(getWriteActionReceipt).not.toHaveBeenCalled()
  expect(repairWriteActionReceipt).not.toHaveBeenCalled()
  expect(result.current.receiptId).toBe('')
  expect(result.current.executionStatus).toBe('succeeded')
  expect(result.current.syncStages.find(stage => stage.id === 'audit')).toEqual(expect.objectContaining({
    title: 'בדיקה חוזרת', state: 'completed',
  }))
})

test('blocks audit source approval when the selected season differs from the finding', () => {
  const { result } = renderHook(() => useLeagueTableImport({
    ...props, repairReload: true, repairSeasonId: '2025_2026',
  }))
  expect(result.current.repairContextValid).toBe(false)
  expect(result.current.canConfirm).toBe(false)
  act(() => expect(result.current.handleApproveForSync()).toBe(false))
  expect(loadLeagueForAuditRepair).not.toHaveBeenCalled()
})

// src/features/playersDatabase/ui/pages/teamPage/roster/clear/useClearRosterFlow.test.js

import { act, renderHook } from '@testing-library/react'
import useClearRosterFlow from './useClearRosterFlow.js'
import { clearRoster, prepareRosterClear } from '../../../../../services/write/roster/index.js'
import { retryWriteActionReceipt } from '../../../../../services/write/recovery/index.js'

jest.mock('../../../../../services/write/roster/index.js', () => ({
  clearRoster: jest.fn(),
  prepareRosterClear: jest.fn(),
}))
jest.mock('../../../../../services/write/recovery/index.js', () => ({
  retryWriteActionReceipt: jest.fn(),
}))

test('retry rebuilds the approved state from fresh sources and reuses the existing receipt', async () => {
  const firstApprovedState = {
    actionType: 'rosterClear',
    teamId: 'team-1',
    seasonId: '2025_2026',
    leagueId: 'league-history',
    clubId: 'club-1',
    canonical: { teamSeason: null },
    playerSeasons: [{ playerId: 'player-1' }],
    playerSearchIndexes: { deletes: ['player-1'] },
  }
  const secondApprovedState = {
    ...firstApprovedState,
    playerSeasons: [{ playerId: 'player-1' }, { playerId: 'player-2' }],
  }
  prepareRosterClear.mockResolvedValueOnce(firstApprovedState).mockResolvedValueOnce(secondApprovedState)
  clearRoster.mockRejectedValueOnce(Object.assign(new Error('offline'), { receiptId: 'receipt-1' }))
  retryWriteActionReceipt.mockResolvedValueOnce({
    receiptId: 'receipt-1',
    status: 'closed',
    stageResults: { canonical: {}, audit: {} },
    audit: { coverage: { complete: true }, findings: [] },
  })

  const historicalSeason = {
    seasonId: '2025_2026',
    seasonKey: '25/26',
    leagueId: 'league-history',
    deleteAction: 'roster',
  }
  const { result } = renderHook(() => useClearRosterFlow({
    team: { id: 'team-1', name: 'Team' },
    selectedSeasonOption: { seasonId: '2026_2027', seasonKey: '26/27', leagueId: 'league-1' },
  }))

  expect(result.current.getDeleteActionFor(historicalSeason)).toBe('roster')
  expect(prepareRosterClear).not.toHaveBeenCalled()

  await act(async () => result.current.openModal(historicalSeason))
  expect(prepareRosterClear).toHaveBeenCalledWith({
    input: {
      teamId: 'team-1',
      seasonId: '2025_2026',
      seasonKey: '25/26',
      leagueId: 'league-history',
    },
  })
  expect(result.current.proposal.approvedState).toBe(firstApprovedState)

  await act(async () => result.current.approve())
  await act(async () => result.current.next())
  expect(clearRoster).toHaveBeenCalledWith({
    approvedState: firstApprovedState,
    display: {
      teamName: 'Team',
      seasonKey: '25/26',
    },
  })
  expect(result.current.status).toBe('failed')

  await act(async () => result.current.retry())
  expect(prepareRosterClear).toHaveBeenCalledTimes(2)
  expect(result.current.proposal.approvedState).toBe(secondApprovedState)
  expect(result.current.status).toBe('preview')

  await act(async () => result.current.approve())
  await act(async () => result.current.next())
  expect(retryWriteActionReceipt).toHaveBeenCalledWith({
    receiptId: 'receipt-1',
    approvedState: secondApprovedState,
  })
  expect(result.current.status).toBe('succeeded')
})

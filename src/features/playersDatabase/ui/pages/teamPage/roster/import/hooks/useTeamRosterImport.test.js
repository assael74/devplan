// src/features/playersDatabase/ui/pages/teamPage/roster/import/hooks/useTeamRosterImport.test.js

import { act, renderHook } from '@testing-library/react'
import { loadRoster, prepareRosterLoad } from '../../../../../../services/write/roster/index.js'
import { getWriteActionReceipt } from '../../../../../../services/write/receipt/index.js'
import { repairWriteActionReceipt } from '../../../../../../services/write/recovery/index.js'
import { loadRosterForAuditRepair, prepareRosterForAuditRepair } from '../../../../../../services/audit/repair/reloadRoster.js'
import { readTeamSeasonRosterHistory } from '../../../../../../services/read/index.js'
import useTeamRosterImport from './useTeamRosterImport.js'

jest.mock('../../../../../../services/write/roster/index.js', () => ({ loadRoster: jest.fn(), prepareRosterLoad: jest.fn() }))
jest.mock('../../../../../../services/write/receipt/index.js', () => ({ getWriteActionReceipt: jest.fn() }))
jest.mock('../../../../../../services/write/recovery/index.js', () => ({ repairWriteActionReceipt: jest.fn() }))
jest.mock('../../../../../../services/audit/repair/reloadRoster.js', () => ({ loadRosterForAuditRepair: jest.fn(), prepareRosterForAuditRepair: jest.fn() }))
jest.mock('../../../../../../services/read/index.js', () => ({ readTeamSeasonRosterHistory: jest.fn(), listExistingTeamRootOptions: jest.fn(), buildMovementTeamOptions: jest.fn() }))
jest.mock('../../../../../../services/read/identity/canonicalPlayerIdentityPreview.read.js', () => ({ resolveCanonicalTeamPlayerIdentityPreview: jest.fn() }))

const teamId = 'club-a_2011_1'
const seasonId = '2025_2026'
const teamSeasonDocumentId = `${teamId}__${seasonId}`
const seasonOption = {
  optionKey: '25/26|2011|league-a|current',
  seasonId,
  seasonKey: '25/26',
  leagueId: 'league-a',
  birthYear: 2011,
  season: { seasonId, seasonKey: '25/26', seasonStatus: 'active' },
}
const approvedState = {
  teamId,
  seasonId,
  teamSeasonDocumentId,
  canonical: { teamSeason: { roster: { rosterImport: { contentHash: 'source-hash' } } } },
}
const props = {
  leagueId: 'league-a',
  leagueDoc: { leagueId: 'league-a' },
  team: { id: teamId, teamId, clubId: 'club-a', birthYear: 2011, teamSlot: 1 },
  seasonOptions: [seasonOption],
  selectedSeasonOption: seasonOption,
  teamSeasons: [],
  repairReload: true,
  notify: jest.fn(),
}
const stages = ['canonical', 'counterparts', 'playerSeasons', 'playerSearchIndexes', 'leagueProjection', 'leaguesCenter', 'clubsCenter', 'audit']

beforeEach(() => {
  jest.resetAllMocks()
  readTeamSeasonRosterHistory.mockResolvedValue({ previousSeason: null, currentSeason: null })
  prepareRosterForAuditRepair.mockResolvedValue(approvedState)
  loadRosterForAuditRepair.mockImplementation(async ({ onProgress }) => {
    stages.forEach(stageId => onProgress({ type: 'stageCompleted', stageId }))
    return { approvedState, executionStatus: 'succeeded', audit: { coverage: { complete: true }, findings: [] } }
  })
})

test('opens missing TeamSeason with canonical league context and completes reload without receipt calls', async () => {
  const { result, rerender } = renderHook(current => useTeamRosterImport(current), { initialProps: props })
  await act(async () => result.current.openModal())
  expect(result.current.selectedSeasonOption.seasonId).toBe(seasonId)
  await act(async () => result.current.preparePlan())
  expect(prepareRosterForAuditRepair).toHaveBeenCalledWith({ input: expect.objectContaining({
    leagueId: 'league-a',
    team: expect.objectContaining({ clubId: 'club-a', teamSlot: 1 }),
    season: expect.objectContaining({ seasonId }),
  }) })
  act(() => result.current.enterSync())
  await act(async () => result.current.executeApprovedImport())
  expect(result.current.executionStatus).toBe('succeeded')
  expect(result.current.syncComplete).toBe(false)
  expect(result.current.syncStages.find(stage => stage.id === 'audit').title).toBe('בדיקת סנכרון')
  rerender({ ...props, teamSeasons: [{ identity: { teamSeasonDocumentId }, roster: { rosterImport: { contentHash: 'source-hash' } } }] })
  expect(result.current.syncComplete).toBe(true)
  await act(async () => expect(await result.current.completeSync()).toBe(true))
  expect(result.current.open).toBe(false)
  ;[loadRoster, prepareRosterLoad, getWriteActionReceipt, repairWriteActionReceipt].forEach(action => expect(action).not.toHaveBeenCalled())
})

test('reload failure retains findings and stays on the independent path when retried', async () => {
  const failure = Object.assign(new Error('מקור נשמר חלקית'), { auditResult: { coverage: { complete: true }, findings: [{ type: 'missing_projection' }] } })
  loadRosterForAuditRepair.mockRejectedValue(failure)
  const { result } = renderHook(() => useTeamRosterImport(props))
  await act(async () => result.current.openModal())
  await act(async () => result.current.preparePlan())
  act(() => result.current.enterSync())
  await act(async () => result.current.executeApprovedImport())
  expect(result.current.executionStatus).toBe('failed')
  expect(result.current.auditResult.findings).toHaveLength(1)
  expect(result.current.syncComplete).toBe(false)
  await act(async () => result.current.executeApprovedImport())
  expect(loadRosterForAuditRepair).toHaveBeenCalledTimes(2)
  expect(getWriteActionReceipt).not.toHaveBeenCalled()
  expect(repairWriteActionReceipt).not.toHaveBeenCalled()
})

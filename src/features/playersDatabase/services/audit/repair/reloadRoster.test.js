// src/features/playersDatabase/services/audit/repair/reloadRoster.test.js

import { loadRosterForAuditRepair } from './reloadRoster.js'
import { buildRosterLoadWritePlan } from '../../../domain/roster/index.js'
import { readRosterLoadSources } from '../../write/roster/readRosterWriteSources.js'
import { writeRosterCanonical } from '../../write/roster/writeRosterCanonical.js'
import { writeRosterCounterparts } from '../../write/roster/writeRosterCounterparts.js'
import { writeRosterPlayerSeasons } from '../../write/roster/writeRosterPlayerSeasons.js'
import { writeRosterPlayerSearchIndexes } from '../../write/roster/writeRosterPlayerSearchIndexes.js'
import { writeRosterLeagueProjection } from '../../write/roster/writeRosterLeagueProjection.js'
import { writeRosterLeaguesCenter } from '../../write/roster/writeRosterLeaguesCenter.js'
import { writeRosterClubsCenter } from '../../write/roster/writeRosterClubsCenter.js'
import { auditRoster } from '../roster/index.js'

jest.mock('../../../domain/roster/index.js', () => ({ buildRosterLoadWritePlan: jest.fn() }))
jest.mock('../../write/roster/readRosterWriteSources.js', () => ({ readRosterLoadSources: jest.fn() }))
jest.mock('../../write/roster/writeRosterCanonical.js', () => ({ writeRosterCanonical: jest.fn() }))
jest.mock('../../write/roster/writeRosterCounterparts.js', () => ({ writeRosterCounterparts: jest.fn() }))
jest.mock('../../write/roster/writeRosterPlayerSeasons.js', () => ({ writeRosterPlayerSeasons: jest.fn() }))
jest.mock('../../write/roster/writeRosterPlayerSearchIndexes.js', () => ({ writeRosterPlayerSearchIndexes: jest.fn() }))
jest.mock('../../write/roster/writeRosterLeagueProjection.js', () => ({ writeRosterLeagueProjection: jest.fn() }))
jest.mock('../../write/roster/writeRosterLeaguesCenter.js', () => ({ writeRosterLeaguesCenter: jest.fn() }))
jest.mock('../../write/roster/writeRosterClubsCenter.js', () => ({ writeRosterClubsCenter: jest.fn() }))
jest.mock('../roster/index.js', () => ({ auditRoster: jest.fn() }))

beforeEach(() => {
  jest.resetAllMocks()
  readRosterLoadSources.mockResolvedValue({ existingTeamRoot: { identity: { teamId: 'a' } }, existingTeamSeason: null })
  buildRosterLoadWritePlan.mockReturnValue({ actionType: 'rosterLoad', teamId: 'a', seasonId: '2025_2026', leagueId: 'l', teamSeasonDocumentId: 'a__2025_2026' })
  auditRoster.mockResolvedValue({ findings: [], coverage: { complete: true } })
})

test('requires confirmation before source reads or writes', async () => {
  await expect(loadRosterForAuditRepair({ input: {} })).rejects.toThrow('אישור')
  expect(readRosterLoadSources).not.toHaveBeenCalled()
  expect(writeRosterCanonical).not.toHaveBeenCalled()
})

test('rebuilds from fresh canonical sources, runs writers in order and verifies without receipts', async () => {
  const progress = jest.fn()
  const result = await loadRosterForAuditRepair({ input: { existingTeamRoot: { stale: true } }, confirmed: true, onProgress: progress })
  expect(buildRosterLoadWritePlan).toHaveBeenCalledWith(expect.objectContaining({ existingTeamRoot: { identity: { teamId: 'a' } }, existingTeamSeason: null }))
  const writers = [writeRosterCanonical, writeRosterCounterparts, writeRosterPlayerSeasons, writeRosterPlayerSearchIndexes, writeRosterLeagueProjection, writeRosterLeaguesCenter, writeRosterClubsCenter]
  writers.forEach(write => expect(write).toHaveBeenCalledWith({ approvedState: result.approvedState }))
  expect(progress.mock.calls.map(([event]) => event.stageId)).toEqual(['canonical', 'counterparts', 'playerSeasons', 'playerSearchIndexes', 'leagueProjection', 'leaguesCenter', 'clubsCenter', 'audit'])
  expect(result.executionStatus).toBe('succeeded')
  expect(result.receiptId).toBeUndefined()
})

test('stops on partial write and returns fresh findings on the thrown failure', async () => {
  const error = new Error('failed')
  writeRosterPlayerSeasons.mockRejectedValue(error)
  await expect(loadRosterForAuditRepair({ confirmed: true })).rejects.toBe(error)
  expect(writeRosterPlayerSearchIndexes).not.toHaveBeenCalled()
  expect(error.auditResult.coverage.complete).toBe(true)
})

test('remaining findings or incomplete coverage cannot report success', async () => {
  auditRoster.mockResolvedValue({ findings: [{ type: 'mismatch' }], coverage: { complete: true } })
  expect((await loadRosterForAuditRepair({ confirmed: true })).executionStatus).toBe('failed')
  auditRoster.mockResolvedValue({ findings: [], coverage: { complete: false } })
  expect((await loadRosterForAuditRepair({ confirmed: true })).executionStatus).toBe('failed')
})

test('verification failure after writes explicitly reports that the source was saved', async () => {
  auditRoster.mockRejectedValue(new Error('network'))
  await expect(loadRosterForAuditRepair({ confirmed: true })).rejects.toThrow('הסגל נשמר')
  expect(writeRosterClubsCenter).toHaveBeenCalledTimes(1)
})

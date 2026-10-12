// src/features/playersDatabase/services/audit/repair/reloadLeague.test.js

import { loadLeagueForAuditRepair } from './reloadLeague.js'
import { buildLeagueLoadWritePlan } from '../../../domain/league/index.js'
import { readLeagueLoadSources } from '../../write/league/readLeagueWriteSources.js'
import { writeLeagueCanonical } from '../../write/league/writeLeagueCanonical.js'
import { writeTeamSeasonCompetitionSnapshots } from '../../write/league/writeTeamSeasonCompetitionSnapshots.js'
import { writeLeaguesCenter } from '../../write/league/writeLeaguesCenter.js'
import { writeClubsCenter } from '../../write/league/writeClubsCenter.js'
import { auditLeague } from '../league/index.js'

jest.mock('../../../domain/league/index.js', () => ({ buildLeagueLoadWritePlan: jest.fn(), buildLeagueOpenWritePlan: jest.fn() }))
jest.mock('../../write/league/readLeagueWriteSources.js', () => ({ readLeagueLoadSources: jest.fn() }))
jest.mock('../../write/league/writeLeagueCanonical.js', () => ({ writeLeagueCanonical: jest.fn() }))
jest.mock('../../write/league/writeTeamSeasonCompetitionSnapshots.js', () => ({ writeTeamSeasonCompetitionSnapshots: jest.fn() }))
jest.mock('../../write/league/writeLeaguesCenter.js', () => ({ writeLeaguesCenter: jest.fn() }))
jest.mock('../../write/league/writeClubsCenter.js', () => ({ writeClubsCenter: jest.fn() }))
jest.mock('../league/index.js', () => ({ auditLeague: jest.fn() }))

beforeEach(() => {
  jest.resetAllMocks()
  readLeagueLoadSources.mockResolvedValue({ existingLeague: { leagueId: 'a' } })
  buildLeagueLoadWritePlan.mockReturnValue({ leagueId: 'a', seasonId: '2025_2026' })
  auditLeague.mockResolvedValue({ findings: [], coverage: { complete: true } })
})

test('uses fresh source data, canonical writers and verification without a receipt', async () => {
  const result = await loadLeagueForAuditRepair({ input: { existingLeague: { leagueId: 'stale' }, rows: [] } })
  expect(buildLeagueLoadWritePlan).toHaveBeenCalledWith(expect.objectContaining({ existingLeague: { leagueId: 'a' } }))
  ;[writeLeagueCanonical, writeTeamSeasonCompetitionSnapshots, writeLeaguesCenter, writeClubsCenter].forEach(write => expect(write).toHaveBeenCalledTimes(1))
  expect(result.executionStatus).toBe('succeeded')
  expect(result.receiptId).toBeUndefined()
})

test('stops after a failed stage and exposes a fresh audit', async () => {
  const error = new Error('write failed')
  writeTeamSeasonCompetitionSnapshots.mockRejectedValue(error)
  await expect(loadLeagueForAuditRepair({ input: {} })).rejects.toBe(error)
  expect(writeLeaguesCenter).not.toHaveBeenCalled()
  expect(error.auditResult).toBeDefined()
})

test('remaining findings never result in success', async () => {
  auditLeague.mockResolvedValue({ findings: [{ type: 'missing_projection' }], coverage: { complete: true } })
  expect((await loadLeagueForAuditRepair({ input: {} })).executionStatus).toBe('failed')
})

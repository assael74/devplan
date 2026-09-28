// src/features/playersDatabase/services/auditV2/league/auditClearedLeagueTeams.test.js

import { auditLeagueWithoutTeams } from './auditClearedLeagueTeams.js'
import { readClearLeagueSources } from '../../writeV2/league/clear/readClearLeagueTeams.js'
import { buildClearLeagueTeamsPlan, resolveClearLeagueScope } from '../../../domain/leagueV2/clear/clearLeagueTeamsPlan.builder.js'

jest.mock('../../writeV2/league/clear/readClearLeagueTeams.js', () => ({ readClearLeagueSources: jest.fn() }))
jest.mock('../../../domain/leagueV2/clear/clearLeagueTeamsPlan.builder.js', () => ({ buildClearLeagueTeamsPlan: jest.fn(), resolveClearLeagueScope: jest.fn() }))

beforeEach(() => {
  jest.resetAllMocks()
  readClearLeagueSources.mockResolvedValue({ roots: [] })
  resolveClearLeagueScope.mockReturnValue({ identity: { birthYear: 2012 }, seasons: [], scopedIndexes: [] })
})

test('missing optional Identity is clean when no entries or other differences remain', async () => {
  buildClearLeagueTeamsPlan.mockReturnValue({ operations: [] })
  const audit = await auditLeagueWithoutTeams({ leagueId: 'league', seasonKey: '26/27' })
  expect(audit.result).toBe('clean')
  expect(audit.coverage.complete).toBe(true)
  expect(readClearLeagueSources).toHaveBeenCalledTimes(1)
})

test('a stale empty Identity document is a finding, not success', async () => {
  buildClearLeagueTeamsPlan.mockReturnValue({ operations: [{ kind: 'identity', docId: 'empty', before: { entries: [] }, patch: null }] })
  const audit = await auditLeagueWithoutTeams({ leagueId: 'league', seasonKey: '26/27' })
  expect(audit.result).toBe('findings')
  expect(audit.findings[0].documentId).toBe('empty')
})

test('failed server reads are partial and cannot close a receipt', async () => {
  readClearLeagueSources.mockRejectedValue(new Error('offline'))
  const audit = await auditLeagueWithoutTeams({ leagueId: 'league', seasonKey: '26/27' })
  expect(audit.result).toBe('partial')
  expect(audit.coverage.complete).toBe(false)
})

test('a newly created season is clean using actual absence builders, without a Clear receipt', async () => {
  const domain = jest.requireActual('../../../domain/leagueV2/clear/clearLeagueTeamsPlan.builder.js')
  const master = jest.requireActual('../../../domain/projections/leaguesMaster.projection.js')
  const league = {
    id: 'league', leagueId: 'league', ageGroupId: 'u15',
    current: { seasonId: '28', seasonKey: '26/27', birthYear: 2012, tableRank: null }, history: [],
  }
  const entries = [master.buildLeaguesMasterLeagueEntry(league)]
  readClearLeagueSources.mockResolvedValue({
    leagues: [{ docId: 'league', data: league }],
    roots: [], teamSeasons: [], indexes: [], identities: [], clubs: [], clubsMaster: null,
    leaguesMaster: { leagues: entries, summary: master.buildLeaguesMasterSummary(entries) },
  })
  resolveClearLeagueScope.mockImplementation(domain.resolveClearLeagueScope)
  buildClearLeagueTeamsPlan.mockImplementation(domain.buildClearLeagueTeamsPlan)
  const result = await auditLeagueWithoutTeams({ leagueId: 'league', seasonKey: '26/27' })
  expect(result.result).toBe('clean')
  expect(result.findings).toEqual([])
})

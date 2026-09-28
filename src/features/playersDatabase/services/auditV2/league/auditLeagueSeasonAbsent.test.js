// src/features/playersDatabase/services/auditV2/league/auditLeagueSeasonAbsent.test.js

import { auditLeagueV2 } from './index.js'
import { readLeagueCanonicalV2 } from './readCanonical.js'
import { readClearLeagueSources } from '../../writeV2/league/clear/readClearLeagueTeams.js'
import { buildCanonicalLeaguesMasterPatch } from '../../../domain/leagueV2/deleteSeason/deleteLeagueSeason.builder.js'

jest.mock('./readCanonical.js', () => ({ readLeagueCanonicalV2: jest.fn() }))
jest.mock('./buildExpected.js', () => ({ buildExpectedLeagueAuditV2: jest.fn() }))
jest.mock('./readActual.js', () => ({ readActualLeagueAuditV2: jest.fn() }))
jest.mock('./compare.js', () => ({ compareLeagueAuditV2: jest.fn() }))
jest.mock('../../writeV2/league/clear/readClearLeagueTeams.js', () => ({ readClearLeagueSources: jest.fn() }))
const identity = { leagueId: 'league', seasonKey: '26/27' }
let sources
beforeEach(() => {
  jest.resetAllMocks()
  const leagues = [{ docId: 'league', data: { id: 'league', current: null, history: [] } }]
  sources = { leagues, roots: [], teamSeasons: [], indexes: [], identities: [], clubs: [], clubsMaster: null,
    leaguesMaster: buildCanonicalLeaguesMasterPatch(leagues) }
  readClearLeagueSources.mockImplementation(async () => sources)
})
test('explicit absent lifecycle succeeds while retaining League and Master identities', async () => {
  const result = await auditLeagueV2({ ...identity, expectedLifecycle: 'season_absent' })
  expect(result.result).toBe('clean')
  expect(readLeagueCanonicalV2).not.toHaveBeenCalled()
})
test('absence is not inferred by the default audit entry point', async () => {
  readLeagueCanonicalV2.mockRejectedValue(new Error('Season missing'))
  await expect(auditLeagueV2(identity)).rejects.toThrow('Season missing')
  expect(readClearLeagueSources).not.toHaveBeenCalled()
})
test('missing League root is a finding even with an absent season', async () => {
  sources.leagues = []
  const result = await auditLeagueV2({ ...identity, expectedLifecycle: 'season_absent' })
  expect(result.result).not.toBe('clean')
  expect(result.findings[0]).toMatchObject({ type: 'missing_document', target: 'league' })
})
test('stale Master prevents successful completion', async () => {
  sources.leaguesMaster.leagues[0].seasons = [{ seasonKey: '26/27' }]
  const result = await auditLeagueV2({ ...identity, expectedLifecycle: 'season_absent' })
  expect(result.result).toBe('findings')
})

test('an unrelated ClubsMaster competition-path mismatch does not fail the scoped absence audit', async () => {
  sources.clubs = [{ docId: 'club', data: { clubId: 'club', ageGroups: [], competitionPaths: [] } }]
  sources.clubsMaster = { clubs: [{ clubId: 'club', ageGroups: [], competitionPaths: [{ birthYear: 2012, projectedNextLeagueLevel: 2 }] }] }
  const result = await auditLeagueV2({ ...identity, expectedLifecycle: 'season_absent' })
  expect(result.result).toBe('clean')
  expect(result.coverage.complete).toBe(true)
  expect(result.coverage.coveredTargets).toContain('clubsMaster')
})

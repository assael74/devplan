// src/features/playersDatabase/services/audit/stats/index.test.js

import { buildStatsAuditExpected } from './buildExpected.js'
import { compareStatsAudit } from './compare.js'
import { auditStats } from './index.js'
import { readStatsAuditActual } from './readActual.js'
import { readExpectedTeamSignals } from '../signals/readExpectedTeamSignals.js'

jest.mock('./buildExpected.js', () => ({ buildStatsAuditExpected: jest.fn() }))
jest.mock('./compare.js', () => ({ compareStatsAudit: jest.fn() }))
jest.mock('./readActual.js', () => ({ readStatsAuditActual: jest.fn() }))
jest.mock('../signals/readExpectedTeamSignals.js', () => ({ readExpectedTeamSignals: jest.fn() }))

beforeEach(() => readExpectedTeamSignals.mockResolvedValue(new Map()))

test('passes a canonically recomputed summary into the focused comparison', async () => {
  const summary = { familiesById: { 'club-gap': { level: 1, availability: 'partial' } } }
  readStatsAuditActual.mockResolvedValue({ teamSeason: { identity: { clubId: 'club', teamId: 'team' } } })
  buildStatsAuditExpected.mockReturnValue({ complete: true, expected: {} })
  compareStatsAudit.mockReturnValue([])
  readExpectedTeamSignals.mockResolvedValue(new Map([['team__2026_2027', summary]]))
  await auditStats({ leagueId: 'league', teamId: 'team', seasonId: '2026_2027' })
  expect(readExpectedTeamSignals).toHaveBeenCalledWith({ clubIds: ['club'] })
  expect(compareStatsAudit).toHaveBeenCalledWith(expect.objectContaining({ expectedSignalSummary: summary }))
})

test('audits approved non-roster player projections as well as roster players', async () => {
  readStatsAuditActual.mockResolvedValue({})
  buildStatsAuditExpected.mockReturnValue({ complete: true, reason: '', expected: {} })
  compareStatsAudit.mockReturnValue([])

  await auditStats({
    leagueId: 'league-1',
    teamId: 'team-1',
    seasonId: '2026_2027',
    approvedState: {
      playerRootPlans: [],
      playerSeasonPlans: [{ playerId: 'player-1' }],
      playerSearchIndexPlans: [{ playerId: 'player-1' }, { playerId: 'player-2' }],
    },
  })

  expect(readStatsAuditActual).toHaveBeenCalledWith(expect.objectContaining({
    playerIds: ['player-1', 'player-2'],
  }))
})

test('passes a focused player scope through the read and expected phases', async () => {
  readStatsAuditActual.mockResolvedValue({})
  buildStatsAuditExpected.mockReturnValue({ complete: true, reason: '', expected: {} })
  compareStatsAudit.mockReturnValue([])

  await auditStats({
    leagueId: 'league-1',
    teamId: 'team-1',
    seasonId: '2026_2027',
    scopedPlayerIds: ['player-1'],
  })

  expect(readStatsAuditActual).toHaveBeenCalledWith(expect.objectContaining({
    scopedPlayerIds: ['player-1'],
  }))
  expect(buildStatsAuditExpected).toHaveBeenCalledWith(expect.objectContaining({
    scopedPlayerIds: ['player-1'],
  }))
})

test('returns clean when roster lifecycle has not started', async () => {
  readStatsAuditActual.mockResolvedValue({ teamRoot: null, teamSeason: null })
  buildStatsAuditExpected.mockReturnValue({
    complete: true,
    applicable: false,
    reason: 'no_roster',
    expected: null,
  })
  compareStatsAudit.mockReturnValue([])

  const result = await auditStats({
    leagueId: 'league-1',
    teamId: 'team-1',
    seasonId: '2026_2027',
  })

  expect(result.status).toBe('CLEAN')
  expect(result.findings).toEqual([])
  expect(result.coverage.complete).toBe(true)
  expect(result.coverage.coveredTargets).toContain('teamRoot')
})

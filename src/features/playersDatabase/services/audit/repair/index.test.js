// src/features/playersDatabase/services/audit/repair/index.test.js

import { auditLeague } from '../league/index.js'
import { auditStats } from '../stats/index.js'
import { repairLeagueFinding } from './repairLeagueFinding.js'
import { repairStatsFinding } from './repairStatsFinding.js'
import { inspectFocusedAuditRepair, repairFocusedAuditFinding } from './index.js'

jest.mock('../league/index.js', () => ({ auditLeague: jest.fn() }))
jest.mock('../stats/index.js', () => ({ auditStats: jest.fn() }))
jest.mock('./repairLeagueFinding.js', () => ({ repairLeagueFinding: jest.fn() }))
jest.mock('./repairStatsFinding.js', () => ({ repairStatsFinding: jest.fn() }))

const scope = {
  type: 'team', leagueId: 'league-1', seasonId: '2026_2027', teamId: 'club_2011_1',
}
const finding = {
  type: 'projection_mismatch', target: 'leagueMetadata', documentId: 'league-1', field: 'stats',
  expected: { hasStats: true }, actual: { hasStats: false },
}
const cleanAudit = { findings: [], status: 'CLEAN' }

beforeEach(() => {
  jest.resetAllMocks()
  repairStatsFinding.mockResolvedValue({})
  repairLeagueFinding.mockResolvedValue({})
})

test('requires confirmation before reading or writing', async () => {
  await expect(repairFocusedAuditFinding({ scope, finding })).rejects.toThrow('לאשר')
  expect(auditStats).not.toHaveBeenCalled()
  expect(repairStatsFinding).not.toHaveBeenCalled()
})

test('rejects canonical repairs before writing', async () => {
  const missing = { type: 'missing_canonical_dependency', target: 'statsAudit' }
  expect(inspectFocusedAuditRepair({ scope, finding: missing }).allowed).toBe(false)
  await expect(repairFocusedAuditFinding({ scope, finding: missing, confirmed: true }))
    .rejects.toThrow('מסמך המקור')
  expect(auditStats).not.toHaveBeenCalled()
})

test('rejects unsupported scope and targets', () => {
  expect(inspectFocusedAuditRepair({ scope: { ...scope, type: 'system' }, finding }).allowed).toBe(false)
  expect(inspectFocusedAuditRepair({ scope, finding: { ...finding, target: 'playerRoot' } }).allowed).toBe(false)
  expect(inspectFocusedAuditRepair({ scope, finding: { ...finding, target: 'constructor' } }).allowed).toBe(false)
})

test('skips a stale finding absent from the fresh audit', async () => {
  auditStats.mockResolvedValue(cleanAudit)
  await expect(repairFocusedAuditFinding({ scope, finding, confirmed: true }))
    .resolves.toEqual({ audit: cleanAudit, repaired: false, skipped: true })
  expect(repairStatsFinding).not.toHaveBeenCalled()
})

test('writes from the fresh finding instead of the UI expected payload and verifies afterward', async () => {
  const freshFinding = { ...finding, expected: { hasStats: false }, actual: { hasStats: true } }
  auditStats.mockResolvedValueOnce({ findings: [freshFinding] }).mockResolvedValueOnce(cleanAudit)
  await expect(repairFocusedAuditFinding({ scope, finding, confirmed: true }))
    .resolves.toEqual({ audit: cleanAudit, repaired: true, skipped: false })
  expect(repairStatsFinding).toHaveBeenCalledWith({
    scope: { ...scope, playerId: '' }, finding: freshFinding,
  })
  expect(auditStats).toHaveBeenCalledTimes(2)
  expect(repairLeagueFinding).not.toHaveBeenCalled()
})

test('preserves the selected player scope during both audits', async () => {
  const playerScope = { ...scope, type: 'player', playerId: 'player__2011__123' }
  auditStats.mockResolvedValueOnce({ findings: [finding] }).mockResolvedValueOnce(cleanAudit)
  await repairFocusedAuditFinding({ scope: playerScope, finding, confirmed: true })
  expect(auditStats).toHaveBeenNthCalledWith(1, {
    leagueId: scope.leagueId, teamId: scope.teamId, seasonId: scope.seasonId,
    scopedPlayerIds: [playerScope.playerId],
  })
  expect(auditStats).toHaveBeenNthCalledWith(2, {
    leagueId: scope.leagueId, teamId: scope.teamId, seasonId: scope.seasonId,
    scopedPlayerIds: [playerScope.playerId],
  })
})

test('dispatches league projections independently of team and player repairs', async () => {
  const leagueScope = { type: 'league', leagueId: scope.leagueId, seasonId: scope.seasonId }
  const leagueFinding = { ...finding, target: 'leaguesCenter', documentId: 'all' }
  auditLeague.mockResolvedValueOnce({ findings: [leagueFinding] }).mockResolvedValueOnce(cleanAudit)
  await repairFocusedAuditFinding({ scope: leagueScope, finding: leagueFinding, confirmed: true })
  expect(repairLeagueFinding).toHaveBeenCalledTimes(1)
  expect(repairStatsFinding).not.toHaveBeenCalled()
  expect(auditStats).not.toHaveBeenCalled()
})

test('does not claim success when the finding remains after writing', async () => {
  const audit = { findings: [finding] }
  auditStats.mockResolvedValue(audit)
  await expect(repairFocusedAuditFinding({ scope, finding, confirmed: true }))
    .resolves.toEqual({ audit, repaired: false, skipped: false })
})

test('returns a fresh audit on write failure without concealing the error', async () => {
  const failure = new Error('כתיבה נכשלה')
  repairStatsFinding.mockRejectedValue(failure)
  auditStats.mockResolvedValueOnce({ findings: [finding] }).mockResolvedValueOnce(cleanAudit)
  await expect(repairFocusedAuditFinding({ scope, finding, confirmed: true })).rejects.toBe(failure)
  expect(failure.auditResult).toEqual(cleanAudit)
  expect(auditStats).toHaveBeenCalledTimes(2)
})

test('reports verification failure after a successful write without claiming completion', async () => {
  auditStats.mockResolvedValueOnce({ findings: [finding] }).mockRejectedValueOnce(new Error('offline'))
  await expect(repairFocusedAuditFinding({ scope, finding, confirmed: true }))
    .rejects.toThrow('הבדיקה החוזרת נכשלה')
  expect(repairStatsFinding).toHaveBeenCalledTimes(1)
})

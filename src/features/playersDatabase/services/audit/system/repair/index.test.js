// src/features/playersDatabase/services/audit/system/repair/index.test.js

import { auditSystem } from '../index.js'
import { readSystemAuditActual } from '../readActual.js'
import { evaluateSystemIntegrity } from '../evaluate.js'
import { buildSystemRepairPlan } from './systemRepairPlan.js'
import { buildSourceRepairPlan } from './sourceRepairPlan.js'
import { buildLeagueOwnershipRepairPlan } from './leagueOwnershipRepairPlan.js'
import { writeSystemAuditRepair } from '../../../write/audit/writeSystemAuditRepair.js'
import { refreshTeamSignalSummaries } from '../../../write/signals/refreshTeamSignalSummaries.js'
import { prepareSystemAuditRepair, repairSystemAuditFinding } from './index.js'

jest.mock('../index.js', () => ({ auditSystem: jest.fn() }))
jest.mock('../readActual.js', () => ({ readSystemAuditActual: jest.fn() }))
jest.mock('../evaluate.js', () => ({ evaluateSystemIntegrity: jest.fn() }))
jest.mock('./systemRepairPlan.js', () => ({ buildSystemRepairPlan: jest.fn() }))
jest.mock('./sourceRepairPlan.js', () => ({ buildSourceRepairPlan: jest.fn() }))
jest.mock('./leagueOwnershipRepairPlan.js', () => ({ buildLeagueOwnershipRepairPlan: jest.fn() }))
jest.mock('../../../write/audit/writeSystemAuditRepair.js', () => ({ writeSystemAuditRepair: jest.fn() }))
jest.mock('../../../write/signals/refreshTeamSignalSummaries.js', () => ({
  ...jest.requireActual('../../../write/signals/refreshTeamSignalSummaries.js'),
  refreshTeamSignalSummaries: jest.fn(),
}))

const finding = { type: 'projection_mismatch', target: 'clubsDirectory', documentId: 'all', title: 'פער' }
const plan = () => ({
  supported: true, allowed: true, fields: [], label: 'תיקון',
  changes: [{ target: 'clubsDirectory', documentId: 'all', before: { clubs: [] }, after: { clubs: ['א'] }, summary: 'ספרייה' }],
  guards: [{ target: 'clubProfiles', documentId: 'a', before: { clubId: 'a' } }],
})

beforeEach(() => {
  jest.resetAllMocks()
  readSystemAuditActual.mockResolvedValue({ clubsDirectory: [] })
  evaluateSystemIntegrity.mockReturnValue([finding])
  buildLeagueOwnershipRepairPlan.mockReturnValue({ supported: false })
  buildSourceRepairPlan.mockReturnValue({ supported: false })
  buildSystemRepairPlan.mockImplementation(plan)
  auditSystem.mockResolvedValue({ findings: [] })
})

test('preparation previews changes without writing or returning persisted document contents', async () => {
  const preview = await prepareSystemAuditRepair({ finding })
  expect(preview.allowed).toBe(true)
  expect(preview.changes).toEqual([{ target: 'clubsDirectory', documentId: 'all', summary: 'ספרייה', action: 'update' }])
  expect(writeSystemAuditRepair).not.toHaveBeenCalled()
  expect(refreshTeamSignalSummaries).not.toHaveBeenCalled()
})

test('requires confirmation and a prepared proposal', async () => {
  await expect(repairSystemAuditFinding({ finding })).rejects.toThrow('לאשר')
  expect(readSystemAuditActual).not.toHaveBeenCalled()
})

test('rebuilds from fresh sources and rejects a changed proposal before writing', async () => {
  const preview = await prepareSystemAuditRepair({ finding })
  buildSystemRepairPlan.mockReturnValue({ ...plan(), guards: [] })
  await expect(repairSystemAuditFinding({ finding, confirmed: true, previewKey: preview.previewKey }))
    .rejects.toThrow('השתנתה')
  expect(writeSystemAuditRepair).not.toHaveBeenCalled()
})

test('skips an already resolved finding and refreshes the audit', async () => {
  evaluateSystemIntegrity.mockReturnValue([])
  const preview = await prepareSystemAuditRepair({ finding })
  expect(preview.skipped).toBe(true)
  expect(preview.audit).toEqual({ findings: [] })
  expect(writeSystemAuditRepair).not.toHaveBeenCalled()
})

test('writes the fresh plan and verifies with the anchored checks', async () => {
  const preview = await prepareSystemAuditRepair({ finding })
  const result = await repairSystemAuditFinding({ finding, checks: ['projectionSync'], confirmed: true, previewKey: preview.previewKey })
  expect(writeSystemAuditRepair).toHaveBeenCalledWith({ changes: plan().changes, guards: plan().guards })
  expect(auditSystem).toHaveBeenCalledWith({ checks: ['projectionSync'] })
  expect(result).toMatchObject({ repaired: true, skipped: false })
  expect(refreshTeamSignalSummaries).not.toHaveBeenCalled()
})

test.each(['leagues', 'teamSeasons', 'clubProfiles'])('refreshes affected clubs after %s repair and before verification', async target => {
  const changes = [{
    target, documentId: target === 'clubProfiles' ? 'club-a' : 'source',
    before: target === 'clubProfiles' ? null : { identity: { clubId: 'club-a' }, notes: { clubId: 'ignored' } },
    after: target === 'clubProfiles' ? { clubLevel: 2 } : { identity: { clubId: 'club-b' } },
  }]
  buildSystemRepairPlan.mockReturnValue({ ...plan(), changes })
  const preview = await prepareSystemAuditRepair({ finding })
  expect(preview.description).toContain('סיכומי האיתותים')
  expect(refreshTeamSignalSummaries).not.toHaveBeenCalled()
  await repairSystemAuditFinding({ finding, confirmed: true, previewKey: preview.previewKey })
  expect(refreshTeamSignalSummaries).toHaveBeenCalledWith({
    clubIds: target === 'clubProfiles' ? ['club-a'] : ['club-a', 'club-b'],
  })
  expect(writeSystemAuditRepair.mock.invocationCallOrder[0])
    .toBeLessThan(refreshTeamSignalSummaries.mock.invocationCallOrder[0])
  expect(refreshTeamSignalSummaries.mock.invocationCallOrder[0])
    .toBeLessThan(auditSystem.mock.invocationCallOrder[0])
})

test('a signal refresh failure is returned with a fresh audit instead of repair success', async () => {
  buildSystemRepairPlan.mockReturnValue({ ...plan(), changes: [{
    target: 'clubProfiles', documentId: 'club-a', before: null, after: { clubLevel: 2 },
  }] })
  const preview = await prepareSystemAuditRepair({ finding })
  const error = new Error('signal refresh failed')
  refreshTeamSignalSummaries.mockRejectedValue(error)
  await expect(repairSystemAuditFinding({ finding, confirmed: true, previewKey: preview.previewKey }))
    .rejects.toBe(error)
  expect(error.auditResult).toEqual({ findings: [] })
})

test('profile completion includes movement dependents but does not refresh unrelated Center clubs', async () => {
  buildSystemRepairPlan.mockReturnValue({ ...plan(), changes: [
    { target: 'clubProfiles', documentId: 'club-a', before: null, after: { clubLevel: 2 } },
    { target: 'leaguesCenter', documentId: 'all', before: {}, after: { teams: [{ clubId: 'unrelated' }] } },
  ] })
  readSystemAuditActual.mockResolvedValue({ teamSeasons: [{ data: {
    identity: { clubId: 'departure-club' },
    movement: { transfersOutById: { departure: { toClubId: 'club-a' } } },
  } }] })
  const preview = await prepareSystemAuditRepair({ finding })
  await repairSystemAuditFinding({ finding, confirmed: true, previewKey: preview.previewKey })
  expect(refreshTeamSignalSummaries).toHaveBeenCalledWith({ clubIds: ['club-a', 'departure-club'] })
})

test('a changed dependent-club scope invalidates the prepared proposal before writing', async () => {
  buildSystemRepairPlan.mockReturnValue({ ...plan(), changes: [{
    target: 'clubProfiles', documentId: 'club-a', before: null, after: { clubLevel: 2 },
  }] })
  const preview = await prepareSystemAuditRepair({ finding })
  readSystemAuditActual.mockResolvedValue({ teamSeasons: [{ data: {
    identity: { clubId: 'new-dependent-club' },
    movement: { transfersOutById: { departure: { toClubId: 'club-a' } } },
  } }] })
  await expect(repairSystemAuditFinding({ finding, confirmed: true, previewKey: preview.previewKey }))
    .rejects.toThrow('השתנתה')
  expect(writeSystemAuditRepair).not.toHaveBeenCalled()
  expect(refreshTeamSignalSummaries).not.toHaveBeenCalled()
})

test('does not claim success when verification still reports the finding', async () => {
  auditSystem.mockResolvedValue({ findings: [finding] })
  const preview = await prepareSystemAuditRepair({ finding })
  const result = await repairSystemAuditFinding({ finding, confirmed: true, previewKey: preview.previewKey })
  expect(result.repaired).toBe(false)
})

test('returns a fresh audit on write failure', async () => {
  const preview = await prepareSystemAuditRepair({ finding })
  const error = new Error('כתיבה נכשלה')
  writeSystemAuditRepair.mockRejectedValue(error)
  await expect(repairSystemAuditFinding({ finding, confirmed: true, previewKey: preview.previewKey })).rejects.toBe(error)
  expect(error.auditResult).toEqual({ findings: [] })
  expect(refreshTeamSignalSummaries).not.toHaveBeenCalled()
})

test('verification failure is not reported as success', async () => {
  const preview = await prepareSystemAuditRepair({ finding })
  auditSystem.mockRejectedValue(new Error('offline'))
  await expect(repairSystemAuditFinding({ finding, confirmed: true, previewKey: preview.previewKey })).rejects.toThrow('הבדיקה החוזרת נכשלה')
})

// src/features/playersDatabase/services/audit/system/repair/index.test.js

import { auditSystem } from '../index.js'
import { readSystemAuditActual } from '../readActual.js'
import { evaluateSystemIntegrity } from '../evaluate.js'
import { buildSystemRepairPlan } from './systemRepairPlan.js'
import { buildSourceRepairPlan } from './sourceRepairPlan.js'
import { buildLeagueOwnershipRepairPlan } from './leagueOwnershipRepairPlan.js'
import { writeSystemAuditRepair } from '../../../write/audit/writeSystemAuditRepair.js'
import { prepareSystemAuditRepair, repairSystemAuditFinding } from './index.js'

jest.mock('../index.js', () => ({ auditSystem: jest.fn() }))
jest.mock('../readActual.js', () => ({ readSystemAuditActual: jest.fn() }))
jest.mock('../evaluate.js', () => ({ evaluateSystemIntegrity: jest.fn() }))
jest.mock('./systemRepairPlan.js', () => ({ buildSystemRepairPlan: jest.fn() }))
jest.mock('./sourceRepairPlan.js', () => ({ buildSourceRepairPlan: jest.fn() }))
jest.mock('./leagueOwnershipRepairPlan.js', () => ({ buildLeagueOwnershipRepairPlan: jest.fn() }))
jest.mock('../../../write/audit/writeSystemAuditRepair.js', () => ({ writeSystemAuditRepair: jest.fn() }))

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
})

test('verification failure is not reported as success', async () => {
  const preview = await prepareSystemAuditRepair({ finding })
  auditSystem.mockRejectedValue(new Error('offline'))
  await expect(repairSystemAuditFinding({ finding, confirmed: true, previewKey: preview.previewKey })).rejects.toThrow('הבדיקה החוזרת נכשלה')
})

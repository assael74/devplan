// src/features/playersDatabase/services/audit/audit.activeFindings.test.js

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  doc: jest.fn(),
  getDocs: jest.fn(),
  query: jest.fn(),
  serverTimestamp: jest.fn(),
  where: jest.fn(),
  writeBatch: jest.fn(),
}))

jest.mock('../../../../services/firebase/firebase.js', () => ({ db: {} }))

import {
  buildActiveAuditFindingReconciliationPlan,
  buildAuditFindingId,
  reconcileActiveAuditFindings,
} from './audit.activeFindings.js'
import { buildAuditTeamSeasonScope } from './audit.scope.js'
import { getDocs, serverTimestamp, where, writeBatch } from 'firebase/firestore'

const finding = (overrides = {}) => ({
  type: 'source_mismatch',
  entityType: 'teamSeason',
  documentId: 'team-season-1',
  relatedDocumentId: 'league-1',
  teamDocumentId: 'team-1',
  playerDocumentId: '',
  seasonKey: '26/27',
  relationKey: 'performance',
  auditDomain: 'team_relations',
  title: 'פער ביצועים',
  ...overrides,
})

const scope = buildAuditTeamSeasonScope({
  teamDocumentId: 'team-1',
  seasonKey: '26/27',
})

const activeFindingRow = value => ({
  id: buildAuditFindingId(value),
  data: () => ({
    ...value,
    schemaVersion: 2,
    detectedAt: 'first-detection',
  }),
})

describe('active Audit Findings reconciliation execution', () => {
  let batch

  beforeEach(() => {
    batch = {
      set: jest.fn(),
      delete: jest.fn(),
      commit: jest.fn().mockResolvedValue(undefined),
    }
    getDocs.mockReset()
    serverTimestamp.mockReset()
    where.mockClear()
    writeBatch.mockReset()
    getDocs.mockResolvedValue({ docs: [] })
    serverTimestamp.mockReturnValue('server-timestamp')
    writeBatch.mockReturnValue(batch)
  })

  test('writes a newly detected finding once', async () => {
    const result = await reconcileActiveAuditFindings({
      findings: [finding()],
      scope,
      auditDomains: ['team_relations'],
      detectedAt: 'audit-time',
    })

    expect(batch.set).toHaveBeenCalledTimes(1)
    expect(batch.delete).not.toHaveBeenCalled()
    expect(batch.commit).toHaveBeenCalledTimes(1)
    expect(result.createdCount).toBe(1)
    expect(result.findings[0].detectedAt).toBe('audit-time')
  })

  test('does not write a finding that remains active and preserves detectedAt', async () => {
    const current = finding()
    getDocs.mockResolvedValue({ docs: [activeFindingRow(current)] })

    const result = await reconcileActiveAuditFindings({
      findings: [current],
      scope,
      auditDomains: ['team_relations'],
      detectedAt: 'later-audit-time',
    })

    expect(writeBatch).not.toHaveBeenCalled()
    expect(result.unchangedCount).toBe(1)
    expect(result.findings[0].detectedAt).toBe('first-detection')
  })

  test('deletes a finding only after the same audited scope is clean', async () => {
    const current = finding()
    getDocs.mockResolvedValue({ docs: [activeFindingRow(current)] })

    const result = await reconcileActiveAuditFindings({
      findings: [],
      scope,
      auditDomains: ['team_relations'],
    })

    expect(batch.set).not.toHaveBeenCalled()
    expect(batch.delete).toHaveBeenCalledTimes(1)
    expect(result.deletedCount).toBe(1)
  })

  test('queries only schema v2 findings for reconciliation', async () => {
    await reconcileActiveAuditFindings({
      findings: [],
      scope,
      auditDomains: ['team_relations'],
    })

    expect(where).toHaveBeenCalledWith('schemaVersion', '==', 2)
  })
})

describe('active Audit Findings reconciliation plan', () => {
  test('creates a newly detected finding once', () => {
    const plan = buildActiveAuditFindingReconciliationPlan({
      findings: [finding()],
      existingRows: [],
      scope,
      auditDomains: ['team_relations'],
    })

    expect(plan.creates).toHaveLength(1)
    expect(plan.deletes).toHaveLength(0)
  })

  test('does not write when the same active finding remains', () => {
    const current = finding()
    const plan = buildActiveAuditFindingReconciliationPlan({
      findings: [current],
      existingRows: [{
        id: buildAuditFindingId(current),
        data: { ...current, detectedAt: 'first-detection' },
      }],
      scope,
      auditDomains: ['team_relations'],
    })

    expect(plan.creates).toHaveLength(0)
    expect(plan.deletes).toHaveLength(0)
  })

  test('keeps an existing finding when another finding is added', () => {
    const first = finding()
    const second = finding({ relationKey: 'roster', title: 'פער סגל' })
    const plan = buildActiveAuditFindingReconciliationPlan({
      findings: [first, second],
      existingRows: [{ id: buildAuditFindingId(first), data: first }],
      scope,
      auditDomains: ['team_relations'],
    })

    expect(plan.creates.map(([id]) => id)).toEqual([buildAuditFindingId(second)])
    expect(plan.deletes).toHaveLength(0)
  })

  test('deletes only the finding that the completed audit no longer detects', () => {
    const first = finding()
    const second = finding({ relationKey: 'roster', title: 'פער סגל' })
    const plan = buildActiveAuditFindingReconciliationPlan({
      findings: [second],
      existingRows: [
        { id: buildAuditFindingId(first), data: first },
        { id: buildAuditFindingId(second), data: second },
      ],
      scope,
      auditDomains: ['team_relations'],
    })

    expect(plan.creates).toHaveLength(0)
    expect(plan.deletes.map(row => row.id)).toEqual([buildAuditFindingId(first)])
  })

  test('deletes all active findings after the same scope is fully clean', () => {
    const current = finding()
    const plan = buildActiveAuditFindingReconciliationPlan({
      findings: [],
      existingRows: [{ id: buildAuditFindingId(current), data: current }],
      scope,
      auditDomains: ['team_relations'],
    })

    expect(plan.creates).toHaveLength(0)
    expect(plan.deletes).toHaveLength(1)
  })

  test('never deletes a finding outside the audited scope', () => {
    const current = finding()
    const otherScopeFinding = finding({
      teamDocumentId: 'team-2',
      seasonKey: '25/26',
      relationKey: 'other-scope',
    })
    const plan = buildActiveAuditFindingReconciliationPlan({
      findings: [],
      existingRows: [
        { id: buildAuditFindingId(current), data: current },
        { id: buildAuditFindingId(otherScopeFinding), data: otherScopeFinding },
      ],
      scope,
      auditDomains: ['team_relations'],
    })

    expect(plan.deletes.map(row => row.id)).toEqual([buildAuditFindingId(current)])
  })

  test('keeps the same finding identity when its display title changes', () => {
    expect(buildAuditFindingId(finding())).toBe(buildAuditFindingId(finding({
      title: 'ניסוח תצוגה חדש בלבד',
    })))
  })

  test('does not delete a Club finding when only Team validators ran', () => {
    const clubFinding = finding({
      entityType: 'clubAgeGroupSeason',
      auditDomain: 'club_relations',
      relationKey: 'club-age-group-season',
    })
    const plan = buildActiveAuditFindingReconciliationPlan({
      findings: [],
      existingRows: [{ id: buildAuditFindingId(clubFinding), data: clubFinding }],
      scope,
      auditDomains: ['team_relations', 'player_relations'],
    })

    expect(plan.deletes).toHaveLength(0)
  })
})

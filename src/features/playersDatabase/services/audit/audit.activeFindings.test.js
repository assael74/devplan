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
} from './audit.activeFindings.js'
import { buildAuditTeamSeasonScope } from './audit.scope.js'

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

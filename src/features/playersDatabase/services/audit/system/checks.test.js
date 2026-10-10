// src/features/playersDatabase/services/audit/system/checks.test.js

import {
  buildSystemAuditPlan,
  filterSystemAuditFindings,
  SYSTEM_AUDIT_CHECK,
  SYSTEM_AUDIT_CHECKS,
} from './checks.js'
import { SYSTEM_AUDIT_TARGETS } from './contract.js'

describe('system audit checks', () => {
  test('combines dependencies and reads each target once', () => {
    const plan = buildSystemAuditPlan([
      SYSTEM_AUDIT_CHECK.UNUSED_DOCUMENTS,
      SYSTEM_AUDIT_CHECK.PROJECTION_SYNC,
    ])

    expect(plan.targets).toContain('playerSearchIndexes')
    expect(plan.targets).toContain('clubsCenter')
    expect(new Set(plan.targets).size).toBe(plan.targets.length)
  })

  test('all available checks cover every active audit target', () => {
    expect(buildSystemAuditPlan(SYSTEM_AUDIT_CHECKS).targets).toEqual(
      SYSTEM_AUDIT_TARGETS
    )
  })

  test('returns only findings that belong to selected checks', () => {
    const findings = [
      { type: 'orphan_projection', target: 'playerSearchIndexes' },
      { type: 'missing_projection', target: 'playerSeasons' },
      { type: 'invalid_canonical_state', target: 'teamSeasons' },
    ]

    expect(filterSystemAuditFindings({
      findings,
      checks: [SYSTEM_AUDIT_CHECK.UNUSED_DOCUMENTS],
    })).toEqual([findings[0]])
  })
})

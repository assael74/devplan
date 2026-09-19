// src/features/playersDatabase/services/audit/audit.contract.test.js

import {
  AUDIT_FINDING_TYPE,
  AUDIT_REPAIR_TYPE,
  buildAuditFinding,
  normalizeLegacyAuditRepairType,
} from './audit.contract.js'

describe('audit repair contract', () => {
  test('keeps Club projection eligibility independent from source text when repairType is present', () => {
    const finding = buildAuditFinding({
      type: AUDIT_FINDING_TYPE.MISSING_DOCUMENT,
      entityType: 'clubDocument',
      repairType: AUDIT_REPAIR_TYPE.REBUILD_CLUB_PROJECTION,
      source: 'changed descriptive wording',
    })

    expect(finding.repairType).toBe(AUDIT_REPAIR_TYPE.REBUILD_CLUB_PROJECTION)
  })

  test('normalizes a legacy Club finding at the compatibility boundary', () => {
    expect(normalizeLegacyAuditRepairType({
      type: AUDIT_FINDING_TYPE.MISSING_DOCUMENT,
      entityType: 'clubDocument',
      source: 'League table → Club Document',
    })).toBe(AUDIT_REPAIR_TYPE.REBUILD_CLUB_PROJECTION)
  })

  test('maps the retired Club performance repair type to the canonical Club projection repair', () => {
    expect(normalizeLegacyAuditRepairType({
      repairType: 'rebuild_club_performance',
      type: AUDIT_FINDING_TYPE.SOURCE_MISMATCH,
      entityType: 'clubAgeGroupSeason',
    })).toBe(AUDIT_REPAIR_TYPE.REBUILD_CLUB_PROJECTION)
  })

  test('keeps an unknown persisted repairType unchanged rather than guessing a repair', () => {
    const unknownRepairType = 'retired_repair_type'
    const finding = {
      repairType: unknownRepairType,
      type: AUDIT_FINDING_TYPE.MISSING_DOCUMENT,
      entityType: 'player',
    }

    expect(normalizeLegacyAuditRepairType(finding)).toBe(unknownRepairType)
    expect(buildAuditFinding(finding).repairType).toBe(unknownRepairType)
  })
})

// src/features/playersDatabase/ui/components/modals/audit/auditFindingSelectors.test.js

import { AUDIT_FINDING_TYPE, AUDIT_REPAIR_TYPE } from '../../../../services/audit/index.js'
import { selectRepairFindings } from './auditFindingSelectors.js'

describe('Audit repair finding selectors', () => {
  test('groups canonical and legacy Club performance findings under the canonical projection repair', () => {
    const findings = [
      {
        type: AUDIT_FINDING_TYPE.SOURCE_MISMATCH,
        entityType: 'clubAgeGroupSeason',
        repairType: AUDIT_REPAIR_TYPE.REBUILD_CLUB_PROJECTION,
      },
      {
        type: AUDIT_FINDING_TYPE.SOURCE_MISMATCH,
        entityType: 'clubAgeGroupSeason',
        repairType: 'rebuild_club_performance',
      },
    ]

    const selected = selectRepairFindings(findings)

    expect(selected.clubProjection).toEqual(findings)
    expect(selected).not.toHaveProperty('clubPerformance')
  })
})

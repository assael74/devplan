// src/features/playersDatabase/services/auditV2/system/orphans/index.js

import {
  ORPHAN_AUDIT_V2_RESULT,
  ORPHAN_AUDIT_V2_TARGETS,
} from './contract.js'
import { evaluateOrphanDataV2 } from './evaluate.js'
import { readOrphanAuditActualV2 } from './readActual.js'

export async function auditOrphanDataV2() {
  const actual = await readOrphanAuditActualV2()
  const findings = evaluateOrphanDataV2(actual)

  return {
    flowType: 'system_orphans',
    result: findings.length
      ? ORPHAN_AUDIT_V2_RESULT.FINDINGS
      : ORPHAN_AUDIT_V2_RESULT.CLEAN,
    coverage: {
      complete: true,
      coveredTargets: [...ORPHAN_AUDIT_V2_TARGETS],
      uncoveredTargets: [],
    },
    findings,
    summary: {
      checkedTeamSearchIndexes: actual.teamSearchIndexes.length,
      checkedPlayerSearchIndexes: actual.playerSearchIndexes.length,
      checkedTeamSeasons: actual.teamSeasons.length,
      checkedClubs: actual.clubs.length,
      checkedClubsMasterEntries: Array.isArray(actual.clubsMaster?.clubs)
        ? actual.clubsMaster.clubs.length
        : 0,
      findingsCount: findings.length,
    },
  }
}

export { evaluateOrphanDataV2 } from './evaluate.js'

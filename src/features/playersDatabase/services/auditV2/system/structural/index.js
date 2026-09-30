// src/features/playersDatabase/services/auditV2/system/structural/index.js

import {
  STRUCTURAL_AUDIT_V2_RESULT,
  STRUCTURAL_AUDIT_V2_TARGETS,
} from './contract.js'
import { evaluateStructuralIntegrityV2 } from './evaluate.js'
import { readStructuralAuditActualV2 } from './readActual.js'

export async function auditStructuralIntegrityV2() {
  const actual = await readStructuralAuditActualV2()
  const findings = evaluateStructuralIntegrityV2(actual)

  return {
    flowType: 'system_structural',
    result: findings.length
      ? STRUCTURAL_AUDIT_V2_RESULT.FINDINGS
      : STRUCTURAL_AUDIT_V2_RESULT.CLEAN,
    coverage: {
      complete: true,
      coveredTargets: [...STRUCTURAL_AUDIT_V2_TARGETS],
      uncoveredTargets: [],
    },
    findings,
    summary: {
      checkedLeagues: actual.leagues.length,
      checkedTeamRoots: actual.teamRoots.length,
      checkedTeamSeasons: actual.teamSeasons.length,
      checkedClubs: actual.clubs.length,
      findingsCount: findings.length,
    },
  }
}

export { evaluateStructuralIntegrityV2 } from './evaluate.js'
export { validateTeamSeasonMovementV2 } from './movementValidation.js'

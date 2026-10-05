// src/features/playersDatabase/services/audit/system/index.js

import { SYSTEM_AUDIT_RESULT, SYSTEM_AUDIT_TARGETS } from './contract.js'
import { evaluateSystemIntegrity } from './evaluate.js'
import { readSystemAuditActual } from './readActual.js'

export const auditSystem = async () => {
  const actual = await readSystemAuditActual()
  const findings = evaluateSystemIntegrity(actual)

  return {
    flowType: 'system',
    result: findings.length
      ? SYSTEM_AUDIT_RESULT.FINDINGS
      : SYSTEM_AUDIT_RESULT.CLEAN,
    findings,
    coverage: {
      complete: true,
      coveredTargets: SYSTEM_AUDIT_TARGETS,
      uncoveredTargets: [],
    },
    summary: {
      findingsCount: findings.length,
      checkedTeamRoots: actual.teamRoots.length,
      checkedTeamSeasons: actual.teamSeasons.length,
      checkedPlayerRoots: actual.playerRoots.length,
      checkedPlayerSeasons: actual.playerSeasons.length,
      checkedPlayerSearchIndexes: actual.playerSearchIndexes.length,
      checkedLeagues: actual.leagues.length,
      checkedClubProfiles: actual.clubProfiles.length,
    },
  }
}

export { evaluateSystemIntegrity } from './evaluate.js'
export { readSystemAuditActual } from './readActual.js'

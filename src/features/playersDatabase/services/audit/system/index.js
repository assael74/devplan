// src/features/playersDatabase/services/audit/system/index.js

import { SYSTEM_AUDIT_RESULT, SYSTEM_AUDIT_TARGETS } from './contract.js'
import {
  buildSystemAuditPlan,
  filterSystemAuditFindings,
} from './checks.js'
import { evaluateSystemIntegrity } from './evaluate.js'
import { readSystemAuditActual } from './readActual.js'

export const auditSystem = async ({ checks } = {}) => {
  const hasSelectedChecks = Array.isArray(checks)
  const plan = hasSelectedChecks
    ? buildSystemAuditPlan(checks)
    : { checks: [], targets: SYSTEM_AUDIT_TARGETS }
  if (hasSelectedChecks && !plan.checks.length) {
    throw new Error('יש לבחור לפחות בדיקה אחת')
  }

  const actual = await readSystemAuditActual({ targets: plan.targets })
  const allFindings = evaluateSystemIntegrity(actual)
  const findings = hasSelectedChecks
    ? filterSystemAuditFindings({ findings: allFindings, checks: plan.checks })
    : allFindings

  return {
    flowType: 'system',
    result: findings.length
      ? SYSTEM_AUDIT_RESULT.FINDINGS
      : SYSTEM_AUDIT_RESULT.CLEAN,
    findings,
    selectedChecks: plan.checks,
    coverage: {
      selectionComplete: true,
      complete: plan.targets.length === SYSTEM_AUDIT_TARGETS.length,
      coveredTargets: plan.targets,
      uncoveredTargets: SYSTEM_AUDIT_TARGETS.filter(target => !plan.targets.includes(target)),
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
      checkedLeaguesCenter: actual.leaguesCenter.length,
      checkedClubsCenter: actual.clubsCenter.length,
      checkedClubsDirectory: actual.clubsDirectory.length,
    },
  }
}

export { evaluateSystemIntegrity } from './evaluate.js'
export { readSystemAuditActual } from './readActual.js'

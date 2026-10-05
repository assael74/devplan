// src/features/playersDatabase/services/audit/roster/index.js

import { buildRosterAuditExpected } from './buildExpected.js'
import { compareRosterAudit } from './compare.js'
import { readRosterAuditActual } from './readActual.js'

export const auditRoster = async ({ approvedState = null } = {}) => {
  const expectedState = buildRosterAuditExpected({ approvedState })
  const actual = await readRosterAuditActual({ approvedState })
  const findings = compareRosterAudit({ actual, expectedState, approvedState })
  const complete = expectedState.complete === true
  return {
    status: complete && findings.length === 0 ? 'CLEAN' : complete ? 'FINDINGS' : 'PARTIAL',
    findings,
    coverage: {
      complete,
      coveredTargets: [
        'teamRoot',
        'teamSeason',
        'counterparts',
        'playerSeasons',
        'playerSearchIndexes',
        'leagueRoster',
        'leaguesCenter',
        'clubsCenter',
      ],
      reason: complete ? '' : expectedState.reason,
    },
  }
}

export { buildRosterAuditExpected } from './buildExpected.js'
export { compareRosterAudit } from './compare.js'
export { readRosterAuditActual } from './readActual.js'

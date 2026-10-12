// src/features/playersDatabase/services/audit/repair/index.js

import { requireSeasonId } from '../../../domain/identity/index.js'
import { auditLeague } from '../league/index.js'
import { auditStats } from '../stats/index.js'
import { getFocusedAuditFindingKey, inspectFocusedAuditRepair } from './eligibility.js'
import { repairLeagueFinding } from './repairLeagueFinding.js'
import { repairStatsFinding } from './repairStatsFinding.js'

const clean = value => String(value === null || value === undefined ? '' : value).trim()
const findingsOf = audit => Array.isArray(audit && audit.findings) ? audit.findings : []

const resolveScope = scope => ({
  type: clean(scope && scope.type),
  leagueId: clean(scope && scope.leagueId),
  seasonId: requireSeasonId(scope && scope.seasonId),
  teamId: clean(scope && scope.teamId),
  playerId: clean(scope && scope.playerId),
})

const runAudit = scope => scope.type === 'league'
  ? auditLeague({ leagueId: scope.leagueId, seasonId: scope.seasonId })
  : auditStats({
      leagueId: scope.leagueId,
      teamId: scope.teamId,
      seasonId: scope.seasonId,
      scopedPlayerIds: scope.type === 'player' ? [scope.playerId] : [],
    })

export const repairFocusedAuditFinding = async ({
  scope,
  finding,
  confirmed = false,
} = {}) => {
  if (confirmed !== true) throw new Error('יש לאשר את התיקון לפני ביצועו.')
  const resolvedScope = resolveScope(scope)
  const eligibility = inspectFocusedAuditRepair({ scope: resolvedScope, finding })
  if (!eligibility.allowed) throw new Error(eligibility.reason)

  const key = getFocusedAuditFindingKey(finding)
  const before = await runAudit(resolvedScope)
  const currentFinding = findingsOf(before)
    .find(item => getFocusedAuditFindingKey(item) === key)
  if (!currentFinding) return { audit: before, repaired: false, skipped: true }

  const currentEligibility = inspectFocusedAuditRepair({
    scope: resolvedScope,
    finding: currentFinding,
  })
  if (!currentEligibility.allowed) throw new Error(currentEligibility.reason)

  try {
    const repair = resolvedScope.type === 'league' ? repairLeagueFinding : repairStatsFinding
    await repair({ scope: resolvedScope, finding: currentFinding })
  } catch (error) {
    const failure = error instanceof Error ? error : new Error('התיקון לא הושלם.')
    failure.auditResult = await runAudit(resolvedScope).catch(() => null)
    throw failure
  }

  let audit
  try {
    audit = await runAudit(resolvedScope)
  } catch (error) {
    throw new Error('פעולת התיקון בוצעה, אך הבדיקה החוזרת נכשלה. יש להריץ בדיקה נוספת לפני ניסיון תיקון נוסף.')
  }
  return {
    audit,
    repaired: !findingsOf(audit).some(item => getFocusedAuditFindingKey(item) === key),
    skipped: false,
  }
}

export { getFocusedAuditFindingKey, inspectFocusedAuditRepair } from './eligibility.js'

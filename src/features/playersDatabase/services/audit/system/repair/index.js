// src/features/playersDatabase/services/audit/system/repair/index.js

import { auditSystem } from '../index.js'
import { readSystemAuditActual } from '../readActual.js'
import { evaluateSystemIntegrity } from '../evaluate.js'
import { SYSTEM_AUDIT_TARGETS } from '../contract.js'
import { SYSTEM_AUDIT_CHECKS } from '../checks.js'
import { writeSystemAuditRepair } from '../../../write/audit/writeSystemAuditRepair.js'
import { buildSystemRepairPlan } from './systemRepairPlan.js'
import { buildSourceRepairPlan } from './sourceRepairPlan.js'
import { buildLeagueOwnershipRepairPlan } from './leagueOwnershipRepairPlan.js'
import { getSystemAuditFindingKey, getSystemRepairPreviewKey } from './repairValue.js'

const findingTypes = new Set([
  'missing_canonical', 'broken_relation', 'invalid_identity',
  'missing_projection', 'projection_mismatch', 'orphan_projection', 'unexpected_projection',
])

export const inspectSystemAuditRepair = ({ finding } = {}) => {
  const valid = Boolean(finding && SYSTEM_AUDIT_TARGETS.includes(finding.target) && findingTypes.has(finding.type))
  const allowed = valid && (
    finding.target === 'clubsDirectory'
    || ['missing_canonical', 'broken_relation', 'invalid_identity'].includes(finding.type)
    || (finding.target === 'playerSeasons' && finding.type === 'missing_projection')
  )
  const cleanup = valid && finding.type === 'orphan_projection'
    && ['playerSeasons', 'playerSearchIndexes'].includes(finding.target)
  return {
    allowed,
    label: allowed ? 'הצג תיקון' : cleanup ? 'זמין בניקוי' : 'תיקון בבדיקה ממוקדת',
    description: 'הכנת הצעה מהנתונים העדכניים. כתיבה תתבצע רק לאחר אישור ההצעה.',
    reason: allowed ? '' : cleanup
      ? 'אפשר לבחור את הממצא ולתקן באמצעות פעולת הניקוי במסך זה.'
      : 'יש להריץ את הבדיקה הממוקדת לליגה, לקבוצה או לשחקן ולתקן ממנה.',
  }
}

const readPlan = async ({ finding, input }) => {
  if (!inspectSystemAuditRepair({ finding }).allowed) throw new Error('סוג הממצא אינו נתמך לתיקון.')
  const actual = await readSystemAuditActual()
  const key = getSystemAuditFindingKey(finding)
  const current = evaluateSystemIntegrity(actual).find(item => getSystemAuditFindingKey(item) === key)
  if (!current) return { skipped: true, changes: [], guards: [], allowed: false, fields: [] }

  for (const build of [buildLeagueOwnershipRepairPlan, buildSourceRepairPlan, buildSystemRepairPlan]) {
    const plan = build({ actual, finding: current, input })
    if (plan && plan.supported) {
      if (Array.isArray(plan.changes) && plan.changes.length > 400) {
        return {
          ...plan, allowed: false, changes: [], guards: [], fields: plan.fields || [],
          reason: 'התיקון דורש יותר מ־400 כתיבות ולכן אינו מבוצע בפעולה אחת. יש לצמצם את ההיקף לפני אישור.',
        }
      }
      return { changes: [], guards: [], fields: [], ...plan, finding: current }
    }
  }
  return {
    allowed: false,
    label: 'נדרשת בדיקה ממוקדת',
    reason: 'לממצא זה יש להריץ את הבדיקה הממוקדת לליגה, לקבוצה או לשחקן ולתקן ממנה.',
    changes: [], guards: [], fields: [],
  }
}

const previewOf = plan => ({
  allowed: plan.allowed === true && plan.changes.length > 0,
  label: plan.label || 'תיקון הממצא',
  description: plan.description || '',
  reason: plan.reason || '',
  fields: plan.fields,
  reload: plan.reload || null,
  skipped: plan.skipped === true,
  changes: plan.changes.map(change => ({
    target: change.target,
    documentId: change.documentId,
    summary: change.summary,
    action: change.after === null ? 'delete' : change.before === null ? 'create' : 'update',
  })),
  previewKey: plan.allowed && plan.changes.length ? getSystemRepairPreviewKey(plan) : '',
})

export const prepareSystemAuditRepair = async ({ finding, checks, input = {} } = {}) => {
  const plan = await readPlan({ finding, input })
  return { ...previewOf(plan), ...(plan.skipped ? { audit: await runAudit(checks) } : {}) }
}

const runAudit = checks => auditSystem({ checks: Array.isArray(checks) && checks.length ? checks : SYSTEM_AUDIT_CHECKS })

export const repairSystemAuditFinding = async ({
  finding,
  checks,
  input = {},
  previewKey = '',
  confirmed = false,
} = {}) => {
  if (confirmed !== true || !previewKey) throw new Error('יש להציג ולאשר הצעת תיקון לפני כתיבה.')
  const plan = await readPlan({ finding, input })
  if (plan.skipped) return { audit: await runAudit(checks), repaired: false, skipped: true }
  if (!plan.allowed) throw new Error(plan.reason || 'לא ניתן לבצע את התיקון מהמקורות הקיימים.')
  if (getSystemRepairPreviewKey(plan) !== previewKey) {
    throw new Error('הצעת התיקון השתנתה. יש להציג ולאשר את ההצעה המעודכנת.')
  }
  try {
    await writeSystemAuditRepair({ changes: plan.changes, guards: plan.guards })
  } catch (error) {
    const failure = error instanceof Error ? error : new Error('התיקון נכשל.')
    failure.auditResult = await runAudit(checks).catch(() => null)
    throw failure
  }
  let audit
  try {
    audit = await runAudit(checks)
  } catch (_error) {
    throw new Error('התיקון נשמר, אך הבדיקה החוזרת נכשלה. יש להריץ בדיקה חדשה לפני תיקון נוסף.')
  }
  return {
    audit,
    repaired: !audit.findings.some(item => getSystemAuditFindingKey(item) === getSystemAuditFindingKey(finding)),
    skipped: false,
  }
}

export { getSystemAuditFindingKey } from './repairValue.js'

// src/features/playersDatabase/services/audit/repair/repair.plan.js

import {
  PLAYER_SCOUT_REPAIR_TYPE,
} from '../checks/computedState.contract.js'
import {
  canDirectRepairSearchIndexIssue,
} from './directSearchIndex.repair.js'
import {
  AUDIT_ISSUE_CATEGORY,
} from '../audit.contract.js'
import {
  AUDIT_REPAIR_ACTION,
  AUDIT_REPAIR_DECISION,
  AUDIT_REPAIR_PLAN_VERSION,
  normalizeRepairPlanItem,
} from './repair.contract.js'

const clean = value => String(
  value === undefined || value === null ? '' : value
).trim()

const PROJECTION_REPAIR_TYPES = new Set([
  PLAYER_SCOUT_REPAIR_TYPE.PLAYER_SEARCH_INDEX,
  PLAYER_SCOUT_REPAIR_TYPE.TEAM_SEARCH_INDEX,
])

const STRUCTURE_REPAIR_TYPES = new Set([
  PLAYER_SCOUT_REPAIR_TYPE.PLAYER_DOCUMENT_MIGRATION,
  PLAYER_SCOUT_REPAIR_TYPE.PLAYER_SEARCH_INDEX_MIGRATION,
  PLAYER_SCOUT_REPAIR_TYPE.TEAM_PLAYER_MIGRATION,
])

const resolveLegacyRepairType = issue => clean(
  issue?.sourceIssue?.repair?.repairType ||
  issue?.sourceIssue?.repairType
)

const sourceRepairable = issue => (
  issue?.sourceIssue?.repairable === true ||
  issue?.sourceIssue?.repair?.selectable === true
)

const buildRepairTarget = ({
  issue,
  repairType,
  action,
} = {}) => {
  const sourceIssue = issue?.sourceIssue || {}
  const searchIndexDocumentId = clean(
    issue?.searchIndexDocumentId ||
    sourceIssue.searchIndexDocumentId ||
    sourceIssue.searchDocumentId
  )
  const playerDocumentId = clean(
    issue?.playerDocumentId ||
    sourceIssue.playerDocumentId
  )
  const teamDocumentId = clean(
    issue?.teamDocumentId ||
    sourceIssue.teamDocumentId ||
    sourceIssue.birthTeamDocumentId
  )

  if (
    repairType === PLAYER_SCOUT_REPAIR_TYPE.PLAYER_SEARCH_INDEX ||
    repairType === PLAYER_SCOUT_REPAIR_TYPE.TEAM_SEARCH_INDEX
  ) {
    return searchIndexDocumentId
      ? {
          collection: 'dbSearchIndexes',
          documentId: searchIndexDocumentId,
          operation: action,
          confidence: 'proven',
        }
      : null
  }

  if (
    repairType === PLAYER_SCOUT_REPAIR_TYPE.PLAYER_DOCUMENT ||
    repairType === PLAYER_SCOUT_REPAIR_TYPE.PLAYER_DOCUMENT_MIGRATION
  ) {
    return playerDocumentId
      ? {
          collection: 'dbPlayers',
          documentId: playerDocumentId,
          operation: action,
          confidence: 'identified',
        }
      : null
  }

  if (
    repairType === PLAYER_SCOUT_REPAIR_TYPE.TEAM_PLAYER ||
    repairType === PLAYER_SCOUT_REPAIR_TYPE.TEAM_PLAYER_MIGRATION
  ) {
    return teamDocumentId
      ? {
          collection: 'dbBirthTeams',
          documentId: teamDocumentId,
          operation: action,
          confidence: 'identified',
        }
      : null
  }

  return null
}

const hasProvenRepairTarget = target => (
  clean(target?.documentId) &&
  clean(target?.collection) &&
  clean(target?.confidence) === 'proven'
)

const resolveIssuePlan = issue => {
  const sourceIssue = issue?.sourceIssue || {}
  const repairType = resolveLegacyRepairType(issue)

  if (
    canDirectRepairSearchIndexIssue(sourceIssue) &&
    sourceRepairable(issue)
  ) {
    const repairTarget = buildRepairTarget({
      issue,
      repairType,
      action: AUDIT_REPAIR_ACTION.UPDATE_PROJECTION,
    })

    if (hasProvenRepairTarget(repairTarget)) {
      return normalizeRepairPlanItem({
        issue,
        decision: AUDIT_REPAIR_DECISION.AUTOMATIC,
        action: AUDIT_REPAIR_ACTION.UPDATE_PROJECTION,
        internalRoute: 'directSearchIndex',
        reason: 'קיים תיקון ישיר ומוגבל לשדות האינדקס שנמצאו לא תקינים. לפני כתיבה תבוצע בדיקה ממוקדת טרייה של מקור האמת.',
        requiresFreshRepairData: true,
        estimatedReads: 1,
        estimatedWrites: 1,
        repairTarget,
      })
    }
  }

  if (PROJECTION_REPAIR_TYPES.has(repairType) && sourceRepairable(issue)) {
    return normalizeRepairPlanItem({
      issue,
      decision: AUDIT_REPAIR_DECISION.REVIEW,
      action: AUDIT_REPAIR_ACTION.UPDATE_PROJECTION,
      internalRoute: 'projectionRepairReview',
      reason: 'עדכון הקרנה שאינו תיקון ישיר דורש טעינת מקור אמת טרי ו־Apply ייעודי לפני הפעלה אוטומטית.',
      requiresFreshRepairData: true,
      repairTarget: buildRepairTarget({
        issue,
        repairType,
        action: AUDIT_REPAIR_ACTION.UPDATE_PROJECTION,
      }),
    })
  }

  if (
    repairType === PLAYER_SCOUT_REPAIR_TYPE.PLAYER_DOCUMENT ||
    repairType === PLAYER_SCOUT_REPAIR_TYPE.TEAM_PLAYER
  ) {
    return normalizeRepairPlanItem({
      issue,
      decision: AUDIT_REPAIR_DECISION.REVIEW,
      action: clean(issue?.type) === 'missing_player_document'
        ? AUDIT_REPAIR_ACTION.CREATE
        : AUDIT_REPAIR_ACTION.RECOMPUTE,
      internalRoute: 'semanticRepairReview',
      reason: 'תיקון מסמך מקצועי דורש מיפוי לפי סוג הפער ויעד כתיבה מוכח לפני הפעלה אוטומטית.',
      requiresFreshRepairData: true,
      repairTarget: buildRepairTarget({
        issue,
        repairType,
        action: clean(issue?.type) === 'missing_player_document'
          ? AUDIT_REPAIR_ACTION.CREATE
          : AUDIT_REPAIR_ACTION.RECOMPUTE,
      }),
    })
  }

  if (repairType === PLAYER_SCOUT_REPAIR_TYPE.ENGINE_REFRESH) {
    return normalizeRepairPlanItem({
      issue,
      decision: AUDIT_REPAIR_DECISION.REVIEW,
      action: AUDIT_REPAIR_ACTION.RECOMPUTE,
      internalRoute: 'engineRefreshReview',
      reason: 'חישוב מחדש רחב דורש תצוגה מקדימה ועלות ידועה לפני הפעלה.',
      requiresFreshRepairData: true,
    })
  }

  if (STRUCTURE_REPAIR_TYPES.has(repairType) && sourceRepairable(issue)) {
    return normalizeRepairPlanItem({
      issue,
      decision: AUDIT_REPAIR_DECISION.REVIEW,
      action: AUDIT_REPAIR_ACTION.ALIGN_STRUCTURE,
      internalRoute: 'documentRewrite',
      reason: 'תיקון מבנה עשוי למחוק או לשנות שדות ולכן דורש תצוגה מקדימה לפני כתיבה.',
      requiresFreshRepairData: true,
      estimatedWrites: 1,
      repairTarget: buildRepairTarget({
        issue,
        repairType,
        action: AUDIT_REPAIR_ACTION.ALIGN_STRUCTURE,
      }),
    })
  }

  if (issue?.category === AUDIT_ISSUE_CATEGORY.RELATION) {
    return normalizeRepairPlanItem({
      issue,
      decision: AUDIT_REPAIR_DECISION.REVIEW,
      action: AUDIT_REPAIR_ACTION.RELINK,
      internalRoute: 'relationReview',
      reason: 'פער בין מסמכים דורש לקבוע איזה מסמך הוא מקור האמת לפני תיקון.',
    })
  }

  if (
    issue?.category === AUDIT_ISSUE_CATEGORY.STRUCTURE ||
    issue?.category === AUDIT_ISSUE_CATEGORY.IDENTITY
  ) {
    return normalizeRepairPlanItem({
      issue,
      decision: AUDIT_REPAIR_DECISION.REVIEW,
      action: AUDIT_REPAIR_ACTION.ALIGN_STRUCTURE,
      internalRoute: 'structureReview',
      reason: 'אין במסלול הבדיקה הנוכחי writer מוכח שמותר להפעיל אוטומטית.',
    })
  }

  if (issue?.repair?.status === 'report' || sourceIssue?.repairable === false) {
    return normalizeRepairPlanItem({
      issue,
      decision: AUDIT_REPAIR_DECISION.REPORT,
      action: AUDIT_REPAIR_ACTION.REPORT,
      internalRoute: 'reportOnly',
      reason: 'הממצא אינו מוגדר כתיקון אוטומטי בחוזה הנוכחי.',
      estimatedReads: 0,
      estimatedWrites: 0,
    })
  }

  return normalizeRepairPlanItem({
    issue,
    decision: AUDIT_REPAIR_DECISION.REVIEW,
    action: AUDIT_REPAIR_ACTION.REVIEW,
    internalRoute: 'manualReview',
    reason: 'לא נמצא route תיקון מוכח ובטוח לממצא הזה.',
  })
}

const countBy = (items, field, value) => items.filter(item => (
  clean(item?.[field]) === value
)).length

const buildWriteTargets = items => {
  const targets = new Map()

  items.forEach(item => {
    if (item.decision === AUDIT_REPAIR_DECISION.REPORT) return

    const target = item.repairTarget
    const collection = clean(target?.collection)
    const documentId = clean(target?.documentId)
    if (!collection || !documentId) return

    const key = `${collection}::${documentId}`
    if (!targets.has(key)) {
      targets.set(key, {
        collection,
        documentId,
        confidence: clean(target?.confidence),
      })
    }
  })

  return [...targets.values()]
}

export const buildPlayerDatabaseRepairPlan = ({ audit } = {}) => {
  if (!audit || typeof audit !== 'object') {
    throw new Error('נדרשת תוצאת בדיקת נתונים לפני הכנת תיקון.')
  }

  const issues = Array.isArray(audit.issues) ? audit.issues : []
  const items = issues.map(resolveIssuePlan)
  const automaticCount = countBy(
    items,
    'decision',
    AUDIT_REPAIR_DECISION.AUTOMATIC
  )
  const reviewCount = countBy(
    items,
    'decision',
    AUDIT_REPAIR_DECISION.REVIEW
  )
  const reportCount = countBy(
    items,
    'decision',
    AUDIT_REPAIR_DECISION.REPORT
  )
  const repairTargets = buildWriteTargets(items)
  const targetDocumentIds = repairTargets.map(target => target.documentId)
  const knownReads = items.reduce((total, item) => (
    total + (Number.isFinite(item.estimatedReads) ? item.estimatedReads : 0)
  ), 0)
  const knownWrites = items.reduce((total, item) => (
    total + (Number.isFinite(item.estimatedWrites) ? item.estimatedWrites : 0)
  ), 0)
  const hasUnknownCost = items.some(item => (
    item.decision !== AUDIT_REPAIR_DECISION.REPORT &&
    (
      item.requiresFreshRepairData === true ||
      item.estimatedReads === null ||
      item.estimatedWrites === null
    )
  ))

  return {
    contractVersion: AUDIT_REPAIR_PLAN_VERSION,
    generatedAt: new Date().toISOString(),
    auditContractVersion: audit.contractVersion || null,
    auditGeneratedAt: audit.generatedAt || null,
    scope: audit.scope || null,
    source: audit.source || '',
    summary: {
      issuesCount: items.length,
      automaticCount,
      reviewCount,
      reportCount,
      targetDocumentsCount: repairTargets.length,
      knownReadsMinimum: knownReads,
      knownWritesMaximum: knownWrites,
      hasUnknownCost,
    },
    targetDocumentIds,
    repairTargets,
    items,
  }
}

// src/features/playersDatabase/services/audit/repair/repair.contract.js

const clean = value => String(
  value === undefined || value === null ? '' : value
).trim()

export const AUDIT_REPAIR_PLAN_VERSION = 1

export const AUDIT_REPAIR_DECISION = Object.freeze({
  AUTOMATIC: 'automatic',
  REVIEW: 'review',
  REPORT: 'report',
})

export const AUDIT_REPAIR_ACTION = Object.freeze({
  RECOMPUTE: 'recompute',
  UPDATE_PROJECTION: 'updateProjection',
  ALIGN_STRUCTURE: 'alignStructure',
  RELINK: 'relink',
  CREATE: 'create',
  DELETE: 'delete',
  REVIEW: 'review',
  REPORT: 'report',
})

export const AUDIT_REPAIR_ACTION_LABELS = Object.freeze({
  [AUDIT_REPAIR_ACTION.RECOMPUTE]: 'חישוב מחדש',
  [AUDIT_REPAIR_ACTION.UPDATE_PROJECTION]: 'עדכון אינדקס',
  [AUDIT_REPAIR_ACTION.ALIGN_STRUCTURE]: 'התאמת מבנה',
  [AUDIT_REPAIR_ACTION.RELINK]: 'יישור קשרים',
  [AUDIT_REPAIR_ACTION.CREATE]: 'יצירת מסמך חסר',
  [AUDIT_REPAIR_ACTION.DELETE]: 'מחיקת מסמך מיותר',
  [AUDIT_REPAIR_ACTION.REVIEW]: 'דורש בדיקה',
  [AUDIT_REPAIR_ACTION.REPORT]: 'לדיווח בלבד',
})

export const normalizeRepairPlanItem = ({
  issue,
  decision,
  action,
  internalRoute = '',
  reason = '',
  requiresFreshRepairData = false,
  estimatedReads = null,
  estimatedWrites = null,
  repairTarget = null,
} = {}) => ({
  issueId: clean(issue?.issueId),
  category: clean(issue?.category),
  type: clean(issue?.type),
  collection: clean(issue?.collection),
  documentId: clean(issue?.documentId),
  documentIds: Array.isArray(issue?.documentIds)
    ? issue.documentIds.map(clean).filter(Boolean)
    : [],
  seasonKey: clean(issue?.seasonKey),
  title: clean(issue?.title) || 'פער בנתונים',
  decision,
  action,
  actionLabel: AUDIT_REPAIR_ACTION_LABELS[action] || 'דורש בדיקה',
  internalRoute: clean(internalRoute),
  reason: clean(reason),
  requiresFreshRepairData: requiresFreshRepairData === true,
  estimatedReads: Number.isFinite(Number(estimatedReads))
    ? Math.max(0, Number(estimatedReads))
    : null,
  estimatedWrites: Number.isFinite(Number(estimatedWrites))
    ? Math.max(0, Number(estimatedWrites))
    : null,
  repairTarget: repairTarget && typeof repairTarget === 'object'
    ? {
        collection: clean(repairTarget.collection),
        documentId: clean(repairTarget.documentId),
        operation: clean(repairTarget.operation),
        confidence: clean(repairTarget.confidence),
      }
    : null,
})

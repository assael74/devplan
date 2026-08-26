// src/features/playersDatabase/services/audit/repair/repair.apply.js

import {
  canDirectRepairSearchIndexIssue,
  repairSearchIndexIssuesDirect,
} from './directSearchIndex.repair.js'
import {
  AUDIT_REPAIR_DECISION,
  AUDIT_REPAIR_PLAN_VERSION,
} from './repair.contract.js'
import {
  runPlayerDatabaseAudit,
} from '../audit.service.js'
import {
  AUDIT_SCOPE_TYPE,
  buildAuditTeamSeasonScope,
} from '../audit.scope.js'
import {
  verifyPlayerDatabaseRepair,
} from './repair.verify.js'

const clean = value => String(
  value === undefined || value === null ? '' : value
).trim()

const normalizeComparableValue = value => {
  if (Array.isArray(value)) return value.map(normalizeComparableValue)

  if (
    value &&
    typeof value === 'object' &&
    Object.getPrototypeOf(value) === Object.prototype
  ) {
    return Object.keys(value)
      .sort()
      .reduce((result, key) => {
        result[key] = normalizeComparableValue(value[key])
        return result
      }, {})
  }

  if (value === undefined) return null

  return value
}

const sameValue = (left, right) => (
  JSON.stringify(normalizeComparableValue(left)) ===
  JSON.stringify(normalizeComparableValue(right))
)

const isRepairableSourceIssue = issue => (
  issue?.repairable === true ||
  issue?.repair?.selectable === true
)

const buildIssueMap = audit => new Map(
  (Array.isArray(audit?.issues) ? audit.issues : [])
    .map(issue => [clean(issue?.issueId), issue])
    .filter(([issueId]) => Boolean(issueId))
)

const validatePlan = ({ audit, plan }) => {
  if (!audit || typeof audit !== 'object') {
    throw new Error('נדרשת תוצאת בדיקה לפני ביצוע תיקון.')
  }

  if (!plan || typeof plan !== 'object') {
    throw new Error('נדרשת תוכנית תיקון לפני ביצוע תיקון.')
  }

  if (Number(plan.contractVersion) !== AUDIT_REPAIR_PLAN_VERSION) {
    throw new Error('גרסת תוכנית התיקון אינה נתמכת.')
  }

  const planGeneratedAt = clean(plan.auditGeneratedAt)
  const auditGeneratedAt = clean(audit.generatedAt)

  if (!planGeneratedAt || !auditGeneratedAt) {
    throw new Error('תוכנית התיקון חסרה חותמת זמן של הבדיקה המקורית.')
  }

  if (planGeneratedAt !== auditGeneratedAt) {
    throw new Error('תוכנית התיקון אינה שייכת לבדיקה הנוכחית.')
  }
}

const collectPlannedDirectItems = ({ audit, plan }) => {
  const issueMap = buildIssueMap(audit)
  const items = []
  const rejectedItems = []

  ;(Array.isArray(plan?.items) ? plan.items : []).forEach(item => {
    if (item?.decision !== AUDIT_REPAIR_DECISION.AUTOMATIC) return

    if (
      clean(item?.internalRoute) !== 'directSearchIndex' ||
      clean(item?.repairTarget?.collection) !== 'dbSearchIndexes' ||
      clean(item?.repairTarget?.confidence) !== 'proven'
    ) {
      rejectedItems.push({
        issueId: clean(item?.issueId),
        reason: 'automaticRouteNotAllowed',
      })
      return
    }

    const issue = issueMap.get(clean(item?.issueId))
    const sourceIssue = issue?.sourceIssue

    if (
      !sourceIssue ||
      !isRepairableSourceIssue(sourceIssue) ||
      !canDirectRepairSearchIndexIssue(sourceIssue)
    ) {
      rejectedItems.push({
        issueId: clean(item?.issueId),
        reason: 'sourceIssueNoLongerRepairable',
      })
      return
    }

    if (
      clean(sourceIssue.searchIndexDocumentId) !==
      clean(item?.repairTarget?.documentId)
    ) {
      rejectedItems.push({
        issueId: clean(item?.issueId),
        reason: 'repairTargetMismatch',
      })
      return
    }

    items.push({
      item,
      issue,
      sourceIssue,
    })
  })

  return {
    items,
    rejectedItems,
  }
}

const buildFreshDirectKey = ({ type, documentId, writer }) => [
  clean(type),
  clean(documentId),
  clean(writer),
].join('::')

const groupFreshDirectIssues = freshAudit => {
  const groups = new Map()
  const issuesByTypeDocument = new Map()

  ;(Array.isArray(freshAudit?.issues) ? freshAudit.issues : []).forEach(issue => {
    const sourceIssue = issue?.sourceIssue
    if (!sourceIssue) return

    const routeKey = [
      clean(issue?.type || sourceIssue?.type),
      clean(sourceIssue?.searchIndexDocumentId),
    ].join('::')
    const routeIssues = issuesByTypeDocument.get(routeKey) || []
    routeIssues.push({ issue, sourceIssue })
    issuesByTypeDocument.set(routeKey, routeIssues)

    if (
      !isRepairableSourceIssue(sourceIssue) ||
      !canDirectRepairSearchIndexIssue(sourceIssue)
    ) {
      return
    }

    const key = buildFreshDirectKey({
      type: issue?.type || sourceIssue?.type,
      documentId: sourceIssue?.searchIndexDocumentId,
      writer: sourceIssue?.repairData?.writer,
    })
    const current = groups.get(key) || []
    current.push(sourceIssue)
    groups.set(key, current)
  })

  return {
    groups,
    issuesByTypeDocument,
  }
}

const resolveFreshSelection = ({ plannedItems, freshAudit }) => {
  const freshDirect = groupFreshDirectIssues(freshAudit)
  const freshGroups = freshDirect.groups
  const issues = []
  const resolvedItems = []
  const rejectedItems = []

  plannedItems.forEach(({ item, issue, sourceIssue }) => {
    const key = buildFreshDirectKey({
      type: issue?.type || sourceIssue?.type,
      documentId: item?.repairTarget?.documentId,
      writer: sourceIssue?.repairData?.writer,
    })
    const matches = freshGroups.get(key) || []

    if (matches.length === 0) {
      const routeKey = [
        clean(issue?.type || sourceIssue?.type),
        clean(item?.repairTarget?.documentId),
      ].join('::')
      const freshRouteIssues =
        freshDirect.issuesByTypeDocument.get(routeKey) || []

      if (freshRouteIssues.length > 0) {
        rejectedItems.push({
          issueId: clean(item?.issueId),
          documentId: clean(item?.repairTarget?.documentId),
          reason: 'freshRepairRouteChanged',
        })
        return
      }

      resolvedItems.push({
        issueId: clean(item?.issueId),
        documentId: clean(item?.repairTarget?.documentId),
        reason: 'freshAuditNoLongerReportsIssue',
      })
      return
    }

    if (matches.length !== 1) {
      rejectedItems.push({
        issueId: clean(item?.issueId),
        documentId: clean(item?.repairTarget?.documentId),
        reason: 'freshAuditIssueAmbiguous',
      })
      return
    }

    const freshIssue = matches[0]
    if (
      clean(freshIssue?.searchIndexDocumentId) !==
      clean(item?.repairTarget?.documentId)
    ) {
      rejectedItems.push({
        issueId: clean(item?.issueId),
        documentId: clean(item?.repairTarget?.documentId),
        reason: 'freshRepairTargetMismatch',
      })
      return
    }

    issues.push(freshIssue)
  })

  return {
    issues,
    resolvedItems,
    rejectedItems,
  }
}

const assertNoFieldConflicts = issues => {
  const documentFields = new Map()
  const conflicts = []

  ;(Array.isArray(issues) ? issues : []).forEach(issue => {
    const documentId = clean(issue?.searchIndexDocumentId)
    const fields = issue?.repairData?.fields
    if (!documentId || !fields || typeof fields !== 'object') return

    const current = documentFields.get(documentId) || new Map()

    Object.entries(fields).forEach(([field, value]) => {
      if (!current.has(field)) {
        current.set(field, value)
        return
      }

      if (!sameValue(current.get(field), value)) {
        conflicts.push({
          documentId,
          field,
        })
      }
    })

    documentFields.set(documentId, current)
  })

  if (conflicts.length) {
    throw new Error(
      'תוכנית התיקון מכילה ערכים סותרים לאותו שדה באותו אינדקס. יש להריץ בדיקה חדשה לפני תיקון.'
    )
  }
}

const buildFreshAuditScopes = ({ audit, plannedItems }) => {
  if (audit?.scope?.type === AUDIT_SCOPE_TYPE.TEAM_SEASON) {
    return [audit.scope]
  }

  const scopes = new Map()
  const unresolvedItems = []

  plannedItems.forEach(({ item, issue, sourceIssue }) => {
    const teamDocumentId = clean(
      issue?.teamDocumentId ||
      sourceIssue?.teamDocumentId ||
      sourceIssue?.birthTeamDocumentId
    )
    const seasonKey = clean(
      issue?.seasonKey ||
      sourceIssue?.seasonKey ||
      sourceIssue?.seasonId
    )

    if (!teamDocumentId || !seasonKey) {
      unresolvedItems.push({
        issueId: clean(item?.issueId),
        documentId: clean(item?.repairTarget?.documentId),
        reason: 'freshScopeUnavailable',
      })
      return
    }

    const key = `${teamDocumentId}::${seasonKey}`
    if (!scopes.has(key)) {
      scopes.set(key, buildAuditTeamSeasonScope({
        teamDocumentId,
        seasonKey,
      }))
    }
  })

  return unresolvedItems.length
    ? { scopes: [], unresolvedItems }
    : { scopes: [...scopes.values()], unresolvedItems: [] }
}

const runFreshRepairAudits = async ({ audit, plannedItems }) => {
  const scopePlan = buildFreshAuditScopes({ audit, plannedItems })

  if (Array.isArray(scopePlan)) {
    const freshAudit = await runPlayerDatabaseAudit({
      scope: scopePlan[0],
      includeRepairData: true,
    })

    return {
      audits: [freshAudit],
      issues: Array.isArray(freshAudit?.issues) ? freshAudit.issues : [],
      readsUsed: Number(freshAudit?.readsUsed || 0),
      generatedAt: clean(freshAudit?.generatedAt),
      unresolvedItems: [],
    }
  }

  if (scopePlan.unresolvedItems.length) {
    return {
      audits: [],
      issues: [],
      readsUsed: 0,
      generatedAt: '',
      unresolvedItems: scopePlan.unresolvedItems,
    }
  }

  const audits = []
  for (const scope of scopePlan.scopes) {
    audits.push(await runPlayerDatabaseAudit({
      scope,
      includeRepairData: true,
    }))
  }

  return {
    audits,
    issues: audits.flatMap(item => (
      Array.isArray(item?.issues) ? item.issues : []
    )),
    readsUsed: audits.reduce((sum, item) => (
      sum + Number(item?.readsUsed || 0)
    ), 0),
    generatedAt: audits
      .map(item => clean(item?.generatedAt))
      .filter(Boolean)
      .sort()
      .at(-1) || '',
    unresolvedItems: [],
  }
}

export async function applyPlayerDatabaseRepairPlan({
  audit,
  plan,
  confirmed = false,
  verify = true,
} = {}) {
  if (confirmed !== true) {
    throw new Error('ביצוע תיקון דורש אישור מפורש.')
  }

  validatePlan({ audit, plan })

  const plannedSelection = collectPlannedDirectItems({ audit, plan })

  if (plannedSelection.rejectedItems.length) {
    throw new Error(
      'תוכנית התיקון השתנתה או כוללת יעד שאינו מאושר לתיקון אוטומטי.'
    )
  }

  const freshAuditSet = await runFreshRepairAudits({
    audit,
    plannedItems: plannedSelection.items,
  })

  if (freshAuditSet.unresolvedItems.length) {
    throw new Error(
      'לא ניתן לקבוע היקף בדיקה טרי וממוקד עבור אחד מיעדי התיקון. יש להריץ בדיקה חדשה.'
    )
  }

  const freshSelection = resolveFreshSelection({
    plannedItems: plannedSelection.items,
    freshAudit: {
      issues: freshAuditSet.issues,
    },
  })

  if (freshSelection.rejectedItems.length) {
    throw new Error(
      'מקור האמת השתנה מאז הבדיקה המקורית. יש להכין תוכנית תיקון חדשה.'
    )
  }

  assertNoFieldConflicts(freshSelection.issues)

  const directSearchIndex = freshSelection.issues.length
    ? await repairSearchIndexIssuesDirect({
        issues: freshSelection.issues,
      })
    : {
        issuesCount: 0,
        targetDocumentsCount: 0,
        reads: 0,
        writes: 0,
        updatedCount: 0,
        alreadyRepairedCount: 0,
        skippedCount: 0,
        results: [],
      }

  const freshnessReads = Number(freshAuditSet.readsUsed || 0)
  const baseResult = {
    generatedAt: new Date().toISOString(),
    mode: 'audit-v2-automatic-apply',
    originalAuditGeneratedAt: clean(audit.generatedAt),
    freshAuditGeneratedAt: clean(freshAuditSet.generatedAt),
    freshAuditScopesCount: freshAuditSet.audits.length,
    freshnessReads,
    freshResolvedCount: freshSelection.resolvedItems.length,
    freshResolvedItems: freshSelection.resolvedItems,
    automaticItemsCount: plannedSelection.items.length,
    appliedItemsCount: freshSelection.issues.length,
    rejectedItemsCount: 0,
    rejectedItems: [],
    directSearchIndex,
    reads: freshnessReads + Number(directSearchIndex?.reads || 0),
    writes: Number(directSearchIndex?.writes || 0),
    changedDocumentsCount: Number(directSearchIndex?.updatedCount || 0),
    alreadyCorrectCount:
      Number(directSearchIndex?.alreadyRepairedCount || 0) +
      freshSelection.resolvedItems.length,
    skippedCount: Number(directSearchIndex?.skippedCount || 0),
  }

  if (verify !== true) {
    return {
      ...baseResult,
      verification: {
        executed: false,
        complete: true,
        reads: 0,
        results: [],
      },
    }
  }

  const verification = await verifyPlayerDatabaseRepair({
    issues: freshSelection.issues,
    applyResult: baseResult,
  })

  return {
    ...baseResult,
    reads: baseResult.reads + Number(verification.reads || 0),
    verification,
  }
}

// src/features/playersDatabase/services/audit/playerScoutGlobalRepair.preview.js

import {
  buildPlayerScoutEngineRefreshPreview,
  buildPlayerScoutRepairPreview,
} from './playerScout.repair.js'
import { buildPlayerScoutRulesAudit } from './playerScoutRules.audit.js'
import {
  PLAYER_SCOUT_ISSUE_KIND,
  PLAYER_SCOUT_REPAIR_TYPE,
  normalizePlayerScoutAuditIssue,
} from './playerScoutAudit.contract.js'
import { buildPlayerScoutMigrationPlan } from './playerScoutRepair.migrationPlan.js'
import { canDirectRepairSearchIndexIssue } from './playerScoutSearchIndex.directRepair.js'

const clean = value => String(
  value === undefined || value === null ? '' : value
).trim()

const unique = values => [
  ...new Set(
    (Array.isArray(values) ? values : [])
      .map(clean)
      .filter(Boolean)
  ),
]

const REGULAR_REPAIR_TYPES = new Set([
  PLAYER_SCOUT_REPAIR_TYPE.TEAM_PLAYER,
  PLAYER_SCOUT_REPAIR_TYPE.PLAYER_DOCUMENT,
  PLAYER_SCOUT_REPAIR_TYPE.PLAYER_SEARCH_INDEX,
  PLAYER_SCOUT_REPAIR_TYPE.TEAM_SEARCH_INDEX,
  PLAYER_SCOUT_REPAIR_TYPE.LEAGUE_PROJECTION,
  PLAYER_SCOUT_REPAIR_TYPE.LEGACY_SCOPE_REPAIR,
])

const normalizeAuditIssues = audit => (
  (Array.isArray(audit?.issues) ? audit.issues : [])
    .map(normalizePlayerScoutAuditIssue)
)

const observedDocumentsCount = audit => {
  const observed = audit?.cost?.audit?.documentsObserved || {}

  return (
    Number(observed.teamDocuments || 0) +
    Number(observed.playerDocuments || 0) +
    Number(observed.playerDocumentLookups || 0) +
    Number(observed.playerSearchIndexes || 0) +
    Number(observed.teamSearchIndexes || 0)
  )
}

const observedDocuments = audit => audit?.cost?.audit?.documentsObserved || {}

const isScopedAudit = audit => (
  clean(audit?.mode) === 'read-only-scoped' ||
  Boolean(audit?.scope) ||
  Boolean(audit?.readPlan)
)

const isSuspiciousEmptyGlobalAudit = audit => (
  !isScopedAudit(audit) &&
  normalizeAuditIssues(audit).length === 0 &&
  (Array.isArray(audit?.recalculatedRows) ? audit.recalculatedRows.length : 0) === 0 &&
  observedDocumentsCount(audit) === 0 &&
  Number(audit?.cost?.audit?.reads?.total || 0) <= 4
)

const isSuspiciousIncompleteGlobalAudit = audit => {
  if (isScopedAudit(audit)) return false

  const observed = observedDocuments(audit)

  return (
    Number(observed.teamDocuments || 0) > 0 &&
    Number(observed.playerDocuments || 0) === 0
  )
}

const invalidPreviewResult = ({
  reason,
  audit,
  source = '',
} = {}) => ({
  generatedAt: new Date().toISOString(),
  mode: 'global-repair-preview',
  valid: false,
  reason,
  source,
  auditSummary: {
    ...(audit?.summary || {}),
    contractSummary: audit?.contractSummary || {},
    cost: audit?.cost || {},
  },
  selectedIssuesSummary: {
    sourceIssuesCount: normalizeAuditIssues(audit).length,
    requestedIssuesCount: 0,
    selectedIssuesCount: 0,
    mode: 'invalid',
    selectedIssueIds: [],
    byClass: {
      migration: 0,
      engineRefresh: 0,
      directRepair: 0,
      regularRepair: 0,
    },
  },
  migrationPlan: {},
  engineRefreshPreview: {},
  directRepairPreview: {},
  regularRepairPreview: {},
  targetDocuments: {
    teams: [],
    players: [],
    searchIndexes: [],
  },
  actualDocumentWrites: {
    uniqueTeamWrites: 0,
    uniquePlayerWrites: 0,
    uniqueSearchIndexWrites: 0,
    totalActualDocumentWrites: 0,
    playerDocumentsWithMergedScopes: 0,
    playerTargetsWithMultipleScopes: [],
    noDuplicateDocumentWrites: true,
  },
  safeRepairCandidates: {
    byClass: {
      migration: { documentsCount: 0, issuesCount: 0 },
      engineRefresh: { documentsCount: 0, issuesCount: 0 },
      directRepair: { documentsCount: 0, issuesCount: 0 },
      regularRepair: { documentsCount: 0, issuesCount: 0 },
    },
    blockedByOverlap: {
      documentsCount: 0,
      issuesCount: 0,
    },
  },
  cost: {
    auditReads: Number(audit?.cost?.audit?.reads?.total || 0),
    applyReadsMaximum: 0,
    writesMaximum: 0,
    verificationReadsMaximum: 0,
    processReadsMaximum: Number(audit?.cost?.audit?.reads?.total || 0),
  },
  duplicateWritePrevention: {
    teamDocumentsDeduped: 0,
    playerDocumentsDeduped: 0,
    searchIndexesDeduped: 0,
    overlaps: [],
    overlapsCount: 0,
  },
})

const selectIssues = ({
  audit,
  selectedIssueIds,
  excludedIssueIds: rawExcludedIssueIds,
} = {}) => {
  const issues = normalizeAuditIssues(audit)
  const excludedIssueIds = new Set(unique(rawExcludedIssueIds))
  const hasExplicitSelection = Array.isArray(selectedIssueIds)
  const requestedIssueIds = hasExplicitSelection
    ? unique(selectedIssueIds).filter(issueId => !excludedIssueIds.has(issueId))
    : issues
        .map(issue => clean(issue.issueId))
        .filter(issueId => issueId && !excludedIssueIds.has(issueId))
  const issuesById = new Map(
    issues
      .filter(issue => clean(issue.issueId))
      .map(issue => [clean(issue.issueId), issue])
  )
  const missingIssueIds = requestedIssueIds.filter(issueId => (
    !issuesById.has(issueId)
  ))

  if (missingIssueIds.length) {
    const error = new Error(
      `Selected audit issues were not found: ${missingIssueIds.join(', ')}`
    )

    error.name = 'PlayerScoutGlobalRepairPreviewError'
    error.code = 'PLAYER_SCOUT_GLOBAL_PREVIEW_ISSUES_NOT_FOUND'
    error.issueIds = missingIssueIds
    throw error
  }

  const selectedIssues = requestedIssueIds
    .map(issueId => issuesById.get(issueId))
    .filter(Boolean)

  return {
    mode: hasExplicitSelection ? 'selected' : 'all',
    requestedIssueIds,
    selectedIssueIds: unique(selectedIssues.map(issue => issue.issueId)),
    selectedIssues,
    excludedIssueIds: [...excludedIssueIds],
    summary: {
      sourceIssuesCount: issues.length,
      requestedIssuesCount: requestedIssueIds.length,
      selectedIssuesCount: selectedIssues.length,
      excludedIssuesCount: excludedIssueIds.size,
    },
  }
}

const buildAuditWithIssues = ({ audit, issues }) => {
  const issueIds = new Set(
    (Array.isArray(issues) ? issues : []).map(issue => clean(issue.issueId))
  )
  const byKind = (items = []) => (
    (Array.isArray(items) ? items : [])
      .map(normalizePlayerScoutAuditIssue)
      .filter(issue => issueIds.has(clean(issue.issueId)))
  )

  return {
    ...audit,
    issues,
    auditIssues: byKind(audit?.auditIssues),
    migrationIssues: byKind(audit?.migrationIssues),
    diagnostics: byKind(audit?.diagnostics),
  }
}

const issueSeasonKey = issue => clean(issue?.seasonKey || issue?.seasonId)

const buildRowTarget = ({ issue, repairClass } = {}) => ({
  issueId: clean(issue?.issueId),
  type: clean(issue?.type),
  repairClass: clean(repairClass),
  seasonId: clean(issue?.seasonId),
  seasonKey: issueSeasonKey(issue),
  playerId: clean(issue?.playerId),
  playerDocumentId: clean(issue?.playerDocumentId),
  externalPlayerId: clean(issue?.externalPlayerId),
  teamDocumentId: clean(issue?.teamDocumentId),
  searchIndexDocumentId: clean(issue?.searchIndexDocumentId),
  mismatchedFields: unique(issue?.mismatchedFields),
  missingFields: unique(issue?.missingFields),
})

const targetKey = target => `${clean(target?.collection)}::${clean(target?.documentId)}`

const addDocumentTarget = ({
  targetMap,
  collection,
  documentId,
  repairClass,
  issue,
} = {}) => {
  const safeDocumentId = clean(documentId)
  if (!safeDocumentId) return

  const key = `${collection}::${safeDocumentId}`
  const current = targetMap.get(key) || {
    collection,
    documentId: safeDocumentId,
    repairClasses: [],
    issueIds: [],
    issuesCount: 0,
    rowTargets: [],
  }

  current.repairClasses = unique([
    ...current.repairClasses,
    repairClass,
  ])
  current.issueIds = unique([
    ...current.issueIds,
    issue?.issueId,
  ])
  current.issuesCount = current.issueIds.length
  current.rowTargets.push(buildRowTarget({
    issue,
    repairClass,
  }))
  targetMap.set(key, current)
}

const addIssueDocumentTarget = ({ targetMap, repairClass, issue }) => {
  const repairType = clean(issue?.repair?.repairType)

  if (
    repairClass === 'directRepair' ||
    repairType === PLAYER_SCOUT_REPAIR_TYPE.PLAYER_SEARCH_INDEX ||
    repairType === PLAYER_SCOUT_REPAIR_TYPE.PLAYER_SEARCH_INDEX_MIGRATION ||
    repairType === PLAYER_SCOUT_REPAIR_TYPE.TEAM_SEARCH_INDEX
  ) {
    addDocumentTarget({
      targetMap,
      collection: 'searchIndexes',
      documentId: issue?.searchIndexDocumentId,
      repairClass,
      issue,
    })
  }

  if (
    repairType === PLAYER_SCOUT_REPAIR_TYPE.PLAYER_DOCUMENT ||
    repairType === PLAYER_SCOUT_REPAIR_TYPE.PLAYER_DOCUMENT_MIGRATION
  ) {
    addDocumentTarget({
      targetMap,
      collection: 'players',
      documentId: issue?.playerDocumentId,
      repairClass,
      issue,
    })
  }

  if (
    repairType === PLAYER_SCOUT_REPAIR_TYPE.TEAM_PLAYER ||
    repairType === PLAYER_SCOUT_REPAIR_TYPE.TEAM_PLAYER_MIGRATION ||
    repairType === PLAYER_SCOUT_REPAIR_TYPE.LEGACY_SCOPE_REPAIR
  ) {
    addDocumentTarget({
      targetMap,
      collection: 'teams',
      documentId: issue?.teamDocumentId,
      repairClass,
      issue,
    })
  }
}

const addEngineTargets = ({ targetMap, engineRefreshPreview, issues }) => {
  const issuesByTeamDocument = new Map()
  const issuesByPlayerDocument = new Map()
  const issuesBySearchIndexDocument = new Map()

  ;(Array.isArray(issues) ? issues : []).forEach(issue => {
    const teamDocumentId = clean(issue?.teamDocumentId)
    const playerDocumentId = clean(issue?.playerDocumentId)
    const searchIndexDocumentId = clean(issue?.searchIndexDocumentId)

    if (teamDocumentId) {
      const current = issuesByTeamDocument.get(teamDocumentId) || []
      current.push(issue)
      issuesByTeamDocument.set(teamDocumentId, current)
    }
    if (playerDocumentId) {
      const current = issuesByPlayerDocument.get(playerDocumentId) || []
      current.push(issue)
      issuesByPlayerDocument.set(playerDocumentId, current)
    }
    if (searchIndexDocumentId) {
      const current = issuesBySearchIndexDocument.get(searchIndexDocumentId) || []
      current.push(issue)
      issuesBySearchIndexDocument.set(searchIndexDocumentId, current)
    }
  })

  ;(engineRefreshPreview?.targets?.teams || []).forEach(target => {
    ;(issuesByTeamDocument.get(clean(target.teamDocumentId)) || []).forEach(issue => {
      addDocumentTarget({
        targetMap,
        collection: 'teams',
        documentId: target.teamDocumentId,
        repairClass: 'engineRefresh',
        issue,
      })
    })
  })

  ;(engineRefreshPreview?.targets?.players || []).forEach(target => {
    ;(issuesByPlayerDocument.get(clean(target.playerDocumentId)) || []).forEach(issue => {
      addDocumentTarget({
        targetMap,
        collection: 'players',
        documentId: target.playerDocumentId,
        repairClass: 'engineRefresh',
        issue,
      })
    })
  })

  ;(engineRefreshPreview?.targets?.searchIndexes || []).forEach(target => {
    ;(issuesBySearchIndexDocument.get(clean(target.searchIndexDocumentId)) || []).forEach(issue => {
      addDocumentTarget({
        targetMap,
        collection: 'searchIndexes',
        documentId: target.searchIndexDocumentId,
        repairClass: 'engineRefresh',
        issue,
      })
    })
  })
}

const splitTargetsByCollection = targetMap => {
  const targets = [...targetMap.values()]
    .map(target => ({
      ...target,
      rowTargets: target.rowTargets,
    }))
    .sort((first, second) => (
      `${first.collection}::${first.documentId}`
        .localeCompare(`${second.collection}::${second.documentId}`)
    ))

  return {
    teams: targets.filter(target => target.collection === 'teams'),
    players: targets.filter(target => target.collection === 'players'),
    searchIndexes: targets.filter(target => target.collection === 'searchIndexes'),
  }
}

const buildOverlaps = targetDocuments => (
  [
    ...targetDocuments.teams,
    ...targetDocuments.players,
    ...targetDocuments.searchIndexes,
  ].filter(target => target.repairClasses.length > 1)
    .map(target => ({
      collection: target.collection,
      documentId: target.documentId,
      repairClasses: target.repairClasses,
      issueIds: target.issueIds,
      issuesCount: target.issuesCount,
    }))
)

const SAFE_DEPENDENCY_OVERLAP_KEYS = new Set([
  'engineRefresh::migration',
  'engineRefresh::regularRepair',
  'migration::regularRepair',
])

const dependencyOverlapKey = repairClasses => unique(repairClasses)
  .sort()
  .join('::')

const buildSafeDependencyOverlapCandidates = targetDocuments => {
  const targets = [
    ...targetDocuments.teams,
    ...targetDocuments.players,
    ...targetDocuments.searchIndexes,
  ]
    .filter(target => {
      const repairClasses = unique(target?.repairClasses)

      return repairClasses.length === 2 &&
        SAFE_DEPENDENCY_OVERLAP_KEYS.has(dependencyOverlapKey(repairClasses))
    })
    .map(target => ({
      collection: target.collection,
      documentId: target.documentId,
      repairClasses: unique(target.repairClasses),
      issueIds: unique(target.issueIds),
      issuesCount: Number(target.issuesCount || 0),
    }))

  const byCombination = targets.reduce((result, target) => {
    const key = dependencyOverlapKey(target.repairClasses)
    const current = result[key] || {
      repairClasses: [...target.repairClasses].sort(),
      documentsCount: 0,
      issueIds: [],
      issuesCount: 0,
    }

    current.documentsCount += 1
    current.issueIds = unique([
      ...current.issueIds,
      ...target.issueIds,
    ])
    current.issuesCount = current.issueIds.length
    result[key] = current
    return result
  }, {})
  const issueIds = unique(targets.flatMap(target => target.issueIds))

  return {
    documentsCount: targets.length,
    issuesCount: issueIds.length,
    issueIds,
    targets,
    byCombination,
  }
}

const targetScopeKeys = target => unique(
  (Array.isArray(target?.rowTargets) ? target.rowTargets : [])
    .map(rowTarget => [
      clean(rowTarget.teamDocumentId),
      issueSeasonKey(rowTarget),
    ].join('::'))
)

const buildActualDocumentWritePreview = targetDocuments => {
  const teams = Array.isArray(targetDocuments?.teams) ? targetDocuments.teams : []
  const players = Array.isArray(targetDocuments?.players) ? targetDocuments.players : []
  const searchIndexes = Array.isArray(targetDocuments?.searchIndexes)
    ? targetDocuments.searchIndexes
    : []
  const playerTargetsWithMultipleScopes = players
    .map(target => ({
      collection: target.collection,
      documentId: target.documentId,
      scopes: targetScopeKeys(target),
      issueIds: unique(target.issueIds),
      issuesCount: Number(target.issuesCount || 0),
    }))
    .filter(target => target.scopes.length > 1)

  return {
    uniqueTeamWrites: teams.length,
    uniquePlayerWrites: players.length,
    uniqueSearchIndexWrites: searchIndexes.length,
    totalActualDocumentWrites: teams.length + players.length + searchIndexes.length,
    playerDocumentsWithMergedScopes: playerTargetsWithMultipleScopes.length,
    playerTargetsWithMultipleScopes,
    noDuplicateDocumentWrites: (
      new Set([
        ...teams,
        ...players,
        ...searchIndexes,
      ].map(target => `${target.collection}::${target.documentId}`)).size ===
      teams.length + players.length + searchIndexes.length
    ),
  }
}

const EMPTY_SAFE_REPAIR_CLASS = {
  documentsCount: 0,
  issuesCount: 0,
}

const buildSafeRepairCandidates = targetDocuments => {
  const targets = [
    ...(Array.isArray(targetDocuments?.teams) ? targetDocuments.teams : []),
    ...(Array.isArray(targetDocuments?.players) ? targetDocuments.players : []),
    ...(Array.isArray(targetDocuments?.searchIndexes) ? targetDocuments.searchIndexes : []),
  ]
  const byClass = {
    migration: { ...EMPTY_SAFE_REPAIR_CLASS },
    engineRefresh: { ...EMPTY_SAFE_REPAIR_CLASS },
    directRepair: { ...EMPTY_SAFE_REPAIR_CLASS },
    regularRepair: { ...EMPTY_SAFE_REPAIR_CLASS },
  }
  const blockedIssueIds = new Set()

  targets.forEach(target => {
    const repairClasses = unique(target.repairClasses)
    const issueIds = unique(target.issueIds)

    if (repairClasses.length !== 1) {
      issueIds.forEach(issueId => blockedIssueIds.add(issueId))
      return
    }

    const repairClass = repairClasses[0]
    if (!byClass[repairClass]) return

    byClass[repairClass].documentsCount += 1
    byClass[repairClass].issuesCount += issueIds.length
  })

  return {
    byClass,
    blockedByOverlap: {
      documentsCount: targets.filter(target => unique(target.repairClasses).length > 1).length,
      issuesCount: blockedIssueIds.size,
    },
  }
}

const countIssuesByType = issues => (
  (Array.isArray(issues) ? issues : []).reduce((result, issue) => {
    const type = clean(issue?.type) || 'unknown'

    return {
      ...result,
      [type]: Number(result[type] || 0) + 1,
    }
  }, {})
)

const countRegularTargetDocumentsByType = targetDocuments => {
  const targets = [
    ...(Array.isArray(targetDocuments?.teams) ? targetDocuments.teams : []),
    ...(Array.isArray(targetDocuments?.players) ? targetDocuments.players : []),
    ...(Array.isArray(targetDocuments?.searchIndexes) ? targetDocuments.searchIndexes : []),
  ]
  const byType = new Map()

  targets
    .filter(target => {
      const repairClasses = unique(target?.repairClasses)

      return repairClasses.length === 1 && repairClasses[0] === 'regularRepair'
    })
    .forEach(target => {
      const documentKey = targetKey(target)

      ;(Array.isArray(target?.rowTargets) ? target.rowTargets : [])
        .filter(rowTarget => clean(rowTarget?.repairClass) === 'regularRepair')
        .forEach(rowTarget => {
          const type = clean(rowTarget?.type) || 'unknown'
          const current = byType.get(type) || new Set()
          current.add(documentKey)
          byType.set(type, current)
        })
    })

  return [...byType.entries()].reduce((result, [type, documentKeys]) => ({
    ...result,
    [type]: documentKeys.size,
  }), {})
}

const regularPlayerDocumentIds = targetDocuments => unique(
  (Array.isArray(targetDocuments?.players) ? targetDocuments.players : [])
    .filter(target => {
      const repairClasses = unique(target?.repairClasses)

      return repairClasses.length === 1 && repairClasses[0] === 'regularRepair'
    })
    .map(target => target.documentId)
)

const buildDirectRepairPreview = issues => {
  const targetsByDocument = new Map()

  ;(Array.isArray(issues) ? issues : []).forEach(issue => {
    const searchIndexDocumentId = clean(issue?.searchIndexDocumentId)
    if (!searchIndexDocumentId) return

    const current = targetsByDocument.get(searchIndexDocumentId) || {
      searchIndexDocumentId,
      target: clean(issue?.repairData?.writer) === 'DIRECT_TEAM_SEARCH_INDEX'
        ? 'teamSearchIndex'
        : 'playerSearchIndex',
      issueIds: [],
      issuesCount: 0,
      fields: [],
    }

    current.issueIds = unique([...current.issueIds, issue.issueId])
    current.issuesCount = current.issueIds.length
    current.fields = unique([
      ...current.fields,
      ...Object.keys(issue?.repairData?.fields || {}),
    ])
    targetsByDocument.set(searchIndexDocumentId, current)
  })

  const targets = [...targetsByDocument.values()]

  return {
    issuesCount: issues.length,
    targetDocumentsCount: targets.length,
    targets,
    cost: {
      readsMaximum: targets.length,
      writesMaximum: targets.length,
      verificationReadsMaximum: targets.length,
      processReadsMaximum: targets.length * 2,
      processWritesMaximum: targets.length,
    },
  }
}

const auditReadsOf = audit => Number(audit?.cost?.audit?.reads?.total || 0)

const repairCostReadsOf = preview => Number(
  preview?.cost?.reads?.applyEstimated || 0
)

const repairCostWritesOf = preview => Number(
  preview?.cost?.writes?.estimatedMax || 0
)

const repairVerificationReadsOf = preview => Number(
  preview?.cost?.reads?.verificationEstimatedMax ||
  preview?.cost?.reads?.verificationEstimatedMin ||
  0
)

const emptyRepairPreview = {
  summary: {},
  cost: {
    reads: {
      applyEstimated: 0,
      verificationEstimatedMax: 0,
      verificationEstimatedMin: 0,
    },
    writes: {
      estimatedMax: 0,
    },
  },
  repairRoutes: [],
  affectedScopes: [],
}

export async function buildPlayerScoutGlobalRepairPreview({
  audit: sourceAudit = null,
  selectedIssueIds,
  excludedIssueIds,
} = {}) {
  const audit = sourceAudit || await buildPlayerScoutRulesAudit({
    includeRepairData: true,
  })
  const source = sourceAudit ? 'provided_audit' : 'built_audit'

  if (isScopedAudit(audit)) {
    return invalidPreviewResult({
      reason: 'GLOBAL_AUDIT_SCOPED_SOURCE',
      audit,
      source,
    })
  }

  if (isSuspiciousEmptyGlobalAudit(audit)) {
    return invalidPreviewResult({
      reason: 'GLOBAL_AUDIT_DATASET_EMPTY',
      audit,
      source,
    })
  }

  if (isSuspiciousIncompleteGlobalAudit(audit)) {
    return invalidPreviewResult({
      reason: 'GLOBAL_AUDIT_PLAYER_DATASET_MISSING',
      audit,
      source,
    })
  }

  const selection = selectIssues({
    audit,
    selectedIssueIds,
    excludedIssueIds,
  })
  const selectedIssues = selection.selectedIssues
  const migrationIssues = selectedIssues.filter(issue => (
    clean(issue.issueKind) === PLAYER_SCOUT_ISSUE_KIND.MIGRATION
  ))
  const engineIssues = selectedIssues.filter(issue => (
    clean(issue?.repair?.repairType) === PLAYER_SCOUT_REPAIR_TYPE.ENGINE_REFRESH
  ))
  const directIssues = selectedIssues.filter(canDirectRepairSearchIndexIssue)
  const directIssueIds = new Set(directIssues.map(issue => clean(issue.issueId)))
  const regularIssues = selectedIssues.filter(issue => (
    !directIssueIds.has(clean(issue.issueId)) &&
    clean(issue.issueKind) !== PLAYER_SCOUT_ISSUE_KIND.MIGRATION &&
    clean(issue?.repair?.repairType) !== PLAYER_SCOUT_REPAIR_TYPE.ENGINE_REFRESH &&
    REGULAR_REPAIR_TYPES.has(clean(issue?.repair?.repairType))
  ))
  const allIssues = normalizeAuditIssues(audit)
  const allDirectIssueIds = new Set(
    allIssues
      .filter(canDirectRepairSearchIndexIssue)
      .map(issue => clean(issue.issueId))
  )
  const allRegularIssues = allIssues.filter(issue => (
    !allDirectIssueIds.has(clean(issue.issueId)) &&
    clean(issue.issueKind) !== PLAYER_SCOUT_ISSUE_KIND.MIGRATION &&
    clean(issue?.repair?.repairType) !== PLAYER_SCOUT_REPAIR_TYPE.ENGINE_REFRESH &&
    REGULAR_REPAIR_TYPES.has(clean(issue?.repair?.repairType))
  ))
  const excludedIssueIdSet = new Set(unique(selection.excludedIssueIds))

  const migrationAudit = buildAuditWithIssues({
    audit,
    issues: migrationIssues,
  })
  const engineAudit = buildAuditWithIssues({
    audit,
    issues: engineIssues,
  })
  const regularAudit = buildAuditWithIssues({
    audit,
    issues: regularIssues,
  })

  const migrationPlan = buildPlayerScoutMigrationPlan({
    issues: migrationIssues,
  })
  const migrationRepairPreview = migrationIssues.length
    ? await buildPlayerScoutRepairPreview({ audit: migrationAudit })
    : emptyRepairPreview
  const engineRefreshPreview = buildPlayerScoutEngineRefreshPreview({
    audit: engineAudit,
  })
  const directRepairPreview = buildDirectRepairPreview(directIssues)
  const regularRepairPreview = regularIssues.length
    ? await buildPlayerScoutRepairPreview({ audit: regularAudit })
    : emptyRepairPreview

  const targetMap = new Map()

  migrationIssues.forEach(issue => addIssueDocumentTarget({
    targetMap,
    repairClass: 'migration',
    issue,
  }))
  addEngineTargets({
    targetMap,
    engineRefreshPreview,
    issues: engineIssues,
  })
  directIssues.forEach(issue => addIssueDocumentTarget({
    targetMap,
    repairClass: 'directRepair',
    issue,
  }))
  regularIssues.forEach(issue => addIssueDocumentTarget({
    targetMap,
    repairClass: 'regularRepair',
    issue,
  }))

  const targetDocuments = splitTargetsByCollection(targetMap)
  const overlaps = buildOverlaps(targetDocuments)
  const actualDocumentWrites = buildActualDocumentWritePreview(targetDocuments)
  const safeRepairCandidates = buildSafeRepairCandidates(targetDocuments)
  const safeDependencyOverlapCandidates = buildSafeDependencyOverlapCandidates(
    targetDocuments
  )
  const regularPreviewTelemetry = {
    regularIssuesByType: countIssuesByType(regularIssues),
    regularTargetDocumentsByType: countRegularTargetDocumentsByType(
      targetDocuments
    ),
    regularPlayerDocumentIds: regularPlayerDocumentIds(targetDocuments),
    playerDocumentsObserved: Number(
      audit?.cost?.audit?.documentsObserved?.playerDocuments || 0
    ),
    regularIssuesPreviouslyResolvedCount: allRegularIssues.filter(issue => (
      excludedIssueIdSet.has(clean(issue.issueId))
    )).length,
    regularIssuesDeferredCount: 0,
    regularIssuesCount: regularIssues.length,
    regularTargetDocumentsCount:
      safeRepairCandidates.byClass.regularRepair?.documentsCount || 0,
  }
  const auditReads = auditReadsOf(audit)
  const applyReadsMaximum = (
    repairCostReadsOf(migrationRepairPreview) +
    Number(engineRefreshPreview?.cost?.readsMaximum || 0) +
    Number(directRepairPreview?.cost?.readsMaximum || 0) +
    repairCostReadsOf(regularRepairPreview)
  )
  const writesMaximum = (
    repairCostWritesOf(migrationRepairPreview) +
    Number(engineRefreshPreview?.cost?.writesMaximum || 0) +
    Number(directRepairPreview?.cost?.writesMaximum || 0) +
    repairCostWritesOf(regularRepairPreview)
  )
  const verificationReadsMaximum = (
    repairVerificationReadsOf(migrationRepairPreview) +
    Number(directRepairPreview?.cost?.verificationReadsMaximum || 0) +
    repairVerificationReadsOf(regularRepairPreview)
  )

  return {
    generatedAt: new Date().toISOString(),
    mode: 'global-repair-preview',
    valid: true,
    source,
    sourceAuditGeneratedAt: clean(audit?.generatedAt),
    auditSummary: {
      ...(audit?.summary || {}),
      contractSummary: audit?.contractSummary || {},
      cost: audit?.cost || {},
    },
    selectedIssuesSummary: {
      ...selection.summary,
      mode: selection.mode,
      selectedIssueIds: selection.selectedIssueIds,
      excludedIssueIds: selection.excludedIssueIds,
      excludedIssuesCount: selection.summary.excludedIssuesCount,
      byClass: {
        migration: migrationIssues.length,
        engineRefresh: engineIssues.length,
        directRepair: directIssues.length,
        regularRepair: regularIssues.length,
      },
    },
    migrationPlan: {
      ...migrationPlan,
      preview: {
        summary: migrationRepairPreview.summary,
        cost: migrationRepairPreview.cost,
        repairRoutes: migrationRepairPreview.repairRoutes,
      },
    },
    engineRefreshPreview,
    directRepairPreview,
    regularRepairPreview,
    regularPreviewTelemetry,
    targetDocuments,
    actualDocumentWrites,
    safeRepairCandidates,
    safeDependencyOverlapCandidates,
    cost: {
      auditReads,
      applyReadsMaximum,
      writesMaximum,
      verificationReadsMaximum,
      processReadsMaximum: auditReads + applyReadsMaximum + verificationReadsMaximum,
    },
    duplicateWritePrevention: {
      teamDocumentsDeduped: targetDocuments.teams.length,
      playerDocumentsDeduped: targetDocuments.players.length,
      searchIndexesDeduped: targetDocuments.searchIndexes.length,
      overlaps,
      overlapsCount: overlaps.length,
    },
  }
}

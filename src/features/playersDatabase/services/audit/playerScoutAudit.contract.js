// src/features/playersDatabase/services/audit/playerScoutAudit.contract.js

const clean = value => String(
  value === undefined || value === null ? '' : value
).trim()

const uniqueCleanValues = values => [
  ...new Set(
    (Array.isArray(values) ? values : [])
      .map(clean)
      .filter(Boolean)
  ),
]

export const PLAYER_SCOUT_AUDIT_CONTRACT_VERSION = 1

export const PLAYER_SCOUT_ISSUE_KIND = Object.freeze({
  AUDIT: 'audit',
  MIGRATION: 'migration',
  DIAGNOSTIC: 'diagnostic',
})

export const PLAYER_SCOUT_AUDIT_CHECK_STATUS = Object.freeze({
  EXECUTED: 'executed',
  SKIPPED: 'skipped',
  BLOCKED: 'blocked',
})

export const PLAYER_SCOUT_AUDIT_PROCESS = Object.freeze({
  UNKNOWN: 'unknown',
  TEAM_CANONICAL: 'team_canonical',
  PLAYER_DOCUMENT: 'player_document',
  PLAYER_SEARCH_INDEX: 'player_search_index',
  TEAM_SEARCH_INDEX: 'team_search_index',
  LEAGUE_PROJECTION: 'league_projection',
  SCHEMA: 'schema',
  MEASUREMENT: 'measurement',
  TRACKING: 'tracking',
  SEASON_STATUS: 'season_status',
  SCOUT_STATE: 'scout_state',
})

export const PLAYER_SCOUT_REPAIR_TYPE = Object.freeze({
  NONE: 'NONE',
  TEAM_PLAYER: 'TEAM_PLAYER',
  PLAYER_DOCUMENT: 'PLAYER_DOCUMENT',
  PLAYER_SEARCH_INDEX: 'PLAYER_SEARCH_INDEX',
  TEAM_SEARCH_INDEX: 'TEAM_SEARCH_INDEX',
  LEAGUE_PROJECTION: 'LEAGUE_PROJECTION',
  PLAYER_DOCUMENT_MIGRATION: 'PLAYER_DOCUMENT_MIGRATION',
  PLAYER_SEARCH_INDEX_MIGRATION: 'PLAYER_SEARCH_INDEX_MIGRATION',
  TEAM_PLAYER_MIGRATION: 'TEAM_PLAYER_MIGRATION',
  ENGINE_REFRESH: 'ENGINE_REFRESH',
  LEGACY_SCOPE_REPAIR: 'LEGACY_SCOPE_REPAIR',
})

export const PLAYER_SCOUT_AUDIT_CHECKS = Object.freeze([
  {
    checkId: 'team-player-canonical-state',
    process: PLAYER_SCOUT_AUDIT_PROCESS.TEAM_CANONICAL,
    description: 'Team player canonical state, context and season status',
  },
  {
    checkId: 'player-document-projection',
    process: PLAYER_SCOUT_AUDIT_PROCESS.PLAYER_DOCUMENT,
    description: 'Player Document existence and season projection consistency',
  },
  {
    checkId: 'player-search-index-projection',
    process: PLAYER_SCOUT_AUDIT_PROCESS.PLAYER_SEARCH_INDEX,
    description: 'Player SearchIndex existence, schema and projection consistency',
  },
  {
    checkId: 'team-search-index-summary',
    process: PLAYER_SCOUT_AUDIT_PROCESS.TEAM_SEARCH_INDEX,
    description: 'Team SearchIndex scout summary projection consistency',
  },
  {
    checkId: 'schema-migration',
    process: PLAYER_SCOUT_AUDIT_PROCESS.SCHEMA,
    description: 'Legacy schema, deprecated fields and missing contract metadata',
  },
  {
    checkId: 'measurement-history',
    process: PLAYER_SCOUT_AUDIT_PROCESS.MEASUREMENT,
    description: 'Scout measurement and measurement-history consistency',
  },
  {
    checkId: 'tracking-human-state',
    process: PLAYER_SCOUT_AUDIT_PROCESS.TRACKING,
    description: 'Tracking reasons and human-state persistence consistency',
  },
  {
    checkId: 'season-status',
    process: PLAYER_SCOUT_AUDIT_PROCESS.SEASON_STATUS,
    description: 'Current/history season-status consistency across documents',
  },
  {
    checkId: 'scout-engine-diagnostic',
    process: PLAYER_SCOUT_AUDIT_PROCESS.SCOUT_STATE,
    description: 'Current model calculation compared with stored scout state',
  },
])

const MIGRATION_ISSUE_TYPES = new Set([
  'team_player_schema_outdated',
  'player_schema_outdated',
  'search_index_schema_outdated',
  'player_narrative_schema_invalid',
])

const DIAGNOSTIC_ISSUE_TYPES = new Set([
  'missing_team_performance_context',
  'birth_team_mismatch',
  'birth_team_reliability_mismatch',
  'team_scout_state_mismatch',
  'player_document_mismatch',
  'player_document_reliability_mismatch',
  'player_scout_state_mismatch',
])

const PLAYER_SEARCH_INDEX_ISSUE_TYPES = new Set([
  'missing_search_index',
  'search_index_mismatch',
  'search_index_reliability_mismatch',
  'search_index_scout_projection_mismatch',
  'search_index_season_status_mismatch',
])

const TEAM_SEARCH_INDEX_ISSUE_TYPES = new Set([
  'missing_team_search_index',
  'team_search_index_scout_summary_mismatch',
])

const PLAYER_DOCUMENT_ISSUE_TYPES = new Set([
  'missing_player_document',
  'player_season_context_outdated',
  'player_tracking_mismatch',
  'player_measurement_history_outdated',
  'player_season_status_mismatch',
])

const TEAM_PLAYER_ISSUE_TYPES = new Set([
  'team_player_state_outdated',
  'team_stats_measurement_outdated',
  'current_season_status_invalid',
  'history_season_status_invalid',
])

const PROCESS_BY_ISSUE_TYPE = Object.freeze({
  missing_player_document: PLAYER_SCOUT_AUDIT_PROCESS.PLAYER_DOCUMENT,
  player_season_context_outdated: PLAYER_SCOUT_AUDIT_PROCESS.PLAYER_DOCUMENT,
  player_tracking_mismatch: PLAYER_SCOUT_AUDIT_PROCESS.TRACKING,
  player_measurement_history_outdated: PLAYER_SCOUT_AUDIT_PROCESS.MEASUREMENT,
  player_season_status_mismatch: PLAYER_SCOUT_AUDIT_PROCESS.SEASON_STATUS,
  missing_search_index: PLAYER_SCOUT_AUDIT_PROCESS.PLAYER_SEARCH_INDEX,
  search_index_mismatch: PLAYER_SCOUT_AUDIT_PROCESS.PLAYER_SEARCH_INDEX,
  search_index_reliability_mismatch: PLAYER_SCOUT_AUDIT_PROCESS.PLAYER_SEARCH_INDEX,
  search_index_scout_projection_mismatch: PLAYER_SCOUT_AUDIT_PROCESS.PLAYER_SEARCH_INDEX,
  search_index_season_status_mismatch: PLAYER_SCOUT_AUDIT_PROCESS.SEASON_STATUS,
  missing_team_search_index: PLAYER_SCOUT_AUDIT_PROCESS.TEAM_SEARCH_INDEX,
  team_search_index_scout_summary_mismatch: PLAYER_SCOUT_AUDIT_PROCESS.TEAM_SEARCH_INDEX,
  search_index_schema_outdated: PLAYER_SCOUT_AUDIT_PROCESS.SCHEMA,
  player_schema_outdated: PLAYER_SCOUT_AUDIT_PROCESS.SCHEMA,
  team_player_schema_outdated: PLAYER_SCOUT_AUDIT_PROCESS.SCHEMA,
  player_narrative_schema_invalid: PLAYER_SCOUT_AUDIT_PROCESS.SCHEMA,
  team_player_state_outdated: PLAYER_SCOUT_AUDIT_PROCESS.TEAM_CANONICAL,
  team_stats_measurement_outdated: PLAYER_SCOUT_AUDIT_PROCESS.MEASUREMENT,
  current_season_status_invalid: PLAYER_SCOUT_AUDIT_PROCESS.SEASON_STATUS,
  history_season_status_invalid: PLAYER_SCOUT_AUDIT_PROCESS.SEASON_STATUS,
  missing_team_performance_context: PLAYER_SCOUT_AUDIT_PROCESS.SCOUT_STATE,
  birth_team_mismatch: PLAYER_SCOUT_AUDIT_PROCESS.SCOUT_STATE,
  birth_team_reliability_mismatch: PLAYER_SCOUT_AUDIT_PROCESS.SCOUT_STATE,
  team_scout_state_mismatch: PLAYER_SCOUT_AUDIT_PROCESS.SCOUT_STATE,
  player_document_mismatch: PLAYER_SCOUT_AUDIT_PROCESS.SCOUT_STATE,
  player_document_reliability_mismatch: PLAYER_SCOUT_AUDIT_PROCESS.SCOUT_STATE,
  player_scout_state_mismatch: PLAYER_SCOUT_AUDIT_PROCESS.SCOUT_STATE,
})

const CHECK_ID_BY_PROCESS = Object.freeze({
  [PLAYER_SCOUT_AUDIT_PROCESS.TEAM_CANONICAL]: 'team-player-canonical-state',
  [PLAYER_SCOUT_AUDIT_PROCESS.PLAYER_DOCUMENT]: 'player-document-projection',
  [PLAYER_SCOUT_AUDIT_PROCESS.PLAYER_SEARCH_INDEX]: 'player-search-index-projection',
  [PLAYER_SCOUT_AUDIT_PROCESS.TEAM_SEARCH_INDEX]: 'team-search-index-summary',
  [PLAYER_SCOUT_AUDIT_PROCESS.SCHEMA]: 'schema-migration',
  [PLAYER_SCOUT_AUDIT_PROCESS.MEASUREMENT]: 'measurement-history',
  [PLAYER_SCOUT_AUDIT_PROCESS.TRACKING]: 'tracking-human-state',
  [PLAYER_SCOUT_AUDIT_PROCESS.SEASON_STATUS]: 'season-status',
  [PLAYER_SCOUT_AUDIT_PROCESS.SCOUT_STATE]: 'scout-engine-diagnostic',
})

const resolveIssueKind = issue => {
  const issueType = clean(issue?.type)

  if (MIGRATION_ISSUE_TYPES.has(issueType)) {
    return PLAYER_SCOUT_ISSUE_KIND.MIGRATION
  }

  if (DIAGNOSTIC_ISSUE_TYPES.has(issueType)) {
    return PLAYER_SCOUT_ISSUE_KIND.DIAGNOSTIC
  }

  return PLAYER_SCOUT_ISSUE_KIND.AUDIT
}

const resolveRepairType = issue => {
  const issueType = clean(issue?.type)
  const issueKind = resolveIssueKind(issue)

  if (issueKind === PLAYER_SCOUT_ISSUE_KIND.DIAGNOSTIC) {
    return PLAYER_SCOUT_REPAIR_TYPE.ENGINE_REFRESH
  }

  if (issueType === 'search_index_schema_outdated') {
    return PLAYER_SCOUT_REPAIR_TYPE.PLAYER_SEARCH_INDEX_MIGRATION
  }

  if (issueType === 'player_schema_outdated' || issueType === 'player_narrative_schema_invalid') {
    return PLAYER_SCOUT_REPAIR_TYPE.PLAYER_DOCUMENT_MIGRATION
  }

  if (issueType === 'team_player_schema_outdated') {
    return PLAYER_SCOUT_REPAIR_TYPE.TEAM_PLAYER_MIGRATION
  }

  if (PLAYER_SEARCH_INDEX_ISSUE_TYPES.has(issueType)) {
    return PLAYER_SCOUT_REPAIR_TYPE.PLAYER_SEARCH_INDEX
  }

  if (TEAM_SEARCH_INDEX_ISSUE_TYPES.has(issueType)) {
    return PLAYER_SCOUT_REPAIR_TYPE.TEAM_SEARCH_INDEX
  }

  if (PLAYER_DOCUMENT_ISSUE_TYPES.has(issueType)) {
    return PLAYER_SCOUT_REPAIR_TYPE.PLAYER_DOCUMENT
  }

  if (TEAM_PLAYER_ISSUE_TYPES.has(issueType)) {
    return PLAYER_SCOUT_REPAIR_TYPE.TEAM_PLAYER
  }

  return issue?.repairable === false
    ? PLAYER_SCOUT_REPAIR_TYPE.NONE
    : PLAYER_SCOUT_REPAIR_TYPE.LEGACY_SCOPE_REPAIR
}

const resolveProcess = issue => (
  PROCESS_BY_ISSUE_TYPE[clean(issue?.type)] ||
  PLAYER_SCOUT_AUDIT_PROCESS.UNKNOWN
)

const normalizeIssueIdPart = value => clean(value)
  .toLowerCase()
  .replace(/[^a-z0-9_-]+/g, '-')
  .replace(/^-+|-+$/g, '')

const normalizeStableValue = value => {
  if (Array.isArray(value)) {
    return value.map(normalizeStableValue)
  }

  if (
    value &&
    typeof value === 'object' &&
    Object.getPrototypeOf(value) === Object.prototype
  ) {
    return Object.keys(value)
      .sort()
      .reduce((result, key) => {
        result[key] = normalizeStableValue(value[key])
        return result
      }, {})
  }

  if (value === undefined) return null

  return value
}

const stableSerialize = value => JSON.stringify(
  normalizeStableValue(value)
)

const hashIssueSignature = value => {
  const source = String(value || '')
  let hashA = 2166136261
  let hashB = 5381

  for (let index = 0; index < source.length; index += 1) {
    const code = source.charCodeAt(index)
    hashA ^= code
    hashA = Math.imul(hashA, 16777619)
    hashB = ((hashB << 5) + hashB) ^ code
  }

  return [
    (hashA >>> 0).toString(36),
    (hashB >>> 0).toString(36),
  ].join('')
}

const buildIssueIdentityDetails = issue => ({
  field: clean(issue?.field),
  fields: uniqueCleanValues(issue?.fields).sort(),
  mismatchedFields: uniqueCleanValues(issue?.mismatchedFields).sort(),
  missingFields: uniqueCleanValues(issue?.missingFields).sort(),
  unexpectedFields: uniqueCleanValues(issue?.unexpectedFields).sort(),
  missingProfiles: uniqueCleanValues(issue?.missingProfiles).sort(),
  extraProfiles: uniqueCleanValues(issue?.extraProfiles).sort(),
  expectedProfiles: uniqueCleanValues(issue?.expectedProfiles).sort(),
  actualProfiles: uniqueCleanValues(issue?.actualProfiles).sort(),
  expectedCombinations: uniqueCleanValues(issue?.expectedCombinations).sort(),
  actualCombinations: uniqueCleanValues(issue?.actualCombinations).sort(),
  expected: issue?.expected !== undefined ? issue.expected : null,
  actual: issue?.actual !== undefined ? issue.actual : null,
  migrationAction: clean(issue?.migrationAction),
  repairData: issue?.repairData || null,
})

const buildIssueId = issue => {
  const issueType = clean(issue?.type) || 'unknown'
  const source = clean(issue?.source)
  const scopeKey = [
    clean(issue?.teamDocumentId),
    clean(issue?.seasonKey || issue?.seasonId),
    clean(issue?.playerDocumentId || issue?.playerId || issue?.externalPlayerId),
    clean(issue?.searchIndexDocumentId || issue?.searchDocumentId),
  ].filter(Boolean).join('__') || 'global'
  const signature = stableSerialize({
    type: issueType,
    source,
    scopeKey,
    details: buildIssueIdentityDetails(issue),
  })

  return [
    normalizeIssueIdPart(issueType) || 'unknown',
    normalizeIssueIdPart(scopeKey) || 'global',
    hashIssueSignature(signature),
  ].join('::')
}

const buildIssueScope = issue => ({
  teamDocumentId: clean(issue?.teamDocumentId),
  seasonId: clean(issue?.seasonId),
  seasonKey: clean(issue?.seasonKey || issue?.seasonId),
  playerId: clean(issue?.playerId),
  playerDocumentId: clean(issue?.playerDocumentId),
  externalPlayerId: clean(issue?.externalPlayerId),
  searchIndexDocumentId: clean(
    issue?.searchIndexDocumentId ||
    issue?.searchDocumentId
  ),
})

const buildExpectedActual = issue => {
  if (issue?.expected !== undefined || issue?.actual !== undefined) {
    return {
      expected: issue.expected !== undefined ? issue.expected : null,
      actual: issue.actual !== undefined ? issue.actual : null,
    }
  }

  if (
    Array.isArray(issue?.expectedProfiles) ||
    Array.isArray(issue?.actualProfiles) ||
    Array.isArray(issue?.expectedCombinations) ||
    Array.isArray(issue?.actualCombinations)
  ) {
    return {
      expected: {
        profiles: Array.isArray(issue?.expectedProfiles)
          ? issue.expectedProfiles
          : [],
        combinations: Array.isArray(issue?.expectedCombinations)
          ? issue.expectedCombinations
          : [],
      },
      actual: {
        profiles: Array.isArray(issue?.actualProfiles)
          ? issue.actualProfiles
          : [],
        combinations: Array.isArray(issue?.actualCombinations)
          ? issue.actualCombinations
          : [],
      },
    }
  }

  return {
    expected: null,
    actual: null,
  }
}

export const normalizePlayerScoutAuditIssue = issue => {
  const issueKind = resolveIssueKind(issue)
  const process = resolveProcess(issue)
  const repairType = resolveRepairType(issue)
  const { expected, actual } = buildExpectedActual(issue)

  return {
    ...issue,
    issueId: clean(issue?.issueId) || buildIssueId(issue),
    contractVersion: PLAYER_SCOUT_AUDIT_CONTRACT_VERSION,
    issueKind,
    checkId: CHECK_ID_BY_PROCESS[process] || 'unregistered',
    process,
    scope: buildIssueScope(issue),
    expected,
    actual,
    repair: {
      repairType,
      selectable: issue?.repairable !== false && repairType !== PLAYER_SCOUT_REPAIR_TYPE.NONE,
      migrationAction: clean(issue?.migrationAction),
      fields: uniqueCleanValues([
        ...(Array.isArray(issue?.missingFields) ? issue.missingFields : []),
        ...(Array.isArray(issue?.unexpectedFields) ? issue.unexpectedFields : []),
      ]),
    },
  }
}

const getCoverageContextCount = (context, key) => (
  Number.isFinite(Number(context?.[key]))
    ? Math.max(0, Number(context[key]))
    : 0
)

const resolveCheckCoverageStatus = ({
  check = {},
  context = {},
} = {}) => {
  const teamRowsCount = getCoverageContextCount(context, 'teamRowsCount')
  const skippedRowsCount = getCoverageContextCount(context, 'skippedRowsCount')
  const playerRowsCount = getCoverageContextCount(context, 'playerRowsCount')
  const searchRowsCount = getCoverageContextCount(context, 'searchRowsCount')
  const canonicalRowsCount = teamRowsCount + skippedRowsCount

  if (check.process === PLAYER_SCOUT_AUDIT_PROCESS.TRACKING) {
    if (playerRowsCount > 0) {
      return {
        status: PLAYER_SCOUT_AUDIT_CHECK_STATUS.EXECUTED,
        reason: '',
      }
    }

    return canonicalRowsCount > 0
      ? {
          status: PLAYER_SCOUT_AUDIT_CHECK_STATUS.SKIPPED,
          reason: 'no_player_documents_in_scope',
        }
      : {
          status: PLAYER_SCOUT_AUDIT_CHECK_STATUS.BLOCKED,
          reason: 'no_canonical_team_rows',
        }
  }

  if (
    check.process === PLAYER_SCOUT_AUDIT_PROCESS.PLAYER_DOCUMENT ||
    check.process === PLAYER_SCOUT_AUDIT_PROCESS.PLAYER_SEARCH_INDEX ||
    check.process === PLAYER_SCOUT_AUDIT_PROCESS.TEAM_SEARCH_INDEX ||
    check.process === PLAYER_SCOUT_AUDIT_PROCESS.TEAM_CANONICAL ||
    check.process === PLAYER_SCOUT_AUDIT_PROCESS.MEASUREMENT ||
    check.process === PLAYER_SCOUT_AUDIT_PROCESS.SEASON_STATUS ||
    check.process === PLAYER_SCOUT_AUDIT_PROCESS.SCOUT_STATE
  ) {
    return canonicalRowsCount > 0
      ? {
          status: PLAYER_SCOUT_AUDIT_CHECK_STATUS.EXECUTED,
          reason: '',
        }
      : {
          status: PLAYER_SCOUT_AUDIT_CHECK_STATUS.BLOCKED,
          reason: 'no_canonical_team_rows',
        }
  }

  if (check.process === PLAYER_SCOUT_AUDIT_PROCESS.SCHEMA) {
    return (
      canonicalRowsCount > 0 ||
      playerRowsCount > 0 ||
      searchRowsCount > 0
    )
      ? {
          status: PLAYER_SCOUT_AUDIT_CHECK_STATUS.EXECUTED,
          reason: '',
        }
      : {
          status: PLAYER_SCOUT_AUDIT_CHECK_STATUS.BLOCKED,
          reason: 'no_documents_in_scope',
        }
  }

  return {
    status: PLAYER_SCOUT_AUDIT_CHECK_STATUS.BLOCKED,
    reason: 'coverage_rule_missing',
  }
}

export const buildPlayerScoutAuditCoverage = ({
  issues = [],
  context = {},
} = {}) => {
  const safeIssues = Array.isArray(issues) ? issues : []
  const readsUsed = Number.isFinite(Number(context?.readsUsed))
    ? Math.max(0, Number(context.readsUsed))
    : null
  const readSafetyLimit = Number.isFinite(Number(context?.readSafetyLimit))
    ? Math.max(0, Number(context.readSafetyLimit))
    : null
  const checks = PLAYER_SCOUT_AUDIT_CHECKS.map(check => {
    const coverageState = resolveCheckCoverageStatus({
      check,
      context,
    })
    const checkIssues = safeIssues.filter(issue => (
      clean(issue?.checkId) === check.checkId
    ))

    return {
      checkId: check.checkId,
      process: check.process,
      status: coverageState.status,
      reason: coverageState.reason,
      issuesCount: checkIssues.length,
      readsUsed: null,
      readAccounting: 'shared',
    }
  })

  return {
    checks,
    summary: {
      totalChecks: checks.length,
      executedCount: checks.filter(check => (
        check.status === PLAYER_SCOUT_AUDIT_CHECK_STATUS.EXECUTED
      )).length,
      skippedCount: checks.filter(check => (
        check.status === PLAYER_SCOUT_AUDIT_CHECK_STATUS.SKIPPED
      )).length,
      blockedCount: checks.filter(check => (
        check.status === PLAYER_SCOUT_AUDIT_CHECK_STATUS.BLOCKED
      )).length,
      allRegisteredChecksExecuted: checks.every(check => (
        check.status === PLAYER_SCOUT_AUDIT_CHECK_STATUS.EXECUTED
      )),
      sharedReadsUsed: readsUsed,
      sharedReadSafetyLimit: readSafetyLimit,
    },
  }
}

export const buildPlayerScoutAuditContractResult = (
  issues,
  context = {}
) => {
  const normalizedIssues = (Array.isArray(issues) ? issues : [])
    .map(normalizePlayerScoutAuditIssue)
  const auditIssues = normalizedIssues.filter(issue => (
    issue.issueKind === PLAYER_SCOUT_ISSUE_KIND.AUDIT
  ))
  const migrationIssues = normalizedIssues.filter(issue => (
    issue.issueKind === PLAYER_SCOUT_ISSUE_KIND.MIGRATION
  ))
  const diagnostics = normalizedIssues.filter(issue => (
    issue.issueKind === PLAYER_SCOUT_ISSUE_KIND.DIAGNOSTIC
  ))
  const coverage = buildPlayerScoutAuditCoverage({
    issues: normalizedIssues,
    context,
  })

  return {
    contractVersion: PLAYER_SCOUT_AUDIT_CONTRACT_VERSION,
    checks: PLAYER_SCOUT_AUDIT_CHECKS,
    issues: normalizedIssues,
    auditIssues,
    migrationIssues,
    diagnostics,
    coverage,
    contractSummary: {
      totalIssues: normalizedIssues.length,
      auditIssuesCount: auditIssues.length,
      migrationIssuesCount: migrationIssues.length,
      diagnosticsCount: diagnostics.length,
      selectableRepairIssuesCount: normalizedIssues.filter(
        issue => issue.repair.selectable
      ).length,
    },
  }
}

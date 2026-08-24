// src/features/playersDatabase/services/audit/playerScoutRepair.selection.js

import {
  PLAYER_SCOUT_REPAIR_TYPE,
  normalizePlayerScoutAuditIssue,
} from './playerScoutAudit.contract.js'

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
  PLAYER_SCOUT_REPAIR_TYPE.PLAYER_DOCUMENT_MIGRATION,
  PLAYER_SCOUT_REPAIR_TYPE.PLAYER_SEARCH_INDEX_MIGRATION,
  PLAYER_SCOUT_REPAIR_TYPE.TEAM_PLAYER_MIGRATION,
  PLAYER_SCOUT_REPAIR_TYPE.LEGACY_SCOPE_REPAIR,
])

const normalizeAuditIssues = audit => (
  (Array.isArray(audit?.issues) ? audit.issues : [])
    .map(normalizePlayerScoutAuditIssue)
)

const assertSelectedIssueIsRepairable = issue => {
  if (issue?.repairable === false) {
    throw new Error(
      `Selected audit issue is not repairable: ${clean(issue?.issueId)}`
    )
  }

  if (issue?.repair?.selectable !== true) {
    throw new Error(
      `Selected audit issue is not selectable for repair: ${clean(issue?.issueId)}`
    )
  }

  if (!REGULAR_REPAIR_TYPES.has(issue?.repair?.repairType)) {
    const error = new Error(
      `Selected audit issue requires a different repair route: ${clean(issue?.issueId)}`
    )

    error.name = 'PlayerScoutRepairSelectionError'
    error.code = 'PLAYER_SCOUT_REPAIR_ROUTE_NOT_SUPPORTED'
    error.issueId = clean(issue?.issueId)
    error.repairType = clean(issue?.repair?.repairType)
    throw error
  }
}

export const buildPlayerScoutRepairSelection = ({
  audit,
  selectedIssueIds,
} = {}) => {
  if (!audit) {
    throw new Error('Player scout repair selection requires a source audit')
  }

  const normalizedIssues = normalizeAuditIssues(audit)
  const hasExplicitSelection = Array.isArray(selectedIssueIds)
  const requestedIssueIds = hasExplicitSelection
    ? unique(selectedIssueIds)
    : normalizedIssues.map(issue => clean(issue.issueId)).filter(Boolean)

  if (hasExplicitSelection && requestedIssueIds.length === 0) {
    return {
      mode: 'selected',
      requestedIssueIds: [],
      selectedIssueIds: [],
      selectedIssues: [],
      audit: {
        ...audit,
        issues: [],
        auditIssues: [],
        migrationIssues: [],
        diagnostics: [],
      },
      summary: {
        sourceIssuesCount: normalizedIssues.length,
        requestedIssuesCount: 0,
        selectedIssuesCount: 0,
      },
    }
  }

  const issuesById = new Map(
    normalizedIssues
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

    error.name = 'PlayerScoutRepairSelectionError'
    error.code = 'PLAYER_SCOUT_REPAIR_ISSUES_NOT_FOUND'
    error.issueIds = missingIssueIds
    throw error
  }

  const selectedIssues = requestedIssueIds
    .map(issueId => issuesById.get(issueId))
    .filter(Boolean)

  if (hasExplicitSelection) {
    selectedIssues.forEach(assertSelectedIssueIsRepairable)
  }

  const selectedIssueIdSet = new Set(
    selectedIssues.map(issue => clean(issue.issueId))
  )
  const selectByKind = (items = []) => (
    (Array.isArray(items) ? items : [])
      .map(normalizePlayerScoutAuditIssue)
      .filter(issue => selectedIssueIdSet.has(clean(issue.issueId)))
  )

  return {
    mode: hasExplicitSelection ? 'selected' : 'all',
    requestedIssueIds,
    selectedIssueIds: [...selectedIssueIdSet],
    selectedIssues,
    audit: {
      ...audit,
      issues: selectedIssues,
      auditIssues: selectByKind(audit.auditIssues),
      migrationIssues: selectByKind(audit.migrationIssues),
      diagnostics: selectByKind(audit.diagnostics),
    },
    summary: {
      sourceIssuesCount: normalizedIssues.length,
      requestedIssuesCount: requestedIssueIds.length,
      selectedIssuesCount: selectedIssues.length,
    },
  }
}

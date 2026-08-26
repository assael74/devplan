// src/features/playersDatabase/services/audit/audit.service.js

import {
  buildDocumentRelationsCheck,
} from './checks/documentRelations.check.js'
import {
  buildDocumentHealthCheck,
} from './checks/documentHealth.check.js'
import {
  buildComputedStateCheck,
  buildScopedComputedStateCheck,
} from './checks/computedState.check.js'
import {
  AUDIT_COLLECTION_SCOPE,
  AUDIT_SCOPE_TYPE,
  normalizeAuditScope,
} from './audit.scope.js'
import {
  buildAuditResultV1,
  normalizeAuditIssueV1,
} from './audit.contract.js'
import {
  readPlayerDatabaseAuditSnapshot,
} from './audit.read.js'

const normalizeIssues = ({ issues, scope, collectionName, relationId }) => (
  (Array.isArray(issues) ? issues : []).map((issue, index) => (
    normalizeAuditIssueV1({
      issue,
      scope,
      collectionName,
      relationId,
      index,
    })
  ))
)

const getCollectionDocuments = ({ snapshot, collectionScope }) => {
  if (collectionScope === AUDIT_COLLECTION_SCOPE.LEAGUES) {
    return snapshot?.documents?.leagues || []
  }
  if (collectionScope === AUDIT_COLLECTION_SCOPE.TEAMS) {
    return snapshot?.documents?.teams || []
  }
  if (collectionScope === AUDIT_COLLECTION_SCOPE.PLAYERS) {
    return snapshot?.documents?.players || []
  }
  if (collectionScope === AUDIT_COLLECTION_SCOPE.TEAM_INDEXES) {
    return snapshot?.documents?.teamIndexes || []
  }
  if (collectionScope === AUDIT_COLLECTION_SCOPE.PLAYER_INDEXES) {
    return snapshot?.documents?.playerIndexes || []
  }

  return []
}

const runCollectionAuditFromSnapshot = async ({ scope, snapshot }) => {
  const result = await buildDocumentHealthCheck({
    scope: scope.collectionScope,
    documents: getCollectionDocuments({
      snapshot,
      collectionScope: scope.collectionScope,
    }),
    readsUsed: 0,
  })
  const issues = normalizeIssues({
    issues: result.issues,
    scope,
    collectionName: result.collectionName,
  })

  return {
    result,
    issues,
  }
}

const runCollectionAudit = async scope => {
  const snapshot = await readPlayerDatabaseAuditSnapshot({ scope })
  const collectionAudit = await runCollectionAuditFromSnapshot({
    scope,
    snapshot,
  })
  const { result, issues } = collectionAudit

  return buildAuditResultV1({
    scope,
    generatedAt: snapshot?.generatedAt || result.generatedAt,
    readsUsed: snapshot?.readsUsed,
    checked: result.checked,
    exact: result.exact,
    affected: result.affected,
    issues,
    source: 'documentHealth',
    details: {
      ...result,
      sharedSnapshot: true,
    },
  })
}

const runRelationsAuditFromSnapshot = async ({ scope, snapshot }) => {
  const result = await buildDocumentRelationsCheck({
    relationId: scope.relationId,
    snapshot,
  })
  const relationIssues = (Array.isArray(result.relations) ? result.relations : [])
    .flatMap(relation => (
      (Array.isArray(relation.issues) ? relation.issues : []).map(issue => ({
        ...issue,
        relationId: relation.id,
      }))
    ))
  const issues = normalizeIssues({
    issues: relationIssues,
    scope,
    relationId: scope.relationId,
  })

  return {
    result,
    issues,
  }
}

const runRelationsAudit = async scope => {
  const snapshot = await readPlayerDatabaseAuditSnapshot({ scope })
  const relationAudit = await runRelationsAuditFromSnapshot({
    scope,
    snapshot,
  })
  const { result, issues } = relationAudit

  return buildAuditResultV1({
    scope,
    generatedAt: snapshot?.generatedAt || result.generatedAt,
    readsUsed: snapshot?.readsUsed,
    checked: result.checked,
    exact: result.exact,
    affected: result.affected,
    issues,
    source: 'relations',
    details: {
      ...result,
      sharedSnapshot: true,
    },
  })
}

const runTeamSeasonAudit = async (scope, { includeRepairData = false } = {}) => {
  const result = await buildScopedComputedStateCheck({
    teamDocumentId: scope.teamDocumentId,
    seasonKey: scope.seasonKey,
    includeRepairData: includeRepairData === true,
  })
  const issues = normalizeIssues({
    issues: result.issues,
    scope,
  })

  return buildAuditResultV1({
    scope,
    generatedAt: result.generatedAt,
    readsUsed: result.cost?.readSafety?.readsUsed,
    checked: result.summary?.checkedTeamPlayerRows || result.summary?.checkedRows || result.summary?.checked || 0,
    affected: issues.length,
    issues,
    source: 'teamSeason',
    details: result,
  })
}


const runTeamSeasonsAudit = async (scope, { includeRepairData = false } = {}) => {
  const childResults = []

  for (const childScope of Array.isArray(scope?.scopes) ? scope.scopes : []) {
    childResults.push(await runTeamSeasonAudit(
      childScope,
      { includeRepairData }
    ))
  }

  const issues = childResults.flatMap(result => (
    Array.isArray(result?.issues) ? result.issues : []
  ))

  return buildAuditResultV1({
    scope,
    generatedAt: childResults
      .map(result => result?.generatedAt)
      .filter(Boolean)
      .sort()
      .at(-1) || new Date().toISOString(),
    readsUsed: childResults.reduce((sum, result) => (
      sum + Number(result?.readsUsed || 0)
    ), 0),
    checked: childResults.reduce((sum, result) => (
      sum + Number(result?.checked || 0)
    ), 0),
    exact: childResults.reduce((sum, result) => (
      sum + Number(result?.exact || 0)
    ), 0),
    affected: issues.length,
    issues,
    source: 'teamSeasons',
    details: {
      scopesCount: childResults.length,
      results: childResults,
    },
  })
}

const FULL_SYSTEM_RULE_OWNERSHIP_EXCLUSIONS = new Set([
  'missing_player_document',
  'missing_search_index',
  'missing_team_search_index',
  'player_schema_outdated',
  'search_index_schema_outdated',
  'team_player_schema_outdated',
  'player_narrative_schema_invalid',
])

const FULL_SYSTEM_COLLECTION_SCOPES = [
  AUDIT_COLLECTION_SCOPE.LEAGUES,
  AUDIT_COLLECTION_SCOPE.TEAMS,
  AUDIT_COLLECTION_SCOPE.PLAYERS,
  AUDIT_COLLECTION_SCOPE.TEAM_INDEXES,
  AUDIT_COLLECTION_SCOPE.PLAYER_INDEXES,
]

const runFullAudit = async (scope, { includeRepairData = false } = {}) => {
  const snapshot = await readPlayerDatabaseAuditSnapshot({ scope })
  const rules = await buildComputedStateCheck({
    includeRepairData: includeRepairData === true,
    snapshot,
  })
  const rulesIssues = normalizeIssues({
    issues: rules.issues,
    scope,
  }).filter(issue => (
    !FULL_SYSTEM_RULE_OWNERSHIP_EXCLUSIONS.has(issue.type)
  ))

  const healthResults = []
  for (const collectionScope of FULL_SYSTEM_COLLECTION_SCOPES) {
    const childScope = {
      type: AUDIT_SCOPE_TYPE.COLLECTION,
      collectionScope,
    }
    healthResults.push(await runCollectionAuditFromSnapshot({
      scope: childScope,
      snapshot,
    }))
  }

  const relationScope = {
    type: AUDIT_SCOPE_TYPE.RELATIONS,
    relationId: '',
  }
  const relations = await runRelationsAuditFromSnapshot({
    scope: relationScope,
    snapshot,
  })

  const healthIssues = healthResults.flatMap(item => item.issues)
  const issues = [
    ...healthIssues,
    ...rulesIssues,
    ...relations.issues,
  ]
  const checkedHealth = healthResults.reduce((sum, item) => (
    sum + Number(item.result?.checked || 0)
  ), 0)
  const checkedRules = Number(
    rules.summary?.checkedTeamPlayerRows ||
    rules.summary?.checkedRows ||
    rules.summary?.checked ||
    0
  )
  const checkedRelations = Number(relations.result?.checked || 0)

  return buildAuditResultV1({
    scope,
    generatedAt: snapshot?.generatedAt || rules.generatedAt,
    readsUsed: snapshot?.readsUsed,
    checked: checkedHealth + checkedRelations,
    exact: healthResults.reduce((sum, item) => (
      sum + Number(item.result?.exact || 0)
    ), 0) + Number(relations.result?.exact || 0),
    affected: issues.length,
    issues,
    source: 'fullSystemConsolidated',
    details: {
      sharedSnapshot: true,
      readCollections: snapshot?.readCollections || [],
      collections: healthResults.map(item => item.result),
      computedState: rules,
      computedStateChecked: checkedRules,
      relations: relations.result,
    },
  })
}

export async function runPlayerDatabaseAudit({
  scope,
  includeRepairData = false,
} = {}) {
  const normalizedScope = normalizeAuditScope(scope)

  if (normalizedScope.type === AUDIT_SCOPE_TYPE.COLLECTION) {
    return runCollectionAudit(normalizedScope)
  }

  if (normalizedScope.type === AUDIT_SCOPE_TYPE.RELATIONS) {
    return runRelationsAudit(normalizedScope)
  }

  if (normalizedScope.type === AUDIT_SCOPE_TYPE.TEAM_SEASON) {
    return runTeamSeasonAudit(normalizedScope, { includeRepairData })
  }

  if (normalizedScope.type === AUDIT_SCOPE_TYPE.TEAM_SEASONS) {
    return runTeamSeasonsAudit(normalizedScope, { includeRepairData })
  }

  if (normalizedScope.type === AUDIT_SCOPE_TYPE.FULL_SYSTEM) {
    return runFullAudit(normalizedScope, { includeRepairData })
  }

  throw new Error('היקף הבדיקה אינו נתמך.')
}

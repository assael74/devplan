// src/features/playersDatabase/services/audit/playerScout.cost.js

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

const seasonKeyOf = row => clean(row?.seasonKey || row?.seasonId)
const teamDocumentIdOf = row => clean(row?.teamDocumentId)

const playerKeyOf = row => clean(
  row?.playerDocumentId ||
  row?.playerId ||
  row?.externalPlayerId
)

const scopeKeyOf = row => [
  teamDocumentIdOf(row),
  seasonKeyOf(row),
].join('::')

const profileRepairIssueTypes = new Set([
  'birth_team_mismatch',
  'birth_team_reliability_mismatch',
  'player_document_mismatch',
  'player_document_reliability_mismatch',
  'missing_player_document',
  'missing_search_index',
  'search_index_mismatch',
  'search_index_reliability_mismatch',
  'history_season_status_invalid',
])

export const buildPlayerScoutAuditCost = ({
  teamDocuments = 0,
  playerDocuments = 0,
  playerSearchIndexes = 0,
  teamSearchIndexes = 0,
  directPlayerLookups = 0,
  scoped = false,
} = {}) => {
  const teamReads = scoped
    ? 1
    : Math.max(1, Number(teamDocuments || 0))
  const playerReads = scoped
    ? Number(directPlayerLookups || 0)
    : Math.max(1, Number(playerDocuments || 0))
  const playerIndexReads = Math.max(
    1,
    Number(playerSearchIndexes || 0)
  )
  const teamIndexReads = Math.max(
    1,
    Number(teamSearchIndexes || 0)
  )

  return {
    reads: {
      teamDocuments: teamReads,
      playerDocuments: playerReads,
      playerSearchIndexes: playerIndexReads,
      teamSearchIndexes: teamIndexReads,
      total:
        teamReads +
        playerReads +
        playerIndexReads +
        teamIndexReads,
    },
    writes: {
      total: 0,
    },
    documentsObserved: {
      teamDocuments: Number(teamDocuments || 0),
      playerDocuments: Number(playerDocuments || 0),
      playerDocumentLookups: scoped
        ? Number(directPlayerLookups || 0)
        : Number(playerDocuments || 0),
      playerSearchIndexes: Number(playerSearchIndexes || 0),
      teamSearchIndexes: Number(teamSearchIndexes || 0),
    },
  }
}

export const buildPlayerScoutRepairCost = ({ audit, affectedRows, schemaIssues } = {}) => {
  const safeAffectedRows = Array.isArray(affectedRows)
    ? affectedRows
    : []
  const safeSchemaIssues = Array.isArray(schemaIssues)
    ? schemaIssues
    : []
  const profileIssues = (Array.isArray(audit?.issues) ? audit.issues : [])
    .filter(issue => profileRepairIssueTypes.has(issue.type))
  const affectedTeamDocuments = unique(
    safeAffectedRows.map(teamDocumentIdOf)
  )
  const affectedScopes = unique(
    safeAffectedRows.map(scopeKeyOf)
  )
  const affectedPlayerOperations = unique(
    safeAffectedRows.map(row => [
      scopeKeyOf(row),
      playerKeyOf(row),
    ].join('::'))
  )
  const schemaPlayerDocumentIds = unique(
    safeSchemaIssues.map(issue => issue.playerDocumentId)
  )
  const searchIssuePlayerKeys = unique(
    profileIssues
      .filter(issue => [
        'missing_search_index',
        'search_index_mismatch',
        'search_index_reliability_mismatch',
      ].includes(issue.type))
      .map(playerKeyOf)
  )
  const scopeStats = Array.isArray(audit?.cost?.scopeStats)
    ? audit.cost.scopeStats
    : []
  const affectedScopeStats = affectedScopes.map(scopeKey => (
    scopeStats.find(item => clean(item.scopeKey) === scopeKey) || {
      scopeKey,
      clubIds: [],
      teamIds: [],
      playerSearchIndexes: 0,
    }
  ))
  const clubScopedSearchQueries = affectedScopeStats.filter(scope => (
    unique(scope.clubIds).length > 0
  )).length
  const searchIndexReadsMinimum = affectedScopeStats.reduce((sum, scope) => (
    sum + Math.max(1, Number(scope.playerSearchIndexes || 0))
  ), 0)
  const searchIndexEstimateExact = clubScopedSearchQueries === 0
  const searchIndexReads = searchIndexReadsMinimum
  const teamReads = affectedTeamDocuments.length
  const playerReads = affectedPlayerOperations.length
  const schemaReads = schemaPlayerDocumentIds.length
  const applyReads = (
    teamReads +
    playerReads +
    schemaReads +
    searchIndexReads
  )
  const teamWrites = affectedTeamDocuments.length
  const playerWritesMax = affectedPlayerOperations.length
  const schemaWritesMax = schemaPlayerDocumentIds.length
  const searchIndexWritesMax = affectedPlayerOperations.length
  const writesMax = (
    teamWrites +
    playerWritesMax +
    schemaWritesMax +
    searchIndexWritesMax
  )
  const auditRows = Array.isArray(audit?.recalculatedRows)
    ? audit.recalculatedRows
    : []
  const verificationPlayerRows = affectedScopes.reduce((sum, scopeKey) => (
    sum + auditRows.filter(row => scopeKeyOf(row) === scopeKey).length
  ), 0)
  const verificationSearchReads = affectedScopes.reduce((sum, scopeKey) => {
    const scope = scopeStats.find(item => clean(item.scopeKey) === scopeKey)
    return sum + Math.max(1, Number(scope?.playerSearchIndexes || 0))
  }, 0)
  const verificationBaseReads = (
    affectedScopes.length +
    affectedScopes.length +
    verificationSearchReads
  )
  const verificationReadsMin = (
    verificationBaseReads +
    verificationPlayerRows
  )
  const verificationReadsMax = (
    verificationBaseReads +
    verificationPlayerRows * 4
  )
  const schemaOnlyRepair = (
    affectedScopes.length === 0 &&
    schemaPlayerDocumentIds.length > 0
  )
  const processEstimateIsMinimum = !searchIndexEstimateExact

  return {
    reads: {
      teamDocuments: teamReads,
      playerDocuments: playerReads,
      schemaPlayerDocuments: schemaReads,
      searchIndexes: searchIndexReads,
      searchIndexesMinimum: searchIndexReadsMinimum,
      searchIndexEstimateExact,
      clubScopedSearchQueries,
      applyEstimated: applyReads,
      applyEstimateIsMinimum: processEstimateIsMinimum,
      verificationEstimatedMin: verificationReadsMin,
      verificationEstimatedMax: verificationReadsMax,
      processEstimatedMin: applyReads + verificationReadsMin,
      processEstimatedMax: applyReads + verificationReadsMax,
      processEstimateIsMinimum,
    },
    writes: {
      teamDocuments: teamWrites,
      playerDocumentsMax: playerWritesMax,
      schemaPlayerDocumentsMax: schemaWritesMax,
      searchIndexesMax: searchIndexWritesMax,
      estimatedMax: writesMax,
    },
    affected: {
      teamDocuments: affectedTeamDocuments.length,
      teamSeasonScopes: affectedScopes.length,
      playerOperations: affectedPlayerOperations.length,
      verificationPlayerRows,
      schemaPlayerDocuments: schemaPlayerDocumentIds.length,
      searchIndexIssuePlayers: searchIssuePlayerKeys.length,
      schemaOnlyRepair,
    },
    verification: {
      runsAutomatically: affectedScopes.length > 0,
      schemaOnlyRepair,
    },
    note: processEstimateIsMinimum
      ? 'SearchIndex write uses a club-scoped query for at least one affected scope. The displayed SearchIndex and total read values are minimums, not an upper estimate, because the audit does not read the rest of the club solely for cost estimation.'
      : 'Repair reads include Apply plus the automatic scoped verification audit.',
  }
}

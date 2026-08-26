// src/features/playersDatabase/services/audit/checks/computedState.cost.js

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
  'team_scout_state_mismatch',
  'player_document_mismatch',
  'player_document_reliability_mismatch',
  'player_scout_state_mismatch',
  'missing_player_document',
  'missing_search_index',
  'search_index_mismatch',
  'search_index_reliability_mismatch',
  'current_season_status_invalid',
  'history_season_status_invalid',
  'team_player_state_outdated',
  'team_player_schema_outdated',
  'team_stats_measurement_outdated',
  'search_index_schema_outdated',
  'search_index_scout_projection_mismatch',
  'search_index_season_status_mismatch',
  'player_season_status_mismatch',
])

const isRepairableProfileIssue = issue => {
  if (issue?.repairable === false) return false
  if (!profileRepairIssueTypes.has(issue?.type)) return false
  if (issue.type !== 'search_index_schema_outdated') return true

  return (
    (Array.isArray(issue.missingFields) && issue.missingFields.length > 0) ||
    (Array.isArray(issue.invalidTypes) && issue.invalidTypes.length > 0)
  )
}

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

const ceilDiv = (value, divisor) => {
  const numberValue = Math.max(0, Number(value || 0))
  const divisorValue = Math.max(1, Number(divisor || 1))

  return Math.ceil(numberValue / divisorValue)
}

export const buildPlayerScoutRuntimeCostCheck = ({
  teamSeasonScopes = 0,
  teamPlayers = 0,
  trackedPlayerDocuments = 0,
  profiledPlayers = 0,
  playerDocumentSyncPlayers = 0,
  untrackedLookupCandidates = 0,
  existingUntrackedPlayerDocuments = 0,
  playerSearchIndexes = 0,
  teamSearchIndexes = 0,
} = {}) => {
  const scopes = Math.max(0, Number(teamSeasonScopes || 0))
  const players = Math.max(0, Number(teamPlayers || 0))
  const tracked = Math.max(0, Number(trackedPlayerDocuments || 0))
  const profiled = Math.max(0, Number(profiledPlayers || 0))
  const syncPlayers = Math.max(0, Number(playerDocumentSyncPlayers || 0))
  const lookupCandidates = Math.max(0, Number(untrackedLookupCandidates || 0))
  const lookupExisting = Math.max(0, Number(existingUntrackedPlayerDocuments || 0))
  const playerIndexes = Math.max(0, Number(playerSearchIndexes || 0))
  const teamIndexes = Math.max(0, Number(teamSearchIndexes || 0))
  const playerDocumentLookupQueries = ceilDiv(lookupCandidates, 30)
  const playerDocumentLookupReadsMinimum = Math.max(
    playerDocumentLookupQueries,
    lookupExisting
  )
  const playerDocumentSyncCount = Math.min(
    players,
    syncPlayers || Math.max(tracked, profiled)
  )
  const playerSearchReadsMinimum = scopes
    ? Math.max(scopes, playerIndexes)
    : 0
  const fullStatsFixedReads = scopes * 9
  const fullStatsFixedWrites = scopes * 7
  const fullStatsReadsMinimum = (
    fullStatsFixedReads +
    playerSearchReadsMinimum +
    playerDocumentLookupReadsMinimum +
    playerDocumentSyncCount
  )
  const fullStatsWritesMaximum = (
    fullStatsFixedWrites +
    players +
    playerDocumentSyncCount
  )
  const contextFixedReads = scopes ? 5 : 0
  const contextFixedWrites = scopes ? 4 : 0
  const contextTeamReads = scopes
  const contextTeamWrites = scopes
  const contextPlayerIndexReadsMinimum = playerSearchReadsMinimum
  const contextTeamIndexWritesMaximum = teamIndexes || scopes
  const contextReadsMinimum = (
    contextFixedReads +
    contextTeamReads +
    playerDocumentLookupReadsMinimum +
    playerDocumentSyncCount +
    contextPlayerIndexReadsMinimum
  )
  const contextWritesMaximum = (
    contextFixedWrites +
    contextTeamWrites +
    playerDocumentSyncCount +
    players +
    contextTeamIndexWritesMaximum
  )

  return {
    observed: {
      teamSeasonScopes: scopes,
      teamPlayers: players,
      trackedPlayerDocuments: tracked,
      profiledPlayers: profiled,
      playerDocumentSyncPlayers: playerDocumentSyncCount,
      untrackedLookupCandidates: lookupCandidates,
      playerDocumentLookupQueries,
      existingUntrackedPlayerDocuments: lookupExisting,
      playerSearchIndexes: playerIndexes,
      teamSearchIndexes: teamIndexes,
    },
    flows: {
      fullStatsLoad: {
        readsMinimum: fullStatsReadsMinimum,
        writesMaximum: fullStatsWritesMaximum,
        variableReadRisk: 'identity_resolution_and_club_scoped_search_index_query',
        breakdown: {
          fixedReads: fullStatsFixedReads,
          fixedWrites: fullStatsFixedWrites,
          playerSearchReadsMinimum,
          playerIndexWritesMaximum: players,
          playerDocumentLookupReadsMinimum,
          playerDocumentSyncReads: playerDocumentSyncCount,
          playerDocumentSyncWritesMaximum: playerDocumentSyncCount,
        },
      },
      teamContextUpdate: {
        readsMinimum: contextReadsMinimum,
        writesMaximum: contextWritesMaximum,
        variableReadRisk: 'club_scoped_player_search_index_queries',
        breakdown: {
          fixedLeagueReads: contextFixedReads,
          fixedLeagueWrites: contextFixedWrites,
          teamDocumentReads: contextTeamReads,
          teamDocumentWrites: contextTeamWrites,
          playerSearchReadsMinimum: contextPlayerIndexReadsMinimum,
          playerIndexWritesMaximum: players,
          playerDocumentLookupReadsMinimum,
          playerDocumentSyncReads: playerDocumentSyncCount,
          playerDocumentSyncWritesMaximum: playerDocumentSyncCount,
          teamIndexWritesMaximum: contextTeamIndexWritesMaximum,
        },
      },
      roleEdit: {
        readsTypical: 7,
        writesTypical: 6,
        note: 'כולל Team, Player, SearchIndex, סיכום ליגה/Leagues Master וסנכרון Team SearchIndex.',
      },
      verificationUpdate: {
        readsTypical: 4,
        writesTypical: 4,
        readsMissingPlayerDocumentMaximum: 7,
        writesMissingPlayerDocumentMaximum: 5,
      },
      manualProfileMutation: {
        readsTypical: 7,
        writesTypical: 6,
      },
      storyOpen: {
        readsMinimum: 0,
        readsMaximum: 1,
        writes: 0,
        note: 'קריאת Player Document אחת בלבד כאשר היסטוריית המדידות המלאה עדיין לא זמינה ב-row.',
      },
    },
    risks: [
      {
        id: 'full_stats_double_team_transaction',
        severity: 'medium',
        message: 'Full Stats Load מפעיל כיום ensureTeamDoc ולאחריו transaction קנוני של Team Season. יש כאן זוג Team read/write שניתן כנראה לחסוך אם transaction הסטטיסטיקה ייצור את המסמך בעצמו.',
      },
      {
        id: 'full_stats_repeated_league_master_sync',
        severity: 'medium',
        message: 'Full Stats Load מעדכן metadata של טבלת הליגה ו-Scout summary במסלולים נפרדים, ושניהם מסנכרנים Leagues Master. איחוד הסנכרון יכול לחסוך reads/writes חוזרים.',
      },
      {
        id: 'identity_resolution_per_player_queries',
        severity: 'high',
        message: 'Identity Resolution יכול לבצע כמה שאילתות SearchIndex לכל שחקן שלא זוהה. האומדן אינו מנפח קריאות רק כדי לתמחר את המקרה המשתנה הזה.',
      },
      {
        id: 'club_scoped_player_index_queries',
        severity: 'medium',
        message: 'חלק מעדכוני Player SearchIndex שואלים לפי מועדון + עונה ועלולים לקרוא גם שורות של קבוצות אחיות. במקרים האלה מספר ה-reads המוצג הוא מינימום.',
      },
    ],
  }
}

const TEAM_REPAIR_COST_ISSUE_TYPES = new Set([
  'current_season_status_invalid',
  'history_season_status_invalid',
  'team_player_state_outdated',
  'team_player_schema_outdated',
  'team_stats_measurement_outdated',
])

const PLAYER_DOCUMENT_REPAIR_COST_ISSUE_TYPES = new Set([
  'missing_player_document',
])

const SEARCH_INDEX_REPAIR_COST_ISSUE_TYPES = new Set([
  'missing_search_index',
  'search_index_mismatch',
  'search_index_reliability_mismatch',
  'search_index_schema_outdated',
  'search_index_scout_projection_mismatch',
  'search_index_season_status_mismatch',
])

const rowHasRepairType = ({ row, issueTypes }) => (
  (Array.isArray(row?.repairIssueTypes) ? row.repairIssueTypes : []).some(
    type => issueTypes.has(type)
  )
)

export const buildPlayerScoutRepairCost = ({ audit, affectedRows, schemaIssues } = {}) => {
  const safeAffectedRows = Array.isArray(affectedRows)
    ? affectedRows
    : []
  const safeSchemaIssues = Array.isArray(schemaIssues)
    ? schemaIssues
    : []
  const profileIssues = (Array.isArray(audit?.issues) ? audit.issues : [])
    .filter(isRepairableProfileIssue)
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
  const teamRepairRows = safeAffectedRows.filter(row => rowHasRepairType({
    row,
    issueTypes: TEAM_REPAIR_COST_ISSUE_TYPES,
  }))
  const playerDocumentRepairRows = safeAffectedRows.filter(row => rowHasRepairType({
    row,
    issueTypes: PLAYER_DOCUMENT_REPAIR_COST_ISSUE_TYPES,
  }))
  const searchIndexRepairRows = safeAffectedRows.filter(row => rowHasRepairType({
    row,
    issueTypes: SEARCH_INDEX_REPAIR_COST_ISSUE_TYPES,
  }))
  const teamWriteDocumentIds = unique(teamRepairRows.map(teamDocumentIdOf))
  const playerDocumentOperations = unique(
    playerDocumentRepairRows.map(row => [
      scopeKeyOf(row),
      playerKeyOf(row),
    ].join('::'))
  )
  const searchIndexOperations = unique(
    searchIndexRepairRows.map(row => [
      scopeKeyOf(row),
      playerKeyOf(row),
    ].join('::'))
  )
  const searchIndexScopes = unique(searchIndexRepairRows.map(scopeKeyOf))
  const schemaPlayerDocumentIds = unique(
    safeSchemaIssues.map(issue => issue.playerDocumentId)
  )
  const searchIssuePlayerKeys = unique(
    profileIssues
      .filter(issue => [
        'missing_search_index',
        'search_index_mismatch',
        'search_index_reliability_mismatch',
        'search_index_schema_outdated',
        'search_index_scout_projection_mismatch',
        'search_index_season_status_mismatch',
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
  const searchRepairScopeStats = searchIndexScopes.map(scopeKey => (
    scopeStats.find(item => clean(item.scopeKey) === scopeKey) || {
      scopeKey,
      clubIds: [],
      teamIds: [],
      playerSearchIndexes: 0,
    }
  ))
  const clubScopedSearchQueries = searchRepairScopeStats.filter(scope => (
    unique(scope.clubIds).length > 0
  )).length
  const searchIndexReadsMinimum = searchRepairScopeStats.reduce((sum, scope) => (
    sum + Math.max(1, Number(scope.playerSearchIndexes || 0))
  ), 0)
  const searchIndexEstimateExact = clubScopedSearchQueries === 0
  const searchIndexReads = searchIndexReadsMinimum
  const teamReads = affectedTeamDocuments.length
  const playerReads = playerDocumentOperations.length
  const schemaReads = schemaPlayerDocumentIds.length
  const applyReads = (
    teamReads +
    playerReads +
    schemaReads +
    searchIndexReads
  )
  const teamWrites = teamWriteDocumentIds.length
  const playerWritesMax = playerDocumentOperations.length
  const schemaWritesMax = schemaPlayerDocumentIds.length
  const searchIndexWritesMax = searchIndexOperations.length
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
      teamWriteDocuments: teamWriteDocumentIds.length,
      playerDocumentOperations: playerDocumentOperations.length,
      searchIndexOperations: searchIndexOperations.length,
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

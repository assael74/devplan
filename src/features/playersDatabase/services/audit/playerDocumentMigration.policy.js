// src/features/playersDatabase/services/audit/playerDocumentMigration.policy.js

export const PLAYER_DOCUMENT_SCHEMA_SCOPES = Object.freeze({
  TEAM_PLAYER: 'team_player',
  PLAYER_ROOT: 'player_root',
  PLAYER_SEASON: 'player_season',
  SEARCH_INDEX: 'search_index',
})

export const PLAYER_DOCUMENT_MIGRATION_ACTIONS = Object.freeze({
  AUTO_REPAIR: 'auto_repair',
  SAFE_DELETE: 'safe_delete',
  REPORT_ONLY: 'report_only',
})

// Keep these lists explicit and intentionally small.
// A field may be added only after all active readers and writers were migrated.
// Empty lists mean that unexpected fields are reported but never deleted automatically.
export const PLAYER_DOCUMENT_DEPRECATED_FIELDS = Object.freeze({
  [PLAYER_DOCUMENT_SCHEMA_SCOPES.TEAM_PLAYER]: Object.freeze([]),
  [PLAYER_DOCUMENT_SCHEMA_SCOPES.PLAYER_ROOT]: Object.freeze([]),
  [PLAYER_DOCUMENT_SCHEMA_SCOPES.PLAYER_SEASON]: Object.freeze([]),
  [PLAYER_DOCUMENT_SCHEMA_SCOPES.SEARCH_INDEX]: Object.freeze([]),
})

const clean = value => String(
  value === undefined || value === null ? '' : value
).trim()

const normalizeFields = fields => [
  ...new Set(
    (Array.isArray(fields) ? fields : [])
      .map(clean)
      .filter(Boolean)
  ),
]

export const resolveDeprecatedSchemaFields = ({ scope = '', fields = [] } = {}) => {
  const deprecatedFields = new Set(
    PLAYER_DOCUMENT_DEPRECATED_FIELDS[scope] || []
  )

  return normalizeFields(fields).filter(field => deprecatedFields.has(field))
}

export const classifyUnexpectedSchemaFields = ({ scope = '', fields = [] } = {}) => {
  const unexpectedFields = normalizeFields(fields)
  const deprecatedFields = resolveDeprecatedSchemaFields({
    scope,
    fields: unexpectedFields,
  })
  const deprecatedSet = new Set(deprecatedFields)

  return {
    unexpectedFields,
    deprecatedFields,
    reportOnlyUnexpectedFields: unexpectedFields.filter(
      field => !deprecatedSet.has(field)
    ),
  }
}

export const resolveSchemaMigrationAction = ({ missingFields = [], invalidTypes = [], deprecatedFields = [], reportOnlyUnexpectedFields = [] } = {}) => {
  if (
    (Array.isArray(missingFields) && missingFields.length > 0) ||
    (Array.isArray(invalidTypes) && invalidTypes.length > 0)
  ) {
    return PLAYER_DOCUMENT_MIGRATION_ACTIONS.AUTO_REPAIR
  }

  if (Array.isArray(deprecatedFields) && deprecatedFields.length > 0) {
    return PLAYER_DOCUMENT_MIGRATION_ACTIONS.SAFE_DELETE
  }

  if (
    Array.isArray(reportOnlyUnexpectedFields) &&
    reportOnlyUnexpectedFields.length > 0
  ) {
    return PLAYER_DOCUMENT_MIGRATION_ACTIONS.REPORT_ONLY
  }

  return ''
}

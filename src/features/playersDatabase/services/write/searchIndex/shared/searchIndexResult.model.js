// features/playersDatabase/services/write/searchIndex/shared/searchIndexResult.model.js

export const SEARCH_INDEX_ENTITY_TYPES = {
  playerSeason: 'playerSeason',
  teamSeason: 'birthTeamSeason',
}

export const buildSearchIndexWriteResult = ({
  entityType = '',
  operation = '',
  rowsCount = 0,
  updated,
  reason = '',
  ...details
} = {}) => {
  const result = {
    entityType,
    operation,
    rowsCount: Number.isFinite(Number(rowsCount)) ? Number(rowsCount) : 0,
    ...details,
  }

  if (typeof updated === 'boolean') result.updated = updated
  if (reason) result.reason = reason

  return result
}

export const buildSearchIndexMetaResult = ({
  rowsCount = 0,
  playerDocumentIds = [],
  teamDocumentIds = [],
  ...details
} = {}) => ({
  rowsCount: Number.isFinite(Number(rowsCount)) ? Number(rowsCount) : 0,
  playerDocumentIds: [...new Set(Array.isArray(playerDocumentIds) ? playerDocumentIds : [])],
  teamDocumentIds: [...new Set(Array.isArray(teamDocumentIds) ? teamDocumentIds : [])],
  ...details,
})

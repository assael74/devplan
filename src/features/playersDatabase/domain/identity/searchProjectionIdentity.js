// src/features/playersDatabase/domain/identity/searchProjectionIdentity.js

const clean = value => String(value === null || value === undefined ? '' : value).trim()

export const buildPlayerSearchIndexDocumentId = ({
  playerId = '',
  teamSeasonDocumentId = '',
} = {}) => {
  const safePlayerId = clean(playerId)
  const safeTeamSeasonDocumentId = clean(teamSeasonDocumentId)

  if (!safePlayerId) throw new Error('Missing playerId')
  if (!safeTeamSeasonDocumentId) throw new Error('Missing teamSeasonDocumentId')

  return `playerSeason__${safePlayerId}__${safeTeamSeasonDocumentId}`
}

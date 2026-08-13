// src/features/playersDatabase/domain/adapters/teamScoutInput.adapter.js

import { PLAYERS_DATABASE_CLUBS_CATALOG } from '../../catalog/clubs.catalog.js'

const clean = value => String(value || '').trim()

const clubsById = new Map(
  PLAYERS_DATABASE_CLUBS_CATALOG.map(club => [clean(club.id), club])
)

export const enrichTeamScoutInputRow = row => {
  const source = row && typeof row === 'object' ? row : {}
  const club = clubsById.get(clean(source.clubId)) || null
  const clubLevel = source.clubLevel || club?.clubLevel || null
  const clubStrengthLevel = source.clubStrengthLevel ||
    club?.clubStrengthLevel ||
    clubLevel

  return {
    ...source,
    clubLevel,
    clubStrengthLevel,
  }
}

export const enrichTeamScoutInputRows = rows => (
  Array.isArray(rows) ? rows : []
).map(enrichTeamScoutInputRow)

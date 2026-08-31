import { PLAYERS_DATABASE_CLUBS_CATALOG } from '../../../catalog/clubs.catalog.js'
import { clean } from '../leagues/leagueDoc.js'

const toNumberOrZero = value => (
  Number.isFinite(Number(value)) ? Number(value) : 0
)

export const resolveClubLevel = ({ clubId = '', clubLevel = null } = {}) => {
  const directClubLevel = Number(clubLevel)
  if (Number.isFinite(directClubLevel) && directClubLevel > 0) return directClubLevel

  const club = PLAYERS_DATABASE_CLUBS_CATALOG.find(item => item.id === clean(clubId))
  return toNumberOrZero(club?.clubLevel)
}

export const resolveClubStrengthLevel = ({
  clubId = '',
  clubLevel = null,
  clubStrengthLevel = null,
} = {}) => {
  const directStrengthLevel = Number(clubStrengthLevel)
  if (Number.isFinite(directStrengthLevel) && directStrengthLevel > 0) {
    return directStrengthLevel
  }

  const club = PLAYERS_DATABASE_CLUBS_CATALOG.find(item => item.id === clean(clubId))
  const catalogStrengthLevel = Number(club?.clubStrengthLevel)

  if (Number.isFinite(catalogStrengthLevel) && catalogStrengthLevel > 0) {
    return catalogStrengthLevel
  }

  return resolveClubLevel({ clubId, clubLevel })
}

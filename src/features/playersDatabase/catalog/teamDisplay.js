// features/playersDatabase/catalog/teamDisplay.js

import { PLAYERS_DATABASE_CLUBS_CATALOG } from './clubs.catalog.js'

const clean = value => String(value ?? '').trim()

const CLUB_PREFIX_SHORT_NAMES = [
  { prefix: 'מועדון ספורט כדורגל', short: 'מ.ס' },
  { prefix: 'מועדון כדורגל', short: 'מ.כ' },
  { prefix: 'מועדון ספורט', short: 'מ.ס' },
  { prefix: 'אגודת ספורט', short: 'א.ס' },
]

const shortenClubName = value => {
  const clubName = clean(value)
  if (!clubName) return ''

  for (const item of CLUB_PREFIX_SHORT_NAMES) {
    if (!clubName.startsWith(item.prefix)) continue

    const rest = clean(clubName.slice(item.prefix.length))
    return [item.short, rest].filter(Boolean).join(' ')
  }

  return clubName
}

const getClubByValue = value => {
  const key = clean(value)
  if (!key) return null

  return PLAYERS_DATABASE_CLUBS_CATALOG.find(club => (
    clean(club.id) === key ||
    clean(club.name) === key ||
    clean(club.shortName) === key
  )) || null
}

const resolveClubDisplayName = ({ clubName = '', clubId = '' } = {}) => {
  const club = getClubByValue(clubId) || getClubByValue(clubName)
  if (club?.shortName) return clean(club.shortName)
  if (club?.name) return shortenClubName(club.name)

  return shortenClubName(clubName || clubId)
}

const getTeamSlotFromTeamId = teamId => {
  const parts = clean(teamId).split('_').filter(Boolean)
  const lastPart = Number(parts[parts.length - 1])

  return Number.isInteger(lastPart) && lastPart > 1 ? lastPart : 1
}

export const buildTeamDisplayName = ({
  clubName = '',
  clubId = '',
  teamId = '',
  teamSlot = '',
} = {}) => {
  const baseName = resolveClubDisplayName({ clubName, clubId }) || shortenClubName(teamId)
  const slot = Number(teamSlot) || getTeamSlotFromTeamId(teamId)

  if (!baseName) return ''
  if (slot <= 1) return baseName

  return `${baseName} ${slot}`
}

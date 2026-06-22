import { PLAYERS_DATABASE_CLUBS_CATALOG } from './clubs.catalog.js'
import { PLAYERS_DATABASE_LEAGUES_CATALOG } from './leagues.catalog.js'
import { PLAYERS_DATABASE_TEAMS_CATALOG } from './teams.catalog.js'
import { buildClubTeamSlots } from './teamSlots.catalog.js'

const clean = (value) => String(value ?? '').trim()

export const normalizeCatalogName = (value) =>
  clean(value)
    .replace(/\s*\(נוער\)\s*$/g, '')
    .toLowerCase()
    .replace(/[״"]/g, '')
    .replace(/[׳']/g, '')
    .replace(/\s+/g, ' ')

const getAliases = (item = {}) => [
  item.name,
  item.label,
  ...(Array.isArray(item.aliases) ? item.aliases : []),
].filter(Boolean)

const stripClubPrefix = (teamName, clubName) => {
  const teamKey = normalizeCatalogName(teamName)
  const clubKey = normalizeCatalogName(clubName)

  if (!teamKey || !clubKey || !teamKey.startsWith(clubKey)) return teamName

  return clean(teamName).slice(clean(clubName).length).trim()
}

const matchByNameOrAlias = (catalog = [], name, predicate = null) => {
  const key = normalizeCatalogName(name)
  if (!key) return null

  for (const item of catalog) {
    if (predicate && !predicate(item)) continue

    const aliases = getAliases(item)
    const exact = aliases.find((alias) => normalizeCatalogName(alias) === key)

    if (exact) {
      return {
        matched: true,
        id: item.id,
        name: item.name || item.label || exact,
        confidence: normalizeCatalogName(item.name || item.label) === key ? 'exact' : 'alias',
        item,
      }
    }
  }

  return null
}

export function resolveClubCatalogMatch(clubName) {
  return matchByNameOrAlias(PLAYERS_DATABASE_CLUBS_CATALOG, clubName)
}

export function resolveTeamCatalogMatch(teamName, context = {}) {
  const clubId = clean(context.clubCatalogId)
  const clubName = clean(context.clubName)
  const seasonId = clean(context.seasonId)
  const ageGroup = clean(context.ageGroup)
  const club = context.club || (clubId || clubName ? { id: clubId, name: clubName } : null)

  const slotMatch = resolveTeamSlotMatch(teamName, {
    club,
    ageGroup,
    teamSlot: context.teamSlot,
  })
  if (slotMatch?.matched) return slotMatch

  const match = matchByNameOrAlias(PLAYERS_DATABASE_TEAMS_CATALOG, teamName, (item = {}) => {
    const isClubCompatible = !clubId || !item.clubId || item.clubId === clubId
    const isSeasonCompatible = !seasonId || !item.seasonId || item.seasonId === seasonId
    const isAgeCompatible = !ageGroup || !item.ageGroup || item.ageGroup === ageGroup || item.ageGroupId === ageGroup
    return isClubCompatible && isSeasonCompatible && isAgeCompatible
  })

  return match || null
}

export function resolveTeamSlotMatch(teamName, context = {}) {
  const club = context.club || {}
  const rawTeamName = clean(teamName)
  const rawSlot = Number(context.teamSlot) || 0
  if (!rawTeamName) return null

  const teamWithoutClub = stripClubPrefix(rawTeamName, club.name)
  const candidateNames = [rawTeamName, teamWithoutClub].filter(Boolean)
  const slots = buildClubTeamSlots(club)

  if (context.ageGroup && rawSlot) {
    const slot = slots.find(item => (
      item.slot === rawSlot &&
      (item.ageGroupId === context.ageGroup || item.ageGroupLabel === context.ageGroup)
    ))

    if (slot) {
      return {
        matched: true,
        id: slot.id,
        name: slot.displayName,
        confidence: 'slot',
        item: slot,
        slot,
      }
    }
  }

  for (const slot of slots) {
    const slotNames = [
      slot.teamName,
      slot.displayName,
      slot.ageGroupLabel,
      `${slot.ageGroupLabel} ${slot.slot}`,
    ]

    const matched = candidateNames.some((candidate) =>
      slotNames.some((slotName) => normalizeCatalogName(candidate) === normalizeCatalogName(slotName))
    )

    if (!matched) continue

    if (context.ageGroup && slot.ageGroupId !== context.ageGroup && slot.ageGroupLabel !== context.ageGroup) {
      continue
    }

    return {
      matched: true,
      id: slot.id,
      name: slot.displayName,
      confidence: 'slot',
      item: slot,
      slot,
    }
  }

  return null
}

export function resolveLeagueCatalogMatch(leagueName, context = {}) {
  const seasonId = clean(context.seasonId)
  const ageGroup = clean(context.ageGroup)
  const birthYear = clean(context.birthYear)

  const match = matchByNameOrAlias(PLAYERS_DATABASE_LEAGUES_CATALOG, leagueName, (item = {}) => {
    const isSeasonCompatible = !seasonId || !item.seasonId || item.seasonId === seasonId
    const isAgeCompatible = !ageGroup || !item.ageGroupId || item.ageGroupId === ageGroup || item.ageGroupLabel === ageGroup
    const isBirthYearCompatible = !birthYear || !item.birthYear || String(item.birthYear) === birthYear
    return isSeasonCompatible && isAgeCompatible && isBirthYearCompatible
  })

  return match || null
}

export function resolvePlayersDatabaseCatalogMatches(row = {}) {
  const club = resolveClubCatalogMatch(row.clubName || row.currentClubName)
  const team = resolveTeamCatalogMatch(row.teamName || row.currentTeamName, {
    clubCatalogId: club?.id,
    clubName: club?.name || row.clubName || row.currentClubName,
    club: club?.item,
    seasonId: row.seasonId,
    ageGroup: row.ageGroupId || row.ageGroup,
    teamSlot: row.teamSlot,
  })
  const league = resolveLeagueCatalogMatch(row.leagueName || row.currentLeagueName, {
    seasonId: row.seasonId,
    ageGroup: row.ageGroupId || row.ageGroup,
    birthYear: row.birthYear,
  })

  return {
    club,
    team,
    league,
  }
}

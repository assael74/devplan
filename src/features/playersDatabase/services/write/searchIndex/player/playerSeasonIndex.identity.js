// features/playersDatabase/services/write/searchIndex/player/playerSeasonIndex.identity.js

import { PLAYERS_DATABASE_CLUBS_CATALOG } from '../../../../catalog/clubs.catalog.js'
import {
  normalizePlayerIdPart,
  normalizePlayerNameValue,
  resolveInternalPlayerId,
} from '../../../../model/playerIdentity.model.js'
import { buildSeasonKey, clean, toNumberOrZero } from '../../leagues/leagueDoc.js'
import {
  buildPlayerSeasonScope,
  isSamePlayerSeasonScope,
} from '../../shared/playerSeasonScope.js'

export const normalizeText = value =>
  normalizePlayerNameValue(value)

export const resolveClubLevel = ({ clubId = '', clubLevel = null } = {}) => {
  const directClubLevel = Number(clubLevel)
  if (Number.isFinite(directClubLevel) && directClubLevel > 0) return directClubLevel

  const club = PLAYERS_DATABASE_CLUBS_CATALOG.find(item => item.id === clean(clubId))
  return toNumberOrZero(club?.clubLevel)
}

export const normalizeIdPart = value =>
  normalizePlayerIdPart(value)

export const normalizeAliasList = aliases =>
  (Array.isArray(aliases) ? aliases : [])
    .map(alias => clean(alias))
    .filter(Boolean)

export const uniqueCleanValues = values => {
  const seen = new Set()

  return (Array.isArray(values) ? values : [])
    .map(value => clean(value))
    .filter(Boolean)
    .filter(value => {
      const key = normalizeText(value)
      if (!key || seen.has(key)) return false

      seen.add(key)
      return true
    })
}

export const buildPlayerAliases = ({
  player = {},
  displayName = '',
  existingAliases = [],
} = {}) => {
  const displayKey = normalizeText(displayName)

  return uniqueCleanValues([
    ...normalizeAliasList(existingAliases),
    ...normalizeAliasList(player.aliases),
    player.originalFullName,
    player.fullName,
  ]).filter(alias => normalizeText(alias) !== displayKey)
}

export const buildPlayerSeasonIndexIdentity = ({
  player = {},
  season = {},
  team = {},
  row = {},
} = {}) => {
  const scope = buildPlayerSeasonScope({ season, team, row })

  return {
    playerId: clean(
      player.matchedPlayerId ||
      player.playerId ||
      row.playerId
    ),
    seasonId: clean(scope.seasonId || row.seasonId),
    birthTeamId: clean(scope.birthTeamId || row.birthTeamId || row.teamId),
    birthTeamSlot: toNumberOrZero(
      scope.birthTeamSlot || row.birthTeamSlot
    ),
  }
}

export const hasCompletePlayerSeasonIndexIdentity = identity => (
  Boolean(clean(identity?.playerId)) &&
  Boolean(clean(identity?.seasonId)) &&
  Boolean(clean(identity?.birthTeamId)) &&
  toNumberOrZero(identity?.birthTeamSlot) > 0
)

export const buildPlayerSeasonIndexIdentityKey = identity => {
  if (!hasCompletePlayerSeasonIndexIdentity(identity)) return ''

  return [
    clean(identity.playerId),
    clean(identity.seasonId),
    clean(identity.birthTeamId),
    String(toNumberOrZero(identity.birthTeamSlot)),
  ].join('::')
}

export const buildPlayerSeasonIndexLookup = docs => {
  const lookup = new Map()

  docs.forEach(snapshot => {
    const data = snapshot.data() || {}
    const key = buildPlayerSeasonIndexIdentityKey(
      buildPlayerSeasonIndexIdentity({ row: data })
    )

    if (!key) return

    const matches = lookup.get(key) || []
    lookup.set(key, [...matches, snapshot])
  })

  return lookup
}

export const findExistingPlayerSeasonIndexDoc = ({
  lookup,
  player = {},
  season = {},
  team = {},
} = {}) => {
  const identity = buildPlayerSeasonIndexIdentity({ player, season, team })
  const key = buildPlayerSeasonIndexIdentityKey(identity)
  const matches = key ? lookup?.get(key) || [] : []

  return {
    identity,
    key,
    snapshot: matches[0] || null,
    duplicateSnapshots: matches.slice(1),
  }
}

export const getRosterStatus = player =>
  clean(player.rosterStatus || 'regular')

export const shouldSkipNewPlayerSeasonIndex = player =>
  getRosterStatus(player) === 'retired'

export const buildInternalPlayerId = ({
  player = {},
  season = {},
} = {}) => {
  const existingPlayerId = resolveInternalPlayerId(player)
  if (existingPlayerId) return existingPlayerId

  const birthYear = clean(player.birthYear || season.birthYear)
  const externalPlayerId = clean(player.externalPlayerId)
  const fallbackName = normalizeIdPart(player.normalizedName || player.fullName)
  const sourceId = externalPlayerId || fallbackName

  return ['player', birthYear, sourceId]
    .map(normalizeIdPart)
    .filter(Boolean)
    .join('__')
}

export const buildPlayerSeasonIndexId = ({
  seasonKey = '',
  clubId = '',
  ageGroupId = '',
  ageGroupLabel = '',
  birthYear = '',
  birthTeamSlot = 1,
  playerId = '',
  externalPlayerId = '',
  normalizedName = '',
} = {}) => {
  const identityType = clean(playerId) ? 'player' : clean(externalPlayerId) ? 'external' : 'name'
  const identityValue = clean(playerId) || clean(externalPlayerId) || normalizeIdPart(normalizedName)
  const ageGroupValue = clean(ageGroupId || ageGroupLabel || birthYear)

  return [
    'playerSeason',
    normalizeIdPart(buildSeasonKey(seasonKey)),
    'club',
    normalizeIdPart(clubId),
    'age',
    normalizeIdPart(ageGroupValue),
    'slot' + (toNumberOrZero(birthTeamSlot) || 1),
    identityType,
    normalizeIdPart(identityValue),
  ].filter(Boolean).join('__')
}

export const buildPlayerSeasonIndexScope = ({ league = {}, season = {}, team = {} } = {}) => (
  buildPlayerSeasonScope({
    season: {
      ...season,
      leagueId: clean(league.id || season.leagueId || team.leagueId),
    },
    team: {
      ...team,
      clubId: clean(team.clubId),
      ageGroupId: clean(team.ageGroupId || league.ageGroupId),
      ageGroupLabel: clean(team.ageGroupLabel || league.ageGroupLabel),
    },
  })
)

export const isSamePlayerSeasonIndexContext = (data = {}, scope = {}) => (
  clean(data.entityType) === 'playerSeason'
  && isSamePlayerSeasonScope(data, scope)
)

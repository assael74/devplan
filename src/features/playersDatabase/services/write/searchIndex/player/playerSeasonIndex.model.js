// features/playersDatabase/services/write/searchIndex/player/playerSeasonIndex.model.js

import { serverTimestamp } from 'firebase/firestore'
import { PLAYERS_DATABASE_CLUBS_CATALOG } from '../../../../catalog/clubs.catalog.js'
import {
  buildPlayerMatchValues,
  normalizePlayerIdPart,
  normalizePlayerNameValue,
  resolveInternalPlayerId,
} from '../../../../model/playerIdentity.model.js'
import { normalizePlayerStats } from '../../../../model/playerStats.model.js'
import { buildSeasonKey, clean, toNumberOrZero } from '../../leagues/leagueDoc.js'
import {
  buildPlayerSeasonScope,
  isSamePlayerSeasonScope,
} from '../../shared/playerSeasonScope.js'
import {
  buildPlayerDocumentId,
  hasPlayerScoutProfiles,
} from '../../players/index.js'

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

export const getPlayerMatchKeys = player =>
  buildPlayerMatchValues(player).map(normalizeText)

export const getIndexDocMatchKeys = data =>
  uniqueCleanValues([
    data.playerId,
    data.externalPlayerId,
    data.playerDocumentId,
    data.id,
    data.entityId,
    data.displayName,
    data.normalizedDisplayName,
    ...normalizeAliasList(data.aliases),
  ]).map(normalizeText)

export const buildPlayerSeasonIndexLookup = docs => {
  const lookup = new Map()

  docs.forEach(snapshot => {
    const data = snapshot.data() || {}
    getIndexDocMatchKeys(data).forEach(key => {
      if (!lookup.has(key)) lookup.set(key, snapshot)
    })
  })

  return lookup
}

export const findExistingPlayerSeasonIndexDoc = ({ lookup, player } = {}) => {
  for (const key of getPlayerMatchKeys(player)) {
    const snapshot = lookup.get(key)
    if (snapshot) return snapshot
  }

  return null
}

export const getRosterStatus = player =>
  clean(player.rosterStatus || 'regular')

export const shouldSkipNewPlayerSeasonIndex = player =>
  ['retired', 'transferredOut'].includes(getRosterStatus(player))

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

export const buildPlayerSeasonIndexDoc = ({
  league = {},
  season = {},
  team = {},
  target = 'current',
  player = {},
} = {}) => {
  const rawSeasonId = clean(season.seasonId)
  const seasonKey = clean(season.seasonKey) || buildSeasonKey(rawSeasonId)
  const seasonId = rawSeasonId || seasonKey
  const displayName = clean(player.matchedPlayerName || player.fullName)
  const normalizedDisplayName = normalizeText(player.normalizedName || displayName)
  const externalPlayerId = clean(player.externalPlayerId)
  const playerId = buildInternalPlayerId({ player, season })
  const aliases = buildPlayerAliases({ player, displayName })
  const playerStats = normalizePlayerStats(player)
  const teamScope = buildPlayerSeasonScope({
    season: { ...season, seasonId, seasonKey },
    team,
  })
  const teamId = teamScope.birthTeamId
  const playerDocumentId = clean(player.playerDocumentId) || (hasPlayerScoutProfiles(player)
    ? buildPlayerDocumentId(player)
    : '')
  const primaryScoutSignal = Array.isArray(player.scoutSignals) ? player.scoutSignals[0] : null
  const secondaryScoutSignal = Array.isArray(player.scoutSignals) ? player.scoutSignals[1] : null
  const id = buildPlayerSeasonIndexId({
    seasonKey,
    clubId: teamScope.clubId || team.clubId,
    ageGroupId: teamScope.ageGroupId || team.ageGroupId || league.ageGroupId,
    ageGroupLabel: teamScope.ageGroupLabel || team.ageGroupLabel || league.ageGroupLabel,
    birthYear: teamScope.birthYear || season.birthYear,
    birthTeamSlot: teamScope.birthTeamSlot,
    playerId,
    externalPlayerId,
    normalizedName: normalizedDisplayName,
  })

  return {
    id,
    entityType: 'playerSeason',
    entityId: id,

    displayName,
    normalizedDisplayName,
    aliases,

    playerId,
    playerDocumentId,
    externalPlayerId,
    playerUrl: clean(player.playerUrl),
    rosterStatus: getRosterStatus(player),
    isYoungerAgeGroup: Boolean(player.isYoungerAgeGroup),
    favorite: Boolean(player.favorite),
    notes: clean(player.notes),

    leagueId: clean(league.id || teamScope.leagueId),
    seasonId,
    seasonKey,
    clubId: clean(team.clubId),
    clubLevel: resolveClubLevel({ clubId: team.clubId, clubLevel: team.clubLevel }),
    birthTeamId: teamId,
    birthTeamDocumentId: teamScope.birthTeamDocumentId,
    birthTeamSlot: teamScope.birthTeamSlot,
    teamId,
    teamDocumentId: teamScope.birthTeamDocumentId,
    teamUrl: clean(team.teamUrl),
    seasonUrl: clean(season.seasonUrl),

    ageGroupId: clean(team.ageGroupId || league.ageGroupId),
    ageGroupLabel: clean(team.ageGroupLabel || league.ageGroupLabel),
    birthYear: toNumberOrZero(season.birthYear),
    leagueTotalRound: toNumberOrZero(season.leagueTotalRound),
    leagueLevel: toNumberOrZero(league.level),
    region: clean(league.region),

    primaryPosition: clean(player.primaryPosition),
    positionLayer: clean(player.positionLayer),
    numShirt: clean(player.numShirt),
    seasonNotes: clean(player.notes),

    teamTableRank: toNumberOrZero(team.tableRank),
    teamTableAttackRank: toNumberOrZero(team.tableAttackRank),
    teamTableDefenseRank: toNumberOrZero(team.tableDefenseRank),
    teamGoalsFor: toNumberOrZero(team.teamStats?.goalsFor ?? team.goalsFor),
    teamGoalsAgainst: toNumberOrZero(team.teamStats?.goalsAgainst ?? team.goalsAgainst),
    teamGoalsForPerGame: toNumberOrZero(team.goalsForPerGame),
    teamGamePlayed: toNumberOrZero(team.teamStats?.teamGamePlayed ?? team.teamGamePlayed),

    games: playerStats.games,
    goals: playerStats.goals,
    yellowCards: playerStats.yellowCards,
    minutes: playerStats.minutes,
    starts: playerStats.starts,
    substituteIn: playerStats.substituteIn,
    substitutedOut: playerStats.substitutedOut,
    teamMinutes: playerStats.teamMinutes,
    teamGames: playerStats.teamGames,

    primaryScoutProfileId: clean(primaryScoutSignal?.profileId),
    primaryScoutReliabilityLevel: clean(primaryScoutSignal?.reliability?.level),
    primaryScoutScore: Number.isFinite(Number(primaryScoutSignal?.score)) ? Number(primaryScoutSignal.score) : null,

    secondaryScoutProfileId: clean(secondaryScoutSignal?.profileId),
    secondaryScoutReliabilityLevel: clean(secondaryScoutSignal?.reliability?.level),
    secondaryScoutScore: Number.isFinite(Number(secondaryScoutSignal?.score)) ? Number(secondaryScoutSignal.score) : null,

    sourceCollection: playerDocumentId ? 'players' : 'birthTeams',
    sourceDocumentId: playerDocumentId || teamScope.birthTeamDocumentId,
    sourceTarget: clean(target) === 'history' ? 'history' : 'current',

    updatedAt: serverTimestamp(),
  }
}


// features/playersDatabase/services/write/searchIndex/player/playerSeasonIndex.model.js

import { serverTimestamp } from 'firebase/firestore'
import { pickDefinedValue } from '../../../../model/value.model.js'
import {
  buildPlayerIdentityKey,
  isValidExternalPlayerId,
  resolvePlayerIdentityBirthYear,
} from '../../../../model/playerIdentity.model.js'
import {
  normalizePlayerStats,
  normalizePlayerStatsStatus,
} from '../../../../model/playerStats.model.js'
import {
  buildSeasonKey,
  clean,
  toNumberOrZero,
} from '../../leagues/leagueDoc.js'
import { buildPlayerSeasonScope } from '../../shared/playerSeasonScope.js'
import {
  buildPlayerDocumentId,
  hasPlayerScoutProfiles,
} from '../../players/index.js'
import {
  buildInternalPlayerId,
  buildPlayerAliases,
  buildPlayerSeasonIndexId,
  buildPlayerSeasonIndexScope,
  getRosterStatus,
  normalizeText,
  resolveClubLevel,
} from './playerSeasonIndex.identity.js'
import { buildPlayerScoutIndexFields } from './playerSeasonIndex.scout.js'
import { buildPlayerSeasonSearchMetrics } from '../shared/searchIndexNormalization.model.js'

export * from './playerSeasonIndex.identity.js'
export * from './playerSeasonIndex.scout.js'

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
  const externalPlayerId = isValidExternalPlayerId({
    externalPlayerId: player.externalPlayerId,
    birthYear: season.birthYear,
  }) ? clean(player.externalPlayerId) : ''
  const identityBirthYear = resolvePlayerIdentityBirthYear({
    player,
    season,
  })
  const playerId = buildInternalPlayerId({
    player,
    season,
  })
  const aliases = buildPlayerAliases({
    player,
    displayName,
  })
  const playerStats = normalizePlayerStats(player)
  const teamScope = buildPlayerSeasonScope({
    season: {
      ...season,
      seasonId,
      seasonKey,
    },
    team,
  })
  const teamId = teamScope.birthTeamId
  const playerDocumentId = clean(player.playerDocumentId) || (hasPlayerScoutProfiles(player)
    ? buildPlayerDocumentId(player)
    : '')
  const scoutIndexFields = buildPlayerScoutIndexFields(player)
  const normalization = buildPlayerSeasonSearchMetrics({
    target,
    seasonStatus: season.seasonStatus,
    ageGroupId: team.ageGroupId || league.ageGroupId,
    leagueTotalRound: season.leagueTotalRound,
    teamGamePlayed: team.teamStats?.teamGamePlayed || team.teamGamePlayed || playerStats.teamGames,
    stats: playerStats,
  })
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
    identityBirthYear,
    identityKey: clean(player.identityKey) || buildPlayerIdentityKey({
      birthYear: identityBirthYear,
      normalizedName: normalizedDisplayName,
    }),
    playerUrl: clean(player.playerUrl),
    rosterStatus: getRosterStatus(player),
    isYoungerAgeGroup: Boolean(player.isYoungerAgeGroup),
    notes: clean(player.notes),

    leagueId: clean(league.id || teamScope.leagueId),
    seasonId,
    seasonKey,
    clubId: clean(team.clubId),
    clubLevel: resolveClubLevel({
      clubId: team.clubId,
      clubLevel: team.clubLevel,
    }),
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
    expectedLevelDelta: !player.isYoungerAgeGroup
      && team.expectedLevelDelta !== null
      && team.expectedLevelDelta !== undefined
      && Number.isFinite(Number(team.expectedLevelDelta))
      ? Number(team.expectedLevelDelta)
      : null,
    region: clean(league.region),

    primaryPosition: clean(player.primaryPosition),
    positionLayer: clean(player.positionLayer),
    numShirt: clean(player.numShirt),
    seasonNotes: clean(player.notes),
    statsStatus: normalizePlayerStatsStatus(player.statsStatus),

    teamTableRank: toNumberOrZero(team.tableRank),
    teamTableAttackRank: toNumberOrZero(team.tableAttackRank),
    teamTableDefenseRank: toNumberOrZero(team.tableDefenseRank),
    teamGoalsFor: toNumberOrZero(pickDefinedValue(team.teamStats?.goalsFor, team.goalsFor)),
    teamGoalsAgainst: toNumberOrZero(pickDefinedValue(team.teamStats?.goalsAgainst, team.goalsAgainst)),
    teamGoalsForPerGame: toNumberOrZero(team.goalsForPerGame),
    teamGamePlayed: toNumberOrZero(pickDefinedValue(team.teamStats?.teamGamePlayed, team.teamGamePlayed)),

    games: playerStats.games,
    goals: playerStats.goals,
    yellowCards: playerStats.yellowCards,
    minutes: playerStats.minutes,
    starts: playerStats.starts,
    substituteIn: playerStats.substituteIn,
    substitutedOut: playerStats.substitutedOut,
    teamMinutes: playerStats.teamMinutes,
    teamGames: playerStats.teamGames,
    minutesPerGame: playerStats.minutesPerGame,
    ...normalization,

    ...scoutIndexFields,

    sourceCollection: playerDocumentId ? 'players' : 'birthTeams',
    sourceDocumentId: playerDocumentId || teamScope.birthTeamDocumentId,
    sourceTarget: clean(target) === 'history' ? 'history' : 'current',

    updatedAt: serverTimestamp(),
  }
}

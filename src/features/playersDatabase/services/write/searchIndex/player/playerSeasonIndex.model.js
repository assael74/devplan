// features/playersDatabase/services/write/searchIndex/player/playerSeasonIndex.model.js

import { serverTimestamp } from 'firebase/firestore'
import { adaptPlayerScoutEngineResult } from '../../../../domain/index.js'
import { normalizePlayerStats } from '../../../../model/playerStats.model.js'
import { buildSeasonKey, clean, toNumberOrZero } from '../../leagues/leagueDoc.js'
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
import {
  buildScoutProfileSearchIds,
  normalizeScoutSignalsForIndex,
} from './playerSeasonIndex.scout.js'
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
  const playerScout = adaptPlayerScoutEngineResult({
    signals: normalizeScoutSignalsForIndex(player),
    combinations: Array.isArray(player.scoutCombinations)
      ? player.scoutCombinations
      : [],
  })
  const primaryScoutSignal = playerScout.primaryProfile
  const secondaryScoutSignal = playerScout.secondaryProfile
  const scoutProfileIds = playerScout.profileIds
  const scoutCombinationIds = playerScout.combinationIds
  const scoutProfileSearchIds = buildScoutProfileSearchIds({
    scoutProfileIds,
    scoutCombinationIds,
  })
  const normalization = buildPlayerSeasonSearchMetrics({
    target,
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
    playerUrl: clean(player.playerUrl),
    rosterStatus: getRosterStatus(player),
    isYoungerAgeGroup: Boolean(player.isYoungerAgeGroup),
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
    minutesPerGame: playerStats.minutesPerGame,
    ...normalization,

    primaryScoutProfileId: clean(primaryScoutSignal?.id),
    primaryScoutReliabilityLevel: clean(primaryScoutSignal?.reliability?.level),
    primaryScoutScore: Number.isFinite(Number(primaryScoutSignal?.score)) ? Number(primaryScoutSignal.score) : null,

    secondaryScoutProfileId: clean(secondaryScoutSignal?.id),
    secondaryScoutReliabilityLevel: clean(secondaryScoutSignal?.reliability?.level),
    secondaryScoutScore: Number.isFinite(Number(secondaryScoutSignal?.score)) ? Number(secondaryScoutSignal.score) : null,
    scoutProfileIds,
    scoutCombinationIds,
    scoutProfileSearchIds,

    sourceCollection: playerDocumentId ? 'players' : 'birthTeams',
    sourceDocumentId: playerDocumentId || teamScope.birthTeamDocumentId,
    sourceTarget: clean(target) === 'history' ? 'history' : 'current',

    updatedAt: serverTimestamp(),
  }
}

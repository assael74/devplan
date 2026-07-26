// features/playersDatabase/services/write/searchIndex/player/playerSeasonIndex.stats.model.js

import { adaptPlayerScoutEngineResult } from '../../../../domain/index.js'
import { normalizePlayerStats } from '../../../../model/playerStats.model.js'
import { clean, toNumberOrZero } from '../../leagues/leagueDoc.js'
import { buildPlayerDocumentId, hasPlayerScoutProfiles } from '../../players/index.js'
import {
  buildInternalPlayerId,
  buildPlayerAliases,
  buildPlayerSeasonIndexId,
  buildScoutProfileSearchIds,
  getRosterStatus,
  normalizeScoutSignalsForIndex,
  normalizeText,
  resolveClubLevel,
  shouldSkipNewPlayerSeasonIndex,
} from './playerSeasonIndex.model.js'
import { buildPlayerSeasonSearchMetrics } from '../shared/searchIndexNormalization.model.js'

const toNullableNumber = value => (
  Number.isFinite(Number(value))
    ? Number(value)
    : null
)

export const buildPlayerSeasonStatsFailure = ({
  identity = {},
  player = {},
} = {}) => ({
  code: 'PLAYER_INDEX_IDENTITY_INCOMPLETE',
  message: 'חסרים מזהה שחקן, עונה, קבוצה או סלוט',
  playerId: identity.playerId,
  seasonId: identity.seasonId,
  birthTeamId: identity.birthTeamId,
  birthTeamSlot: identity.birthTeamSlot,
  displayName: clean(player.matchedPlayerName || player.fullName),
})

export const buildPlayerSeasonStatsDuplicate = ({
  identity = {},
  existingDoc = null,
  duplicateSnapshots = [],
} = {}) => ({
  ...identity,
  documentIds: [
    existingDoc?.id,
    ...duplicateSnapshots.map(item => item.id),
  ].filter(Boolean),
})

export const buildPlayerSeasonStatsMutation = ({
  league = {},
  season = {},
  team = {},
  target = 'current',
  player = {},
  existingDoc = null,
  teamScope = {},
  leagueId = '',
  seasonId = '',
  seasonKey = '',
} = {}) => {
  const existingData = existingDoc?.data?.() || {}
  const rosterStatus = getRosterStatus(player)

  if (rosterStatus === 'retired') {
    return existingDoc
      ? { type: 'delete', ref: existingDoc.ref }
      : { type: 'skip' }
  }

  if (!existingDoc && shouldSkipNewPlayerSeasonIndex(player)) {
    return { type: 'skip' }
  }

  const displayName = clean(
    player.matchedPlayerName ||
    existingData.displayName ||
    player.fullName
  )
  const normalizedDisplayName = normalizeText(
    player.normalizedName ||
    existingData.normalizedDisplayName ||
    displayName
  )
  const externalPlayerId = clean(
    player.externalPlayerId || existingData.externalPlayerId
  )
  const playerId = clean(
    player.matchedPlayerId ||
    player.playerId ||
    existingData.playerId
  ) || buildInternalPlayerId({ player, season })
  const aliases = buildPlayerAliases({
    player,
    displayName,
    existingAliases: existingData.aliases,
  })
  const playerDocumentId = clean(
    player.playerDocumentId || existingData.playerDocumentId
  ) || (
    hasPlayerScoutProfiles(player)
      ? buildPlayerDocumentId({ ...player, playerId })
      : ''
  )
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
  const playerStats = normalizePlayerStats(player)
  const resolvedAgeGroupId = clean(
    team.ageGroupId ||
    league.ageGroupId ||
    existingData.ageGroupId
  )
  const resolvedLeagueTotalRound = toNumberOrZero(
    season.leagueTotalRound || existingData.leagueTotalRound
  )
  const resolvedTeamGamePlayed = toNumberOrZero(
    team.teamStats?.teamGamePlayed ||
    team.teamGamePlayed ||
    existingData.teamGamePlayed ||
    playerStats.teamGames
  )
  const normalization = buildPlayerSeasonSearchMetrics({
    target,
    ageGroupId: resolvedAgeGroupId,
    leagueTotalRound: resolvedLeagueTotalRound,
    teamGamePlayed: resolvedTeamGamePlayed,
    stats: playerStats,
  })
  const id = existingDoc?.id || buildPlayerSeasonIndexId({
    seasonKey,
    clubId: teamScope.clubId || team.clubId || existingData.clubId,
    ageGroupId:
      teamScope.ageGroupId ||
      team.ageGroupId ||
      league.ageGroupId ||
      existingData.ageGroupId,
    ageGroupLabel:
      teamScope.ageGroupLabel ||
      team.ageGroupLabel ||
      league.ageGroupLabel ||
      existingData.ageGroupLabel,
    birthYear:
      teamScope.birthYear ||
      season.birthYear ||
      existingData.birthYear,
    birthTeamSlot: teamScope.birthTeamSlot,
    playerId,
    externalPlayerId,
    normalizedName: normalizedDisplayName,
  })

  if (!id || !displayName) return { type: 'skip' }

  return {
    type: 'set',
    id,
    ref: existingDoc?.ref || null,
    created: !existingDoc,
    data: {
      id,
      entityType: 'playerSeason',
      entityId: id,
      displayName,
      normalizedDisplayName,
      aliases,
      playerId,
      externalPlayerId,
      playerDocumentId,
      playerUrl: clean(player.playerUrl || existingData.playerUrl),
      rosterStatus,
      isYoungerAgeGroup: Boolean(
        player.isYoungerAgeGroup || existingData.isYoungerAgeGroup
      ),
      favorite: Boolean(player.favorite || existingData.favorite),
      notes: clean(player.notes || existingData.notes),
      leagueId,
      seasonId,
      seasonKey,
      clubId: clean(team.clubId || existingData.clubId),
      clubLevel: resolveClubLevel({
        clubId: team.clubId || existingData.clubId,
        clubLevel: team.clubLevel || existingData.clubLevel,
      }),
      birthTeamId: teamScope.birthTeamId,
      birthTeamDocumentId: teamScope.birthTeamDocumentId,
      birthTeamSlot: teamScope.birthTeamSlot,
      teamId: teamScope.birthTeamId,
      teamDocumentId: teamScope.birthTeamDocumentId,
      teamUrl: clean(team.teamUrl || existingData.teamUrl),
      seasonUrl: clean(season.seasonUrl || existingData.seasonUrl),
      seasonNotes: clean(player.notes || existingData.seasonNotes),
      ageGroupId: resolvedAgeGroupId,
      ageGroupLabel: clean(
        team.ageGroupLabel ||
        league.ageGroupLabel ||
        existingData.ageGroupLabel
      ),
      birthYear: toNumberOrZero(
        season.birthYear || existingData.birthYear
      ),
      leagueTotalRound: resolvedLeagueTotalRound,
      leagueLevel: toNumberOrZero(
        league.level || existingData.leagueLevel
      ),
      region: clean(league.region || existingData.region),
      primaryPosition: clean(
        player.primaryPosition || existingData.primaryPosition
      ),
      positionLayer: clean(
        player.positionLayer || existingData.positionLayer
      ),
      numShirt: clean(player.numShirt || existingData.numShirt),
      teamTableRank: toNumberOrZero(
        team.tableRank || existingData.teamTableRank
      ),
      teamTableAttackRank: toNumberOrZero(
        team.tableAttackRank || existingData.teamTableAttackRank
      ),
      teamTableDefenseRank: toNumberOrZero(
        team.tableDefenseRank || existingData.teamTableDefenseRank
      ),
      teamGoalsFor: toNumberOrZero(
        team.teamStats?.goalsFor ??
        team.goalsFor ??
        existingData.teamGoalsFor
      ),
      teamGoalsAgainst: toNumberOrZero(
        team.teamStats?.goalsAgainst ??
        team.goalsAgainst ??
        existingData.teamGoalsAgainst
      ),
      teamGoalsForPerGame: toNumberOrZero(
        team.goalsForPerGame ?? existingData.teamGoalsForPerGame
      ),
      teamGamePlayed: resolvedTeamGamePlayed,
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
      primaryScoutReliabilityLevel: clean(
        primaryScoutSignal?.reliability?.level
      ),
      primaryScoutScore: toNullableNumber(primaryScoutSignal?.score),
      secondaryScoutProfileId: clean(secondaryScoutSignal?.id),
      secondaryScoutReliabilityLevel: clean(
        secondaryScoutSignal?.reliability?.level
      ),
      secondaryScoutScore: toNullableNumber(secondaryScoutSignal?.score),
      scoutProfileIds,
      scoutCombinationIds,
      scoutProfileSearchIds,
      sourceCollection: playerDocumentId ? 'players' : 'birthTeams',
      sourceDocumentId:
        playerDocumentId || teamScope.birthTeamDocumentId,
      sourceTarget: clean(target) === 'history' ? 'history' : 'current',
    },
  }
}

// features/playersDatabase/services/write/searchIndex/player/playerSeasonIndex.stats.js

import {
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  where,
  writeBatch,
} from 'firebase/firestore'
import { db } from '../../../../../../services/firebase/firebase.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../../../constants/pdb.constants.js'
import { normalizePlayerStats } from '../../../../model/playerStats.model.js'
import { buildSeasonKey, clean, toNumberOrZero } from '../../leagues/leagueDoc.js'
import { buildPlayerSeasonScope } from '../../shared/playerSeasonScope.js'
import { buildPlayerDocumentId, hasPlayerScoutProfiles } from '../../players/index.js'
import { buildSearchIndexWriteResult, SEARCH_INDEX_ENTITY_TYPES } from '../shared/searchIndexResult.model.js'
import { commitBatchWhenNeeded } from '../shared/searchIndexBatch.write.js'
import {
  buildInternalPlayerId,
  buildPlayerAliases,
  buildPlayerSeasonIndexId,
  buildPlayerSeasonIndexLookup,
  buildPlayerSeasonIndexScope,
  findExistingPlayerSeasonIndexDoc,
  getRosterStatus,
  isSamePlayerSeasonIndexContext,
  normalizeText,
  resolveClubLevel,
  shouldSkipNewPlayerSeasonIndex,
} from './playerSeasonIndex.model.js'

export async function updatePlayerSeasonSearchIndexStatsMany({
  league = {},
  season = {},
  team = {},
  target = 'current',
  players = [],
} = {}) {
  const leagueId = clean(league.id || season.leagueId || team.leagueId)
  const seasonId = clean(season.seasonId)
  const seasonKey = clean(season.seasonKey) || buildSeasonKey(seasonId)
  const teamScope = buildPlayerSeasonScope({
    season: { ...season, seasonId, seasonKey },
    team,
  })
  const indexScope = buildPlayerSeasonIndexScope({
    league,
    season: { ...season, seasonId, seasonKey, leagueId },
    team,
  })
  const teamId = teamScope.birthTeamId
  if (!teamId || !seasonKey) {
    return buildSearchIndexWriteResult({
      entityType: SEARCH_INDEX_ENTITY_TYPES.playerSeason,
      operation: 'updateStatsMany',
      rowsCount: 0,
    })
  }

  const safePlayers = (Array.isArray(players) ? players : [])
    .filter(player => clean(player.fullName || player.matchedPlayerName || player.externalPlayerId || player.playerId))
  const rowsQuery = query(
    collection(db, PLAYERS_DATABASE_COLLECTIONS.searchIndexes),
    where(indexScope.clubId ? 'clubId' : 'teamId', '==', indexScope.clubId || teamId)
  )
  const snapshot = await getDocs(rowsQuery)
  const existingDocs = snapshot.docs.filter(playerDoc => (
    isSamePlayerSeasonIndexContext(playerDoc.data() || {}, indexScope)
  ))
  const existingLookup = buildPlayerSeasonIndexLookup(existingDocs)
  const batch = writeBatch(db)
  let rowsCount = 0

  safePlayers.forEach(player => {
    const existingDoc = findExistingPlayerSeasonIndexDoc({ lookup: existingLookup, player })
    const existingData = existingDoc?.data?.() || {}
    const rosterStatus = getRosterStatus(player)
    const playerStats = normalizePlayerStats(player)

    if (rosterStatus === 'retired') {
      if (existingDoc) {
        rowsCount += 1
        batch.delete(existingDoc.ref)
      }
      return
    }

    if (!existingDoc && shouldSkipNewPlayerSeasonIndex(player)) return

    const displayName = clean(player.matchedPlayerName || existingData.displayName || player.fullName)
    const normalizedDisplayName = normalizeText(player.normalizedName || existingData.normalizedDisplayName || displayName)
    const externalPlayerId = clean(player.externalPlayerId || existingData.externalPlayerId)
    const playerId = clean(player.matchedPlayerId || player.playerId || existingData.playerId)
      || buildInternalPlayerId({ player, season })
    const aliases = buildPlayerAliases({
      player,
      displayName,
      existingAliases: existingData.aliases,
    })
    const playerDocumentId = clean(player.playerDocumentId || existingData.playerDocumentId) || (hasPlayerScoutProfiles(player)
      ? buildPlayerDocumentId({ ...player, playerId })
      : '')
    const primaryScoutSignal = Array.isArray(player.scoutSignals) ? player.scoutSignals[0] : null
    const secondaryScoutSignal = Array.isArray(player.scoutSignals) ? player.scoutSignals[1] : null
    const id = existingDoc?.id || buildPlayerSeasonIndexId({
      seasonKey,
      clubId: teamScope.clubId || team.clubId || existingData.clubId,
      ageGroupId: teamScope.ageGroupId || team.ageGroupId || league.ageGroupId || existingData.ageGroupId,
      ageGroupLabel: teamScope.ageGroupLabel || team.ageGroupLabel || league.ageGroupLabel || existingData.ageGroupLabel,
      birthYear: teamScope.birthYear || season.birthYear || existingData.birthYear,
      birthTeamSlot: teamScope.birthTeamSlot,
      playerId,
      externalPlayerId,
      normalizedName: normalizedDisplayName,
    })
    if (!id || !displayName) return

    rowsCount += 1
    batch.set(
      existingDoc?.ref || doc(db, PLAYERS_DATABASE_COLLECTIONS.searchIndexes, id),
      {
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
        isYoungerAgeGroup: Boolean(player.isYoungerAgeGroup || existingData.isYoungerAgeGroup),
        favorite: Boolean(player.favorite || existingData.favorite),
        notes: clean(player.notes || existingData.notes),
        leagueId,
        seasonId,
        seasonKey,
        clubId: clean(team.clubId || existingData.clubId),
        clubLevel: resolveClubLevel({ clubId: team.clubId || existingData.clubId, clubLevel: team.clubLevel || existingData.clubLevel }),
        birthTeamId: teamId,
        birthTeamDocumentId: teamScope.birthTeamDocumentId,
        birthTeamSlot: teamScope.birthTeamSlot,
        teamId,
        teamDocumentId: teamScope.birthTeamDocumentId,
        teamUrl: clean(team.teamUrl || existingData.teamUrl),
        seasonUrl: clean(season.seasonUrl || existingData.seasonUrl),
        seasonNotes: clean(player.notes || existingData.seasonNotes),
        ageGroupId: clean(team.ageGroupId || league.ageGroupId || existingData.ageGroupId),
        ageGroupLabel: clean(team.ageGroupLabel || league.ageGroupLabel || existingData.ageGroupLabel),
        birthYear: toNumberOrZero(season.birthYear || existingData.birthYear),
        leagueTotalRound: toNumberOrZero(season.leagueTotalRound || existingData.leagueTotalRound),
        leagueLevel: toNumberOrZero(league.level || existingData.leagueLevel),
        region: clean(league.region || existingData.region),
        primaryPosition: clean(player.primaryPosition || existingData.primaryPosition),
        positionLayer: clean(player.positionLayer || existingData.positionLayer),
        numShirt: clean(player.numShirt || existingData.numShirt),
        teamTableRank: toNumberOrZero(team.tableRank || existingData.teamTableRank),
        teamTableAttackRank: toNumberOrZero(team.tableAttackRank || existingData.teamTableAttackRank),
        teamTableDefenseRank: toNumberOrZero(team.tableDefenseRank || existingData.teamTableDefenseRank),
        teamGoalsFor: toNumberOrZero(team.teamStats?.goalsFor ?? team.goalsFor ?? existingData.teamGoalsFor),
        teamGoalsAgainst: toNumberOrZero(team.teamStats?.goalsAgainst ?? team.goalsAgainst ?? existingData.teamGoalsAgainst),
        teamGoalsForPerGame: toNumberOrZero(team.goalsForPerGame ?? existingData.teamGoalsForPerGame),
        teamGamePlayed: toNumberOrZero(team.teamStats?.teamGamePlayed ?? team.teamGamePlayed ?? existingData.teamGamePlayed),
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
      },
      { merge: true }
    )
  })

  await commitBatchWhenNeeded({ batch, operationsCount: rowsCount })

  return buildSearchIndexWriteResult({
    entityType: SEARCH_INDEX_ENTITY_TYPES.playerSeason,
    operation: 'updateStatsMany',
    rowsCount,
  })
}

const buildPlayerSeasonIndexIdFromPayload = ({
  season = {},
  team = {},
  player = {},
} = {}) => {
  const seasonId = clean(season.seasonId)
  const seasonKey = clean(season.seasonKey) || buildSeasonKey(seasonId)
  const displayName = clean(player.matchedPlayerName || player.fullName)
  const normalizedDisplayName = normalizeText(player.normalizedName || displayName)
  const teamScope = buildPlayerSeasonScope({
    season: { ...season, seasonId, seasonKey },
    team,
  })

  return buildPlayerSeasonIndexId({
    seasonKey,
    clubId: teamScope.clubId || team.clubId,
    ageGroupId: teamScope.ageGroupId || team.ageGroupId,
    ageGroupLabel: teamScope.ageGroupLabel || team.ageGroupLabel,
    birthYear: teamScope.birthYear || season.birthYear || player.birthYear,
    birthTeamSlot: teamScope.birthTeamSlot,
    playerId: clean(player.matchedPlayerId || player.playerId),
    externalPlayerId: clean(player.externalPlayerId),
    normalizedName: normalizedDisplayName || clean(player.playerId),
  })
}

const findPlayerSeasonIndexDocForPayload = async ({
  league = {},
  season = {},
  team = {},
  player = {},
} = {}) => {
  const leagueId = clean(league.id || season.leagueId || team.leagueId)
  const seasonId = clean(season.seasonId)
  const seasonKey = clean(season.seasonKey) || buildSeasonKey(seasonId)
  const teamScope = buildPlayerSeasonScope({
    season: { ...season, seasonId, seasonKey },
    team,
  })
  const indexScope = buildPlayerSeasonIndexScope({
    league,
    season: { ...season, seasonId, seasonKey, leagueId },
    team,
  })
  const teamId = teamScope.birthTeamId
  if (!teamId || !seasonKey) return null

  const rowsQuery = query(
    collection(db, PLAYERS_DATABASE_COLLECTIONS.searchIndexes),
    where(indexScope.clubId ? 'clubId' : 'teamId', '==', indexScope.clubId || teamId)
  )
  const snapshot = await getDocs(rowsQuery)
  const existingDocs = snapshot.docs.filter(playerDoc => (
    isSamePlayerSeasonIndexContext(playerDoc.data() || {}, indexScope)
  ))

  return findExistingPlayerSeasonIndexDoc({
    lookup: buildPlayerSeasonIndexLookup(existingDocs),
    player,
  })
}

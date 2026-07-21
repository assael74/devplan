// features/playersDatabase/services/write/searchIndex/player/playerSeasonIndex.bulk.js

import {
  collection,
  getDocs,
  query,
  serverTimestamp,
  where,
  writeBatch,
} from 'firebase/firestore'
import { db } from '../../../../../../services/firebase/firebase.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../../../constants/pdb.constants.js'
import { buildSeasonKey, clean, toNumberOrZero } from '../../leagues/leagueDoc.js'
import { buildPlayerSeasonScope } from '../../shared/playerSeasonScope.js'
import { buildSearchIndexWriteResult, SEARCH_INDEX_ENTITY_TYPES } from '../shared/searchIndexResult.model.js'
import { commitBatchWhenNeeded } from '../shared/searchIndexBatch.write.js'
import {
  buildPlayerSeasonIndexScope,
  isSamePlayerSeasonIndexContext,
  normalizeText,
} from './playerSeasonIndex.model.js'

export async function updatePlayerSeasonSearchIndexTeamUrl({
  league = {},
  season = {},
  team = {},
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
  if (!seasonKey) throw new Error('Missing season key')
  if (!teamId) throw new Error('Missing birth team id')

  const rowsQuery = query(
    collection(db, PLAYERS_DATABASE_COLLECTIONS.searchIndexes),
    where(indexScope.clubId ? 'clubId' : 'teamId', '==', indexScope.clubId || teamId)
  )
  const snapshot = await getDocs(rowsQuery)
  const batch = writeBatch(db)
  let updatedRowsCount = 0

  snapshot.docs.forEach(playerDoc => {
    const data = playerDoc.data() || {}
    if (!isSamePlayerSeasonIndexContext(data, indexScope)) return

    updatedRowsCount += 1
    batch.set(
      playerDoc.ref,
      {
        teamUrl: clean(team.teamUrl),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    )
  })

  await commitBatchWhenNeeded({ batch, operationsCount: updatedRowsCount })

  return buildSearchIndexWriteResult({
    entityType: SEARCH_INDEX_ENTITY_TYPES.playerSeason,
    operation: 'updateTeamUrl',
    rowsCount: updatedRowsCount,
    teamUrl: clean(team.teamUrl),
  })
}

export async function updatePlayerFavoriteSearchIndexes({
  player = {},
  favorite = false,
} = {}) {
  const playerId = clean(player.externalPlayerId)
    || normalizeText(player.normalizedName || player.fullName || player.playerId)
  if (!playerId) throw new Error('Missing player id')

  const rowsQuery = query(
    collection(db, PLAYERS_DATABASE_COLLECTIONS.searchIndexes),
    where('playerId', '==', playerId)
  )
  const snapshot = await getDocs(rowsQuery)
  const batch = writeBatch(db)
  let rowsCount = 0

  snapshot.docs.forEach(indexDoc => {
    const data = indexDoc.data() || {}
    if (clean(data.entityType) !== 'playerSeason') return

    rowsCount += 1
    batch.set(
      indexDoc.ref,
      {
        favorite: Boolean(favorite),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    )
  })

  await commitBatchWhenNeeded({ batch, operationsCount: rowsCount })

  return buildSearchIndexWriteResult({
    entityType: SEARCH_INDEX_ENTITY_TYPES.playerSeason,
    operation: 'updateFavorite',
    rowsCount,
    favorite: Boolean(favorite),
  })
}

export async function updatePlayerSeasonSearchIndexesSeasonMeta({
  league = {},
  season = {},
  birthYear = null,
  leagueTotalRound = null,
} = {}) {
  const leagueId = clean(league.id || season.leagueId)
  const seasonId = clean(season.seasonId)
  const seasonKey = clean(season.seasonKey) || buildSeasonKey(seasonId)
  if (!leagueId) throw new Error('Missing league id')
  if (!seasonKey) throw new Error('Missing season key')

  const rowsQuery = query(
    collection(db, PLAYERS_DATABASE_COLLECTIONS.searchIndexes),
    where('leagueId', '==', leagueId),
    where('seasonKey', '==', seasonKey),
    where('entityType', '==', 'playerSeason')
  )
  const snapshot = await getDocs(rowsQuery)
  const batch = writeBatch(db)

  snapshot.docs.forEach(indexDoc => {
    batch.set(
      indexDoc.ref,
      {
        birthYear: toNumberOrZero(birthYear ?? season.birthYear),
        leagueTotalRound: toNumberOrZero(leagueTotalRound ?? season.leagueTotalRound),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    )
  })

  await commitBatchWhenNeeded({ batch, operationsCount: snapshot.docs.length })

  return buildSearchIndexWriteResult({
    entityType: SEARCH_INDEX_ENTITY_TYPES.playerSeason,
    operation: 'updateSeasonMeta',
    rowsCount: snapshot.docs.length,
  })
}

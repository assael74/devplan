// features/playersDatabase/services/write/searchIndex/team/teamSeasonIndex.bulk.js

import { collection, getDocs, query, serverTimestamp, where, writeBatch } from 'firebase/firestore'
import { db } from '../../../../../../services/firebase/firebase.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../../../constants/pdb.constants.js'
import { buildSeasonKey, clean, toNumberOrZero } from '../../leagues/leagueDoc.js'
import { buildSearchIndexWriteResult, SEARCH_INDEX_ENTITY_TYPES } from '../shared/searchIndexResult.model.js'
import { commitBatchWhenNeeded } from '../shared/searchIndexBatch.write.js'

export async function updateSearchIndexesLeagueSeasonUrl({
  league = {},
  season = {},
  seasonUrl = '',
} = {}) {
  const leagueId = clean(league.id || season.leagueId)
  const seasonId = clean(season.seasonId)
  const seasonKey = clean(season.seasonKey) || buildSeasonKey(seasonId)
  if (!leagueId) throw new Error('Missing league id')
  if (!seasonKey) throw new Error('Missing season key')

  const rowsQuery = query(
    collection(db, PLAYERS_DATABASE_COLLECTIONS.searchIndexes),
    where('leagueId', '==', leagueId),
    where('seasonKey', '==', seasonKey)
  )
  const snapshot = await getDocs(rowsQuery)
  const batch = writeBatch(db)

  snapshot.docs.forEach(indexDoc => {
    batch.set(
      indexDoc.ref,
      {
        seasonUrl: clean(seasonUrl),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    )
  })

  await commitBatchWhenNeeded({ batch, operationsCount: snapshot.docs.length })

  return buildSearchIndexWriteResult({
    operation: 'updateLeagueSeasonUrl',
    rowsCount: snapshot.docs.length,
    seasonUrl: clean(seasonUrl),
  })
}

export async function updateTeamSeasonSearchIndexesSeasonMeta({
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
    where('entityType', '==', 'birthTeamSeason')
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
    entityType: SEARCH_INDEX_ENTITY_TYPES.teamSeason,
    operation: 'updateSeasonMeta',
    rowsCount: snapshot.docs.length,
  })
}

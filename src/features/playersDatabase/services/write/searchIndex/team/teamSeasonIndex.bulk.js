// features/playersDatabase/services/write/searchIndex/team/teamSeasonIndex.bulk.js

import {
  collection,
  query,
  serverTimestamp,
  where,
} from 'firebase/firestore'
import {
  createTrackedWriteBatch,
  trackedGetDocs,
} from '../../../../../../services/firestore/usage/index.js'
import { db } from '../../../../../../services/firebase/firebase.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../../../constants/pdb.constants.js'
import {
  buildSeasonKey,
  clean,
  toNumberOrZero,
} from '../../leagues/leagueDoc.js'
import {
  buildSearchIndexWriteResult,
  SEARCH_INDEX_ENTITY_TYPES,
} from '../shared/searchIndexResult.model.js'
import { commitBatchWhenNeeded } from '../shared/searchIndexBatch.write.js'
import { buildTeamSeasonSearchMetrics } from '../shared/searchIndexNormalization.model.js'

const readSearchIndexes = queryRef => trackedGetDocs(queryRef, {
  feature: 'playersDatabase',
  collection: PLAYERS_DATABASE_COLLECTIONS.searchIndexes,
  action: 'teamSeasonIndex-bulk',
  operationSubtype: 'maintenance-query',
})

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
  const snapshot = await readSearchIndexes(rowsQuery)
  const batch = createTrackedWriteBatch(db, {
    feature: 'playersDatabase',
    collection: PLAYERS_DATABASE_COLLECTIONS.searchIndexes,
    action: 'teamSeasonIndex-bulk',
    operationSubtype: 'maintenance-batch',
  })

  const nextSeasonUrl = clean(seasonUrl)
  let writesCount = 0
  let unchangedCount = 0

  snapshot.docs.forEach(indexDoc => {
    const data = indexDoc.data() || {}
    if (clean(data.seasonUrl) === nextSeasonUrl) {
      unchangedCount += 1
      return
    }

    batch.set(
      indexDoc.ref,
      {
        seasonUrl: nextSeasonUrl,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    )
    writesCount += 1
  })

  await commitBatchWhenNeeded({
    batch,
    operationsCount: writesCount,
  })

  return buildSearchIndexWriteResult({
    operation: 'updateLeagueSeasonUrl',
    rowsCount: writesCount,
    unchangedCount,
    seasonUrl: nextSeasonUrl,
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
  const snapshot = await readSearchIndexes(rowsQuery)
  const batch = createTrackedWriteBatch(db, {
    feature: 'playersDatabase',
    collection: PLAYERS_DATABASE_COLLECTIONS.searchIndexes,
    action: 'teamSeasonIndex-bulk',
    operationSubtype: 'maintenance-batch',
  })

  const nextBirthYear = toNumberOrZero(
    birthYear !== null && birthYear !== undefined
      ? birthYear
      : season.birthYear
  )
  const nextLeagueTotalRound = toNumberOrZero(
    leagueTotalRound !== null && leagueTotalRound !== undefined
      ? leagueTotalRound
      : season.leagueTotalRound
  )

  let writesCount = 0
  let unchangedCount = 0

  snapshot.docs.forEach(indexDoc => {
    const data = indexDoc.data() || {}
    const target = clean(data.sourceTarget) === 'history' ? 'history' : 'current'
    const searchMetrics = buildTeamSeasonSearchMetrics({
      target,
      leagueTotalRound: nextLeagueTotalRound,
      teamGamePlayed: toNumberOrZero(data.teamGamePlayed),
      points: toNumberOrZero(data.points),
      goalsFor: toNumberOrZero(data.goalsFor),
      goalsAgainst: toNumberOrZero(data.goalsAgainst),
    })
    const nextMeta = {
      birthYear: nextBirthYear,
      leagueTotalRound: nextLeagueTotalRound,
      ...searchMetrics,
    }
    const isUnchanged = Object.entries(nextMeta).every(([key, value]) => (
      data[key] === value
    ))

    if (isUnchanged) {
      unchangedCount += 1
      return
    }

    batch.set(
      indexDoc.ref,
      {
        ...nextMeta,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    )
    writesCount += 1
  })

  await commitBatchWhenNeeded({
    batch,
    operationsCount: writesCount,
  })

  return buildSearchIndexWriteResult({
    entityType: SEARCH_INDEX_ENTITY_TYPES.teamSeason,
    operation: 'updateSeasonMeta',
    rowsCount: writesCount,
    unchangedCount,
  })
}

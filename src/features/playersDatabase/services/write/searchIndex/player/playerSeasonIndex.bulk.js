// features/playersDatabase/services/write/searchIndex/player/playerSeasonIndex.bulk.js

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
import { buildPlayerSeasonScope } from '../../shared/playerSeasonScope.js'
import {
  buildSearchIndexWriteResult,
  SEARCH_INDEX_ENTITY_TYPES,
} from '../shared/searchIndexResult.model.js'
import { commitBatchWhenNeeded } from '../shared/searchIndexBatch.write.js'
import { buildPlayerSeasonSearchMetrics } from '../shared/searchIndexNormalization.model.js'
import {
  buildPlayerSeasonIndexScope,
  isSamePlayerSeasonIndexContext,
  resolveTeamSeasonSourceTarget,
} from './playerSeasonIndex.model.js'

const readSearchIndexes = queryRef => trackedGetDocs(queryRef, {
  feature: 'playersDatabase',
  collection: PLAYERS_DATABASE_COLLECTIONS.searchIndexes,
  action: 'playerSeasonIndex-bulk',
  operationSubtype: 'maintenance-query',
})

export async function updatePlayerSeasonSearchIndexTeamUrl({
  league = {},
  season = {},
  team = {},
} = {}) {
  const leagueId = clean(league.id || season.leagueId || team.leagueId)
  const seasonId = clean(season.seasonId)
  const seasonKey = clean(season.seasonKey) || buildSeasonKey(seasonId)
  const teamScope = buildPlayerSeasonScope({
    season: {
      ...season,
      seasonId,
      seasonKey,
    },
    team,
  })
  const indexScope = buildPlayerSeasonIndexScope({
    league,
    season: {
      ...season,
      seasonId,
      seasonKey,
      leagueId,
    },
    team,
  })
  const teamId = teamScope.birthTeamId
  if (!seasonKey) throw new Error('Missing season key')
  if (!teamId) throw new Error('Missing birth team id')

  const rowsQuery = query(
    collection(db, PLAYERS_DATABASE_COLLECTIONS.searchIndexes),
    where('birthTeamId', '==', teamId),
    where('seasonKey', '==', seasonKey),
    where('entityType', '==', SEARCH_INDEX_ENTITY_TYPES.playerSeason)
  )
  const snapshot = await readSearchIndexes(rowsQuery)
  const batch = createTrackedWriteBatch(db, {
    feature: 'playersDatabase',
    collection: PLAYERS_DATABASE_COLLECTIONS.searchIndexes,
    action: 'playerSeasonIndex-bulk',
    operationSubtype: 'maintenance-batch',
  })
  let updatedRowsCount = 0
  let unchangedCount = 0
  const nextTeamUrl = clean(team.teamUrl)

  snapshot.docs.forEach(playerDoc => {
    const data = playerDoc.data() || {}
    if (!isSamePlayerSeasonIndexContext(data, indexScope)) return
    if (clean(data.teamUrl) === nextTeamUrl) {
      unchangedCount += 1
      return
    }

    updatedRowsCount += 1
    batch.set(
      playerDoc.ref,
      {
        teamUrl: nextTeamUrl,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    )
  })

  await commitBatchWhenNeeded({
    batch,
    operationsCount: updatedRowsCount,
  })

  return buildSearchIndexWriteResult({
    entityType: SEARCH_INDEX_ENTITY_TYPES.playerSeason,
    operation: 'updateTeamUrl',
    rowsCount: updatedRowsCount,
    unchangedCount,
    teamUrl: nextTeamUrl,
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
  const snapshot = await readSearchIndexes(rowsQuery)
  const batch = createTrackedWriteBatch(db, {
    feature: 'playersDatabase',
    collection: PLAYERS_DATABASE_COLLECTIONS.searchIndexes,
    action: 'playerSeasonIndex-bulk',
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

  let updatedRowsCount = 0
  let unchangedCount = 0

  snapshot.docs.forEach(indexDoc => {
    const data = indexDoc.data() || {}
    const isTeamSeasonSource = clean(data.sourceCollection) === 'birthTeamSeasons'
    const target = isTeamSeasonSource
      ? resolveTeamSeasonSourceTarget(season)
      : (clean(data.sourceTarget) === 'history' ? 'history' : 'current')
    const searchMetrics = buildPlayerSeasonSearchMetrics({
      target,
      seasonStatus: isTeamSeasonSource
        ? season.seasonStatus
        : data.seasonStatus,
      ageGroupId: data.ageGroupId || season.ageGroupId || league.ageGroupId,
      leagueTotalRound: nextLeagueTotalRound,
      teamGamePlayed: toNumberOrZero(
        data.teamGamePlayed || data.teamGames
      ),
      stats: {
        games: toNumberOrZero(data.games),
        goals: toNumberOrZero(data.goals),
        minutes: toNumberOrZero(data.minutes),
        starts: toNumberOrZero(data.starts),
        teamGames: toNumberOrZero(data.teamGames),
      },
    })

    const nextMeta = {
      birthYear: nextBirthYear,
      leagueTotalRound: nextLeagueTotalRound,
      ...searchMetrics,
      ...(isTeamSeasonSource ? { sourceTarget: target } : {}),
    }
    const unchanged = Object.keys(nextMeta).every(key => (
      data[key] === nextMeta[key]
    ))
    if (unchanged) {
      unchangedCount += 1
      return
    }

    updatedRowsCount += 1
    batch.set(
      indexDoc.ref,
      {
        ...nextMeta,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    )
  })

  await commitBatchWhenNeeded({
    batch,
    operationsCount: updatedRowsCount,
  })

  return buildSearchIndexWriteResult({
    entityType: SEARCH_INDEX_ENTITY_TYPES.playerSeason,
    operation: 'updateSeasonMeta',
    rowsCount: updatedRowsCount,
    unchangedCount,
  })
}

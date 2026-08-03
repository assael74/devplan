// features/playersDatabase/services/write/searchIndex/player/playerSeasonIndex.stats.js

import {
  collection,
  doc,
  query,
  serverTimestamp,
  where,
} from 'firebase/firestore'
import { createTrackedWriteBatch, trackedGetDocs } from '../../../../../../services/firestore/usage/index.js'
import { db } from '../../../../../../services/firebase/firebase.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../../../constants/pdb.constants.js'
import { buildSeasonKey, clean } from '../../leagues/leagueDoc.js'
import { buildPlayerSeasonScope } from '../../shared/playerSeasonScope.js'
import {
  buildSearchIndexWriteResult,
  SEARCH_INDEX_ENTITY_TYPES,
} from '../shared/searchIndexResult.model.js'
import { commitBatchWhenNeeded } from '../shared/searchIndexBatch.write.js'
import {
  buildPlayerSeasonIndexLookup,
  buildPlayerSeasonIndexScope,
  findExistingPlayerSeasonIndexDoc,
  hasCompletePlayerSeasonIndexIdentity,
  isSamePlayerSeasonIndexContext,
} from './playerSeasonIndex.model.js'
import {
  buildPlayerSeasonStatsDuplicate,
  buildPlayerSeasonStatsFailure,
  buildPlayerSeasonStatsMutation,
} from './playerSeasonIndex.stats.model.js'

const readSearchIndexes = queryRef => trackedGetDocs(queryRef, {
  feature: 'playersDatabase',
  collection: PLAYERS_DATABASE_COLLECTIONS.searchIndexes,
  action: 'playerSeasonIndex-stats',
  operationSubtype: 'maintenance-query',
})

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
  const normalizedSeason = {
    ...season,
    seasonId,
    seasonKey,
    leagueId,
  }
  const teamScope = buildPlayerSeasonScope({
    season: normalizedSeason,
    team,
  })
  const indexScope = buildPlayerSeasonIndexScope({
    league,
    season: normalizedSeason,
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
    .filter(player => clean(
      player.fullName ||
      player.matchedPlayerName ||
      player.externalPlayerId ||
      player.playerId
    ))
  const rowsQuery = query(
    collection(db, PLAYERS_DATABASE_COLLECTIONS.searchIndexes),
    where(
      indexScope.clubId ? 'clubId' : 'teamId',
      '==',
      indexScope.clubId || teamId
    )
  )
  const snapshot = await readSearchIndexes(rowsQuery)
  const existingDocs = snapshot.docs.filter(playerDoc => (
    isSamePlayerSeasonIndexContext(playerDoc.data() || {}, indexScope)
  ))
  const existingLookup = buildPlayerSeasonIndexLookup(existingDocs)
  const batch = createTrackedWriteBatch(db, {
    feature: 'playersDatabase',
    collection: PLAYERS_DATABASE_COLLECTIONS.searchIndexes,
    action: 'playerSeasonIndex-stats',
    operationSubtype: 'maintenance-batch',
  })
  let rowsCount = 0
  let createdCount = 0
  let updatedCount = 0
  let deletedCount = 0
  const failures = []
  const duplicates = []

  safePlayers.forEach(player => {
    const match = findExistingPlayerSeasonIndexDoc({
      lookup: existingLookup,
      player,
      season: normalizedSeason,
      team,
    })
    const existingDoc = match.snapshot

    if (!hasCompletePlayerSeasonIndexIdentity(match.identity)) {
      failures.push(buildPlayerSeasonStatsFailure({
        identity: match.identity,
        player,
      }))
      return
    }

    if (match.duplicateSnapshots.length) {
      duplicates.push(buildPlayerSeasonStatsDuplicate({
        identity: match.identity,
        existingDoc,
        duplicateSnapshots: match.duplicateSnapshots,
      }))
    }

    const mutation = buildPlayerSeasonStatsMutation({
      league,
      season: normalizedSeason,
      team,
      target,
      player,
      existingDoc,
      teamScope,
      leagueId,
      seasonId,
      seasonKey,
    })

    if (mutation.type === 'skip') return

    rowsCount += 1

    if (mutation.type === 'delete') {
      deletedCount += 1
      batch.delete(mutation.ref)
      return
    }

    if (mutation.created) createdCount += 1
    else updatedCount += 1

    batch.set(
      mutation.ref || doc(
        db,
        PLAYERS_DATABASE_COLLECTIONS.searchIndexes,
        mutation.id
      ),
      {
        ...mutation.data,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    )
  })

  await commitBatchWhenNeeded({
    batch,
    operationsCount: rowsCount,
  })

  return buildSearchIndexWriteResult({
    entityType: SEARCH_INDEX_ENTITY_TYPES.playerSeason,
    operation: 'updateStatsMany',
    rowsCount,
    createdCount,
    updatedCount,
    deletedCount,
    failedCount: failures.length,
    duplicateCount: duplicates.length,
    failures,
    duplicates,
  })
}

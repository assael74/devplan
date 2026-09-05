// features/playersDatabase/services/write/searchIndex/player/playerSeasonIndex.upsert.js

import {
  collection,
  doc,
  query,
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
} from '../../leagues/leagueDoc.js'
import {
  buildSearchIndexWriteResult,
  SEARCH_INDEX_ENTITY_TYPES,
} from '../shared/searchIndexResult.model.js'
import { commitBatchWhenNeeded } from '../shared/searchIndexBatch.write.js'
import { buildPlayerSeasonScope } from '../../shared/playerSeasonScope.js'
import {
  buildPlayerSeasonIndexDoc,
} from './playerSeasonIndex.model.js'
import {
  buildPlayerAliases,
  hasCompletePlayerSeasonIndexIdentity,
  buildPlayerSeasonIndexLookup,
  buildPlayerSeasonIndexScope,
  findExistingPlayerSeasonIndexDoc,
  getRosterStatus,
  isSamePlayerSeasonIndexContext,
  shouldSkipNewPlayerSeasonIndex,
} from './playerSeasonIndex.identity.js'


const normalizeComparableValue = value => {
  if (Array.isArray(value)) return value.map(normalizeComparableValue)

  if (
    value &&
    typeof value === 'object' &&
    Object.getPrototypeOf(value) === Object.prototype
  ) {
    return Object.keys(value)
      .sort()
      .reduce((result, key) => {
        result[key] = normalizeComparableValue(value[key])
        return result
      }, {})
  }

  return value
}

const isPlayerSeasonIndexWriteUnchanged = ({
  existingData = {},
  nextData = {},
} = {}) => Object.keys(nextData)
  .filter(key => key !== 'updatedAt')
  .every(key => (
    JSON.stringify(normalizeComparableValue(existingData[key])) ===
    JSON.stringify(normalizeComparableValue(nextData[key]))
  ))

const readSearchIndexes = queryRef => trackedGetDocs(queryRef, {
  feature: 'playersDatabase',
  collection: PLAYERS_DATABASE_COLLECTIONS.searchIndexes,
  action: 'playerSeasonIndex-upsert',
  operationSubtype: 'maintenance-query',
})

export async function upsertPlayerSeasonSearchIndexMany({
  league = {},
  season = {},
  team = {},
  target = 'current',
  players = [],
  clearPlayerDocumentIds = [],
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
  if (!teamId || !seasonKey) {
    return buildSearchIndexWriteResult({
      entityType: SEARCH_INDEX_ENTITY_TYPES.playerSeason,
      operation: 'upsertMany',
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
    where('birthTeamId', '==', teamId),
    where('seasonKey', '==', seasonKey),
    where('entityType', '==', SEARCH_INDEX_ENTITY_TYPES.playerSeason)
  )
  const snapshot = await readSearchIndexes(rowsQuery)
  const existingDocs = snapshot.docs.filter(playerDoc => (
    isSamePlayerSeasonIndexContext(playerDoc.data() || {}, indexScope)
  ))
  const existingLookup = buildPlayerSeasonIndexLookup(existingDocs)
  const clearedPlayerDocumentIds = new Set(
    (Array.isArray(clearPlayerDocumentIds) ? clearPlayerDocumentIds : [])
      .map(clean)
      .filter(Boolean)
  )
  const batch = createTrackedWriteBatch(db, {
    feature: 'playersDatabase',
    collection: PLAYERS_DATABASE_COLLECTIONS.searchIndexes,
    action: 'playerSeasonIndex-upsert',
    operationSubtype: 'maintenance-batch',
  })
  let rowsCount = 0
  let createdCount = 0
  let updatedCount = 0
  let unchangedCount = 0
  const failures = []
  const duplicates = []

  safePlayers.forEach(player => {
    const match = findExistingPlayerSeasonIndexDoc({
      lookup: existingLookup,
      player,
      season: {
        ...season,
        seasonId,
        seasonKey,
      },
      team,
    })
    const existingDoc = match.snapshot

    if (!hasCompletePlayerSeasonIndexIdentity(match.identity)) {
      failures.push({
        code: 'PLAYER_INDEX_IDENTITY_INCOMPLETE',
        message: 'חסרים מזהה שחקן, עונה, קבוצה או סלוט',
        playerId: match.identity.playerId,
        seasonId: match.identity.seasonId,
        birthTeamId: match.identity.birthTeamId,
        birthTeamSlot: match.identity.birthTeamSlot,
        displayName: clean(player.matchedPlayerName || player.fullName),
      })
      return
    }

    if (!existingDoc && shouldSkipNewPlayerSeasonIndex(player)) return

    if (match.duplicateSnapshots.length) {
      duplicates.push({
        ...match.identity,
        documentIds: [existingDoc?.id, ...match.duplicateSnapshots.map(item => item.id)].filter(Boolean),
      })
    }

    const existingData = existingDoc?.data?.() || {}
    const shouldClearPlayerDocumentId = clearedPlayerDocumentIds.has(clean(
      player.playerDocumentId || existingData.playerDocumentId
    ))
    const indexDoc = buildPlayerSeasonIndexDoc({
      league,
      season: {
        ...season,
        seasonId,
        seasonKey,
      },
      team,
      target,
      player: {
        ...player,
        fullName: clean(player.matchedPlayerName || existingData.displayName || player.fullName),
      },
    })
    const id = existingDoc?.id || indexDoc.id
    if (!id || !indexDoc.teamId || !indexDoc.seasonId || !indexDoc.displayName) return

    const nextData = {
      ...indexDoc,
      id,
      entityId: id,
      aliases: buildPlayerAliases({
        player,
        displayName: indexDoc.displayName,
        existingAliases: existingData.aliases,
      }),
      playerDocumentId: shouldClearPlayerDocumentId
        ? ''
        : clean(indexDoc.playerDocumentId || existingData.playerDocumentId),
      playerUrl: clean(indexDoc.playerUrl || existingData.playerUrl),
      rosterStatus: getRosterStatus(player) || clean(existingData.rosterStatus || 'regular'),
      notes: clean(player.notes || existingData.notes),
    }

    if (
      existingDoc &&
      isPlayerSeasonIndexWriteUnchanged({
        existingData,
        nextData,
      })
    ) {
      unchangedCount += 1
      return
    }

    rowsCount += 1
    if (existingDoc) updatedCount += 1
    else createdCount += 1

    batch.set(
      existingDoc?.ref || doc(db, PLAYERS_DATABASE_COLLECTIONS.searchIndexes, id),
      nextData
    )
  })

  await commitBatchWhenNeeded({
    batch,
    operationsCount: rowsCount,
  })

  return buildSearchIndexWriteResult({
    entityType: SEARCH_INDEX_ENTITY_TYPES.playerSeason,
    operation: 'upsertMany',
    rowsCount,
    createdCount,
    updatedCount,
    unchangedCount,
    failedCount: failures.length,
    duplicateCount: duplicates.length,
    failures,
    duplicates,
  })
}

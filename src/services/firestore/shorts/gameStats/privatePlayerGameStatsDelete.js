// src/services/firestore/shorts/gameStats/privatePlayerGameStatsDelete.js

import { doc, runTransaction, Timestamp } from 'firebase/firestore'

import { db } from '../../../firebase/firebase.js'
import { gameStatsShortsRef } from '../../shortsCollections.js'
import { shortsRefs } from '../shorts.refs.js'

import {
  applyStatsDelta,
  applyStatsRates,
  buildStatsDelta,
  indexPlayerStatsByPlayerId,
  normalizeGamePlayerStatsList,
  removeStatsGameRef,
} from '../../../../shared/stats/engine/index.js'

import {
  buildShortDocRef,
  buildShortsDocPayload,
  clampMinZero,
  clean,
  compactAggregateByKeys,
  findListItem,
  readShortListDoc,
  resolvePayload,
  safeArr,
  toNum,
  updateExistingListItem,
} from './shared/index.js'

const PRIVATE_AGGREGATE_META_KEYS = [
  'id',
  'playerId',
  'createdAt',
  'updatedAt',
]

function ensurePayload(payload) {
  if (!payload || typeof payload !== 'object') {
    throw new Error('[deletePrivatePlayerGameStatsDoc] payload is required')
  }
}

function resolvePlayerId(data) {
  const meta = data.meta || {}

  return clean(meta.playerId || data.playerId || data.editablePlayerId)
}

function buildRefs() {
  const externalGameInfoMeta = shortsRefs.externalGames.gameInfo
  const privatePlayersStatsMeta = shortsRefs.privates.privatePlayersStats

  return {
    externalGameInfoMeta,
    privatePlayersStatsMeta,
    externalGameInfoRef: buildShortDocRef(externalGameInfoMeta),
    privatePlayersStatsRef: buildShortDocRef(privatePlayersStatsMeta),
  }
}

function compactPrivateAggregate(item) {
  return compactAggregateByKeys({
    item,
    keepKeys: PRIVATE_AGGREGATE_META_KEYS,
  })
}

function buildDeletedExternalGameInfoItem({ current, now }) {
  const {
    statsStatus,
    statsDocId,
    gameStatsDocId,
    statsUpdatedAt,
    ...base
  } = current

  return {
    ...base,
    hasStats: false,
    statsDeletedAt: now,
  }
}

function buildRollbackContext({ currentGameStats, externalGame, gameId, gameStatsDocId }) {
  const rows = safeArr(currentGameStats.playerStats)
  const firstRow = rows[0] || {}
  const gameDuration = toNum(externalGame.gameDuration || firstRow.timePlayed || 80)

  return {
    gameId,
    teamId: '',
    gameStatsDocId,
    gameDuration,
    timePlayed: toNum(firstRow.timePlayed) || gameDuration,
    timeVideoStats:
      toNum(firstRow.timeVideoStats) ||
      toNum(firstRow.timePlayed) ||
      gameDuration,
  }
}

function buildDeletedPrivatePlayerAggregate({
  current,
  playerId,
  gameId,
  delta,
  now,
}) {
  let next = {
    ...current,
    id: playerId,
    playerId,
    updatedAt: now,
    createdAt: current && current.createdAt ? current.createdAt : now,
  }

  next = applyStatsDelta(next, delta)

  next.gamesWithStats = clampMinZero((current && current.gamesWithStats || 0) - 1)
  next.statsGameRefs = removeStatsGameRef(current && current.statsGameRefs, gameId)

  return compactPrivateAggregate(applyStatsRates(next))
}

function resolveGameStatsDocId({ payload, externalGame }) {
  const gameStatsDocId = clean(
    payload.gameStatsDocId ||
      payload.statsDocId ||
      externalGame.statsDocId ||
      externalGame.gameStatsDocId
  )

  if (!gameStatsDocId) {
    throw new Error('[deletePrivatePlayerGameStatsDoc] missing gameStatsDocId')
  }

  return gameStatsDocId
}

function assertPrivateDocOwnership({
  currentGameStats,
  gameId,
  playerId,
}) {
  const meta = currentGameStats.meta || {}
  const docGameId = clean(currentGameStats.gameId)
  const docPlayerId = clean(currentGameStats.playerId || meta.playerId)

  if (docGameId && docGameId !== gameId) {
    throw new Error('[deletePrivatePlayerGameStatsDoc] gameId does not match stats doc')
  }

  if (docPlayerId && docPlayerId !== playerId) {
    throw new Error('[deletePrivatePlayerGameStatsDoc] playerId does not match stats doc')
  }
}

function buildNextPrivatePlayersStatsList({
  privatePlayersStatsDoc,
  playerId,
  gameId,
  prevRow,
  now,
}) {
  const currentPrivateStats = findListItem(privatePlayersStatsDoc.list, playerId)

  if (!currentPrivateStats || !prevRow) {
    return privatePlayersStatsDoc.list
  }

  const delta = buildStatsDelta(prevRow, {})

  return updateExistingListItem(
    privatePlayersStatsDoc.list,
    playerId,
    buildDeletedPrivatePlayerAggregate({
      current: currentPrivateStats,
      playerId,
      gameId,
      delta,
      now,
    })
  )
}

function buildDryRunSummary({ data, gameId, playerId }) {
  return {
    dryRun: true,
    ids: {
      gameId,
      playerId,
      gameStatsDocId: clean(data.gameStatsDocId || data.statsDocId) || null,
    },
    note: 'dryRun only',
  }
}

function buildDeleteSummary({
  gameId,
  playerId,
  gameStatsDocId,
  prevPlayerStats,
  prevRow,
}) {
  return {
    ok: true,
    ids: {
      gameId,
      playerId,
      gameStatsDocId,
    },
    summary: {
      status: 'deleted',
      playersCount: prevPlayerStats.length,
      removedPlayerStats: prevRow,
    },
  }
}

function writePrivateDeleteTransaction({
  tx,
  refs,
  docs,
  gameStatsRef,
  nextExternalGameInfoList,
  nextPrivatePlayersStatsList,
  now,
}) {
  tx.delete(gameStatsRef)

  tx.set(
    refs.externalGameInfoRef,
    buildShortsDocPayload({
      data: docs.externalGameInfoDoc.data,
      meta: refs.externalGameInfoMeta,
      docName: 'gameInfo',
      list: nextExternalGameInfoList,
      now,
    }),
    { merge: true }
  )

  tx.set(
    refs.privatePlayersStatsRef,
    buildShortsDocPayload({
      data: docs.privatePlayersStatsDoc.data,
      meta: refs.privatePlayersStatsMeta,
      docName: 'privatePlayersStats',
      list: nextPrivatePlayersStatsList,
      now,
    }),
    { merge: true }
  )
}

export async function deletePrivatePlayerGameStatsDoc({
  payload,
  draft,
  dryRun = false,
} = {}) {
  const data = resolvePayload({ payload, draft })

  ensurePayload(data)

  const gameId = clean(data.gameId)
  const playerId = resolvePlayerId(data)

  if (!gameId) throw new Error('[deletePrivatePlayerGameStatsDoc] missing gameId')
  if (!playerId) throw new Error('[deletePrivatePlayerGameStatsDoc] missing playerId')

  const now = Timestamp.now()
  const refs = buildRefs()

  if (dryRun) {
    return buildDryRunSummary({ data, gameId, playerId })
  }

  return runTransaction(db, async tx => {
    const externalGameInfoDoc = await readShortListDoc(
      tx,
      refs.externalGameInfoRef
    )

    const privatePlayersStatsDoc = await readShortListDoc(
      tx,
      refs.privatePlayersStatsRef
    )

    const externalGame = findListItem(externalGameInfoDoc.list, gameId)

    if (!externalGame) {
      throw new Error(`[deletePrivatePlayerGameStatsDoc] external game not found: ${gameId}`)
    }

    const gameStatsDocId = resolveGameStatsDocId({
      payload: data,
      externalGame,
    })

    const gameStatsRef = doc(gameStatsShortsRef, gameStatsDocId)
    const gameStatsSnap = await tx.get(gameStatsRef)

    if (!gameStatsSnap.exists()) {
      throw new Error(`[deletePrivatePlayerGameStatsDoc] gameStats doc not found: ${gameStatsDocId}`)
    }

    const currentGameStats = gameStatsSnap.data() || {}

    assertPrivateDocOwnership({
      currentGameStats,
      gameId,
      playerId,
    })

    const context = buildRollbackContext({
      currentGameStats,
      externalGame,
      gameId,
      gameStatsDocId,
    })

    const prevPlayerStats = normalizeGamePlayerStatsList(
      currentGameStats.playerStats || [],
      context
    )

    const prevByPlayerId = indexPlayerStatsByPlayerId(prevPlayerStats)
    const prevRow = prevByPlayerId.get(playerId) || null

    const nextPrivatePlayersStatsList = buildNextPrivatePlayersStatsList({
      privatePlayersStatsDoc,
      playerId,
      gameId,
      prevRow,
      now,
    })

    const nextExternalGameInfoList = updateExistingListItem(
      externalGameInfoDoc.list,
      gameId,
      buildDeletedExternalGameInfoItem({
        current: externalGame,
        now,
      })
    )

    writePrivateDeleteTransaction({
      tx,
      refs,
      docs: {
        externalGameInfoDoc,
        privatePlayersStatsDoc,
      },
      gameStatsRef,
      nextExternalGameInfoList,
      nextPrivatePlayersStatsList,
      now,
    })

    return buildDeleteSummary({
      gameId,
      playerId,
      gameStatsDocId,
      prevPlayerStats,
      prevRow,
    })
  })
}

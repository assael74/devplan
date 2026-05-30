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

const clean = value => String(value ?? '').trim()

const toNum = value => {
  const num = Number(value)
  return Number.isFinite(num) ? num : 0
}

const safeArr = value => {
  return Array.isArray(value) ? value : []
}

const buildShortDocRef = meta => {
  return doc(db, meta.collection, meta.docId)
}

const readShortListDoc = async (tx, ref) => {
  const snap = await tx.get(ref)
  const data = snap.exists() ? snap.data() || {} : {}
  const list = Array.isArray(data.list) ? data.list : []

  return { data, list }
}

const findListItem = (list = [], id) => {
  return safeArr(list).find(item => item?.id === id) || null
}

const updateExistingListItem = (list = [], id, nextItem) => {
  const rows = safeArr(list)
  const idx = rows.findIndex(item => item?.id === id)

  if (idx < 0) return rows

  return rows.map((item, index) => {
    return index === idx ? nextItem : item
  })
}

const buildShortsDocPayload = ({ data, meta, docName, list, now }) => {
  return {
    ...data,
    docId: data?.docId || meta?.docId,
    docName: data?.docName || docName,
    list,
    updatedAt: now,
    createdAt: data?.createdAt ?? now,
  }
}

const clampMinZero = value => {
  return Math.max(0, toNum(value))
}

const isEmptyAggregateValue = value => {
  if (value === null || value === undefined || value === '') return true
  if (Array.isArray(value) && !value.length) return true

  const num = Number(value)
  return Number.isFinite(num) && num === 0
}

const keepAggregateMetaKey = key => {
  return [
    'id',
    'playerId',
    'createdAt',
    'updatedAt',
  ].includes(key)
}

const compactAggregate = item => {
  return Object.entries(item || {}).reduce((acc, [key, value]) => {
    if (keepAggregateMetaKey(key)) {
      return {
        ...acc,
        [key]: value,
      }
    }

    if (isEmptyAggregateValue(value)) return acc

    return {
      ...acc,
      [key]: value,
    }
  }, {})
}

const buildDeletedExternalGameInfoItem = ({ current, now }) => {
  const {
    statsStatus,
    statsDocId,
    gameStatsDocId,
    statsUpdatedAt,
    ...base
  } = current || {}

  return {
    ...base,
    hasStats: false,
    statsDeletedAt: now,
  }
}

const buildRollbackContext = ({ currentGameStats, externalGame, gameId, gameStatsDocId }) => {
  const firstRow = safeArr(currentGameStats?.playerStats)[0] || {}
  const gameDuration = toNum(externalGame?.gameDuration || firstRow?.timePlayed || 80)

  return {
    gameId,
    teamId: '',
    gameStatsDocId,
    gameDuration,
    timePlayed: toNum(firstRow?.timePlayed) || gameDuration,
    timeVideoStats:
      toNum(firstRow?.timeVideoStats) ||
      toNum(firstRow?.timePlayed) ||
      gameDuration,
  }
}

const buildDeletedPrivatePlayerAggregate = ({ current, playerId, gameId, delta, now }) => {
  let next = {
    ...(current || {}),
    id: playerId,
    playerId,
    updatedAt: now,
    createdAt: current?.createdAt ?? now,
  }

  next = applyStatsDelta(next, delta)

  next.gamesWithStats = clampMinZero((current?.gamesWithStats || 0) - 1)
  next.statsGameRefs = removeStatsGameRef(current?.statsGameRefs, gameId)

  return compactAggregate(applyStatsRates(next))
}

const resolveGameStatsDocId = ({ payload, externalGame }) => {
  const gameStatsDocId = clean(
    payload?.gameStatsDocId ||
      payload?.statsDocId ||
      externalGame?.statsDocId ||
      externalGame?.gameStatsDocId
  )

  if (!gameStatsDocId) {
    throw new Error('[deletePrivatePlayerGameStatsDoc] missing gameStatsDocId')
  }

  return gameStatsDocId
}

export async function deletePrivatePlayerGameStatsDoc({
  payload,
  draft,
  dryRun = false,
} = {}) {
  const data = payload || draft

  if (!data || typeof data !== 'object') {
    throw new Error('[deletePrivatePlayerGameStatsDoc] payload is required')
  }

  const gameId = clean(data.gameId)
  const playerId = clean(data?.meta?.playerId || data?.playerId || data?.editablePlayerId)

  if (!gameId) throw new Error('[deletePrivatePlayerGameStatsDoc] missing gameId')
  if (!playerId) throw new Error('[deletePrivatePlayerGameStatsDoc] missing playerId')

  const now = Timestamp.now()

  const externalGameInfoMeta = shortsRefs.externalGames.gameInfo
  const privatePlayersStatsMeta = shortsRefs.privates.privatePlayersStats

  const externalGameInfoRef = buildShortDocRef(externalGameInfoMeta)
  const privatePlayersStatsRef = buildShortDocRef(privatePlayersStatsMeta)

  if (dryRun) {
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

  return runTransaction(db, async tx => {
    const externalGameInfoDoc = await readShortListDoc(tx, externalGameInfoRef)
    const privatePlayersStatsDoc = await readShortListDoc(tx, privatePlayersStatsRef)

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

    const docGameId = clean(currentGameStats?.gameId)
    const docPlayerId = clean(currentGameStats?.playerId || currentGameStats?.meta?.playerId)

    if (docGameId && docGameId !== gameId) {
      throw new Error('[deletePrivatePlayerGameStatsDoc] gameId does not match stats doc')
    }

    if (docPlayerId && docPlayerId !== playerId) {
      throw new Error('[deletePrivatePlayerGameStatsDoc] playerId does not match stats doc')
    }

    const context = buildRollbackContext({
      currentGameStats,
      externalGame,
      gameId,
      gameStatsDocId,
    })

    const prevPlayerStats = normalizeGamePlayerStatsList(
      currentGameStats?.playerStats || [],
      context
    )

    const prevByPlayerId = indexPlayerStatsByPlayerId(prevPlayerStats)
    const prevRow = prevByPlayerId.get(playerId) || null

    const currentPrivateStats = findListItem(privatePlayersStatsDoc.list, playerId)
    let nextPrivatePlayersStatsList = privatePlayersStatsDoc.list

    if (currentPrivateStats && prevRow) {
      const delta = buildStatsDelta(prevRow, {})

      nextPrivatePlayersStatsList = updateExistingListItem(
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

    const nextExternalGameInfoList = updateExistingListItem(
      externalGameInfoDoc.list,
      gameId,
      buildDeletedExternalGameInfoItem({
        current: externalGame,
        now,
      })
    )

    tx.delete(gameStatsRef)

    tx.set(
      externalGameInfoRef,
      buildShortsDocPayload({
        data: externalGameInfoDoc.data,
        meta: externalGameInfoMeta,
        docName: 'gameInfo',
        list: nextExternalGameInfoList,
        now,
      }),
      { merge: true }
    )

    tx.set(
      privatePlayersStatsRef,
      buildShortsDocPayload({
        data: privatePlayersStatsDoc.data,
        meta: privatePlayersStatsMeta,
        docName: 'privatePlayersStats',
        list: nextPrivatePlayersStatsList,
        now,
      }),
      { merge: true }
    )

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
  })
}

// src/services/firestore/shorts/gameStats/privatePlayerGameStatsSave.js

import { doc, runTransaction, Timestamp } from 'firebase/firestore'

import { db } from '../../../firebase/firebase.js'
import { gameStatsShortsRef } from '../../shortsCollections.js'
import { shortsRefs } from '../shorts.refs.js'

import {
  applyStatsDelta,
  applyStatsRates,
  buildStatsDelta,
  buildStatsGameRef,
  indexPlayerStatsByPlayerId,
  normalizeGamePlayerStatsList,
  upsertStatsGameRef,
} from '../../../../shared/stats/engine/index.js'

const STATS_SOURCE = 'privatePlayerGameStatsSaveV1'

const clean = value => String(value ?? '').trim()

const toNum = value => {
  const num = Number(value)
  return Number.isFinite(num) ? num : 0
}

const safeArr = value => {
  return Array.isArray(value) ? value : []
}

const compactDoc = value => {
  if (Array.isArray(value)) {
    return value
      .map(item => compactDoc(item))
      .filter(item => item !== undefined)
  }

  if (!value || typeof value !== 'object') {
    if (value === null || value === undefined || value === '') return undefined
    return value
  }

  const next = Object.entries(value).reduce((acc, [key, item]) => {
    const cleanItem = compactDoc(item)

    if (cleanItem === undefined) return acc

    return {
      ...acc,
      [key]: cleanItem,
    }
  }, {})

  return Object.keys(next).length ? next : undefined
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

const upsertListItem = (list = [], id, nextItem) => {
  const rows = safeArr(list)
  const idx = rows.findIndex(item => item?.id === id)

  if (idx < 0) return [...rows, nextItem]

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

const getPayloadNumber = ({ payload, key, fallback = 0 }) => {
  const value = payload?.meta[key] ?? payload[key] ?? fallback
  const num = Number(value)

  return Number.isFinite(num) ? num : fallback
}

const getPayloadPlayerRow = payload => {
  const rows = safeArr(payload?.playerStats)

  if (rows.length !== 1) {
    throw new Error('[savePrivatePlayerGameStatsDoc] expected exactly one playerStats row')
  }

  const row = rows[0]
  const playerId = clean(row?.playerId || row?.id || payload?.meta?.playerId)

  if (!playerId) {
    throw new Error('[savePrivatePlayerGameStatsDoc] missing playerId')
  }

  return {
    ...row,
    playerId,
  }
}

const buildNextPlayerStats = ({ currentRows, nextRow }) => {
  const playerId = clean(nextRow?.playerId || nextRow?.id)
  const rows = safeArr(currentRows)
  const idx = rows.findIndex(row => clean(row?.playerId || row?.id) === playerId)

  if (idx < 0) return [...rows, nextRow]

  return rows.map((row, index) => {
    return index === idx
      ? { ...row, ...nextRow, playerId }
      : row
  })
}

const buildNextExternalGameInfoItem = ({ current, gameStatsDocId, status, now }) => {
  return {
    ...(current || {}),
    hasStats: true,
    statsStatus: status,
    statsDocId: gameStatsDocId,
    gameStatsDocId,
    statsUpdatedAt: now,
  }
}

const clampMinZero = value => {
  return Math.max(0, toNum(value))
}

const buildNextPrivatePlayerAggregate = ({
  current,
  playerId,
  gameId,
  gameRef,
  delta,
  prevRow,
  nextRow,
  now,
}) => {
  const hadPrev = Boolean(prevRow)
  const hasNext = Boolean(nextRow)

  let next = {
    ...(current || {}),
    id: playerId,
    playerId,
    updatedAt: now,
    createdAt: current?.createdAt ?? now,
  }

  next = applyStatsDelta(next, delta)

  if (!hadPrev && hasNext) {
    next.gamesWithStats = clampMinZero((current?.gamesWithStats || 0) + 1)
  }

  if (hadPrev && hasNext) {
    next.gamesWithStats = clampMinZero(current?.gamesWithStats || 0)
  }

  next.statsGameRefs = upsertStatsGameRef(current?.statsGameRefs, gameRef)

  return applyStatsRates(next)
}

const buildNextGameStatsDoc = ({
  current,
  gameStatsDocId,
  gameId,
  playerId,
  playerStats,
  status,
  now,
}) => {
  return compactDoc({
    ...(current || {}),

    id: gameStatsDocId,
    docId: gameStatsDocId,

    gameId,
    playerId,
    teamId: '',
    source: 'privatePlayerProfile',
    statsScope: 'privatePlayer',

    playerStats,
    teamStats: {},
    status,
    aggregateStatus: 'synced',

    updatedFrom: STATS_SOURCE,
    updatedAt: now,
    createdAt: current?.createdAt ?? now,
    committedAt: status === 'committed'
      ? current?.committedAt ?? now
      : current?.committedAt,
  })
}

export async function savePrivatePlayerGameStatsDoc({ payload, dryRun = false } = {}) {
  if (!payload || typeof payload !== 'object') {
    throw new Error('[savePrivatePlayerGameStatsDoc] payload is required')
  }

  const gameId = clean(payload.gameId)
  const status = clean(payload.status) || 'partial'
  const playerRow = getPayloadPlayerRow(payload)
  const playerId = clean(playerRow.playerId || payload?.meta?.playerId)

  if (!gameId) throw new Error('[savePrivatePlayerGameStatsDoc] missing gameId')
  if (!playerId) throw new Error('[savePrivatePlayerGameStatsDoc] missing playerId')

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
        gameStatsDocId: clean(payload.gameStatsDocId || payload.statsDocId) || null,
      },
      note: 'dryRun only',
    }
  }

  return runTransaction(db, async tx => {
    const externalGameInfoDoc = await readShortListDoc(tx, externalGameInfoRef)
    const privatePlayersStatsDoc = await readShortListDoc(tx, privatePlayersStatsRef)

    const externalGame = findListItem(externalGameInfoDoc.list, gameId)

    if (!externalGame) {
      throw new Error(`[savePrivatePlayerGameStatsDoc] external game not found: ${gameId}`)
    }

    const existingGameStatsDocId = clean(
      payload.gameStatsDocId ||
        payload.statsDocId ||
        externalGame.statsDocId ||
        externalGame.gameStatsDocId
    )

    const gameStatsRef = existingGameStatsDocId
      ? doc(gameStatsShortsRef, existingGameStatsDocId)
      : doc(gameStatsShortsRef)

    const gameStatsDocId = existingGameStatsDocId || gameStatsRef.id
    const gameStatsSnap = existingGameStatsDocId ? await tx.get(gameStatsRef) : null
    const currentGameStats = gameStatsSnap?.exists() ? gameStatsSnap.data() || {} : {}

    const gameDuration = toNum(externalGame?.gameDuration || payload?.gameDuration || 80)

    const context = {
      gameId,
      teamId: '',
      gameDuration,
      timePlayed: getPayloadNumber({
        payload,
        key: 'timePlayed',
        fallback: toNum(playerRow?.timePlayed) || gameDuration,
      }),
      timeVideoStats: getPayloadNumber({
        payload,
        key: 'timeVideoStats',
        fallback: toNum(playerRow?.timeVideoStats) || toNum(playerRow?.timePlayed) || gameDuration,
      }),
    }

    const prevPlayerStats = normalizeGamePlayerStatsList(
      currentGameStats?.playerStats || [],
      context
    )

    const nextRawPlayerStats = buildNextPlayerStats({
      currentRows: currentGameStats?.playerStats || [],
      nextRow: {
        ...playerRow,
        gameId,
        teamId: '',
        gameStatsDocId,
      },
    })

    const nextPlayerStats = normalizeGamePlayerStatsList(
      nextRawPlayerStats,
      context
    )

    const prevByPlayerId = indexPlayerStatsByPlayerId(prevPlayerStats)
    const nextByPlayerId = indexPlayerStatsByPlayerId(nextPlayerStats)

    const prevRow = prevByPlayerId.get(playerId) || null
    const nextRow = nextByPlayerId.get(playerId) || null
    const delta = buildStatsDelta(prevRow, nextRow)

    const gameRef = buildStatsGameRef({
      gameId,
      gameStatsDocId,
      teamId: '',
      gameDate: externalGame?.gameDate || payload?.gameDate || '',
      status,
    })

    const currentPrivateStats = findListItem(privatePlayersStatsDoc.list, playerId)

    const nextPrivateStatsItem = buildNextPrivatePlayerAggregate({
      current: currentPrivateStats,
      playerId,
      gameId,
      gameRef,
      delta,
      prevRow,
      nextRow,
      now,
    })

    const nextPrivatePlayersStatsList = upsertListItem(
      privatePlayersStatsDoc.list,
      playerId,
      nextPrivateStatsItem
    )

    const nextExternalGameInfoList = upsertListItem(
      externalGameInfoDoc.list,
      gameId,
      buildNextExternalGameInfoItem({
        current: externalGame,
        gameStatsDocId,
        status,
        now,
      })
    )

    const nextGameStatsDoc = buildNextGameStatsDoc({
      current: currentGameStats,
      gameStatsDocId,
      gameId,
      playerId,
      playerStats: nextPlayerStats,
      status,
      now,
    })

    tx.set(gameStatsRef, nextGameStatsDoc, { merge: true })

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
        status,
        prevPlayersCount: prevPlayerStats.length,
        nextPlayersCount: nextPlayerStats.length,
        privatePlayerStats: nextPrivateStatsItem,
      },
    }
  })
}

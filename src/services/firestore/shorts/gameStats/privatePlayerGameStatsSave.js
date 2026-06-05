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

import {
  buildShortDocRef,
  buildShortsDocPayload,
  clampMinZero,
  clean,
  compactDoc,
  findListItem,
  getPayloadNumber,
  getRowPlayerId,
  readShortListDoc,
  safeArr,
  toNum,
  upsertListItem,
} from './shared/index.js'

const STATS_SOURCE = 'privatePlayerGameStatsSaveV1'

function ensurePayload(payload) {
  if (!payload || typeof payload !== 'object') {
    throw new Error('[savePrivatePlayerGameStatsDoc] payload is required')
  }
}

function getPayloadPlayerRow(payload) {
  const rows = safeArr(payload.playerStats)

  if (rows.length !== 1) {
    throw new Error('[savePrivatePlayerGameStatsDoc] expected exactly one playerStats row')
  }

  const row = rows[0]
  const meta = payload.meta || {}
  const playerId = clean(row.playerId || row.id || meta.playerId)

  if (!playerId) {
    throw new Error('[savePrivatePlayerGameStatsDoc] missing playerId')
  }

  return {
    ...row,
    playerId,
  }
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

function buildNextPlayerStats({ currentRows, nextRow }) {
  const playerId = getRowPlayerId(nextRow)
  const rows = safeArr(currentRows)
  const idx = rows.findIndex(row => getRowPlayerId(row) === playerId)

  if (idx < 0) return [...rows, nextRow]

  return rows.map((row, index) => {
    if (index !== idx) return row

    return {
      ...row,
      ...nextRow,
      playerId,
    }
  })
}

function buildNextExternalGameInfoItem({ current, gameStatsDocId, status, now }) {
  return {
    ...current,
    hasStats: true,
    statsStatus: status,
    statsDocId: gameStatsDocId,
    gameStatsDocId,
    statsUpdatedAt: now,
  }
}

function buildNextPrivatePlayerAggregate({
  current,
  playerId,
  gameId,
  gameRef,
  delta,
  prevRow,
  nextRow,
  now,
}) {
  const hadPrev = Boolean(prevRow)
  const hasNext = Boolean(nextRow)

  let next = {
    ...current,
    id: playerId,
    playerId,
    updatedAt: now,
    createdAt: current && current.createdAt ? current.createdAt : now,
  }

  next = applyStatsDelta(next, delta)

  if (!hadPrev && hasNext) {
    next.gamesWithStats = clampMinZero((current && current.gamesWithStats || 0) + 1)
  }

  if (hadPrev && hasNext) {
    next.gamesWithStats = clampMinZero(current && current.gamesWithStats || 0)
  }

  next.statsGameRefs = upsertStatsGameRef(current && current.statsGameRefs, gameRef)

  return applyStatsRates(next)
}

function buildNextGameStatsDoc({
  current,
  gameStatsDocId,
  gameId,
  playerId,
  playerStats,
  status,
  now,
}) {
  return compactDoc({
    ...current,

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
    createdAt: current && current.createdAt ? current.createdAt : now,
    committedAt: resolveCommittedAt({ current, status, now }),
  })
}

function resolveCommittedAt({ current, status, now }) {
  if (status !== 'committed') {
    return current && current.committedAt
      ? current.committedAt
      : undefined
  }

  if (current && current.committedAt) return current.committedAt

  return now
}

function buildPrivateContext({ payload, externalGame, playerRow, gameId }) {
  const gameDuration = toNum(externalGame.gameDuration || payload.gameDuration || 80)

  return {
    gameId,
    teamId: '',
    gameDuration,
    timePlayed: getPayloadNumber({
      payload,
      key: 'timePlayed',
      fallback: toNum(playerRow.timePlayed) || gameDuration,
    }),
    timeVideoStats: getPayloadNumber({
      payload,
      key: 'timeVideoStats',
      fallback: toNum(playerRow.timeVideoStats) || toNum(playerRow.timePlayed) || gameDuration,
    }),
  }
}

function buildGameRef({ gameId, gameStatsDocId, externalGame, payload, status }) {
  return buildStatsGameRef({
    gameId,
    gameStatsDocId,
    teamId: '',
    gameDate: externalGame.gameDate || payload.gameDate || '',
    status,
  })
}

function buildDryRunSummary({ payload, gameId, playerId }) {
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

function buildSaveSummary({
  gameId,
  playerId,
  gameStatsDocId,
  status,
  prevPlayerStats,
  nextPlayerStats,
  nextPrivateStatsItem,
}) {
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
}

function resolveExistingGameStatsDocId({ payload, externalGame }) {
  return clean(
    payload.gameStatsDocId ||
      payload.statsDocId ||
      externalGame.statsDocId ||
      externalGame.gameStatsDocId
  )
}

function writePrivateSaveTransaction({
  tx,
  refs,
  docs,
  gameStatsRef,
  nextGameStatsDoc,
  nextExternalGameInfoList,
  nextPrivatePlayersStatsList,
  now,
}) {
  tx.set(gameStatsRef, nextGameStatsDoc, { merge: true })

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

export async function savePrivatePlayerGameStatsDoc({ payload, dryRun = false } = {}) {
  ensurePayload(payload)

  const gameId = clean(payload.gameId)
  const status = clean(payload.status) || 'partial'
  const playerRow = getPayloadPlayerRow(payload)
  const meta = payload.meta || {}
  const playerId = clean(playerRow.playerId || meta.playerId)

  if (!gameId) throw new Error('[savePrivatePlayerGameStatsDoc] missing gameId')
  if (!playerId) throw new Error('[savePrivatePlayerGameStatsDoc] missing playerId')

  const now = Timestamp.now()
  const refs = buildRefs()

  if (dryRun) {
    return buildDryRunSummary({ payload, gameId, playerId })
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
      throw new Error(`[savePrivatePlayerGameStatsDoc] external game not found: ${gameId}`)
    }

    const existingGameStatsDocId = resolveExistingGameStatsDocId({
      payload,
      externalGame,
    })

    const gameStatsRef = existingGameStatsDocId
      ? doc(gameStatsShortsRef, existingGameStatsDocId)
      : doc(gameStatsShortsRef)

    const gameStatsDocId = existingGameStatsDocId || gameStatsRef.id
    const gameStatsSnap = existingGameStatsDocId ? await tx.get(gameStatsRef) : null
    const currentGameStats = gameStatsSnap && gameStatsSnap.exists()
      ? gameStatsSnap.data() || {}
      : {}

    const context = buildPrivateContext({
      payload,
      externalGame,
      playerRow,
      gameId,
    })

    const prevPlayerStats = normalizeGamePlayerStatsList(
      currentGameStats.playerStats || [],
      context
    )

    const nextRawPlayerStats = buildNextPlayerStats({
      currentRows: currentGameStats.playerStats || [],
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

    const gameRef = buildGameRef({
      gameId,
      gameStatsDocId,
      externalGame,
      payload,
      status,
    })

    const currentPrivateStats = findListItem(
      privatePlayersStatsDoc.list,
      playerId
    )

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

    writePrivateSaveTransaction({
      tx,
      refs,
      docs: {
        externalGameInfoDoc,
        privatePlayersStatsDoc,
      },
      gameStatsRef,
      nextGameStatsDoc,
      nextExternalGameInfoList,
      nextPrivatePlayersStatsList,
      now,
    })

    return buildSaveSummary({
      gameId,
      playerId,
      gameStatsDocId,
      status,
      prevPlayerStats,
      nextPlayerStats,
      nextPrivateStatsItem,
    })
  })
}

// src/services/firestore/shorts/gameStats/gameStatsDelete.js

import { doc, runTransaction, Timestamp } from 'firebase/firestore'

import { db } from '../../../firebase/firebase.js'
import { gameStatsShortsRef } from '../../shortsCollections.js'
import { shortsRefs } from '../shorts.refs.js'

import {
  applyStatsDelta,
  applyStatsRates,
  buildGameTeamStats,
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
  toNum,
  updateExistingListItem,
} from './shared/index.js'

const AGGREGATE_META_KEYS = [
  'id',
  'playerId',
  'teamId',
  'createdAt',
  'updatedAt',
]

function ensurePayload(payload) {
  if (!payload || typeof payload !== 'object') {
    throw new Error('[deleteGameStatsDoc] payload is required')
  }

  if (!clean(payload.gameId) && !clean(payload.gameStatsDocId)) {
    throw new Error('[deleteGameStatsDoc] missing gameId or gameStatsDocId')
  }
}

function buildRefs() {
  const gameInfoMeta = shortsRefs.games.gameInfo
  const playersStatsMeta = shortsRefs.players.playersStats
  const teamsStatsMeta = shortsRefs.teams.teamsStats

  return {
    gameInfoMeta,
    playersStatsMeta,
    teamsStatsMeta,
    gameInfoRef: buildShortDocRef(gameInfoMeta),
    playersStatsRef: buildShortDocRef(playersStatsMeta),
    teamsStatsRef: buildShortDocRef(teamsStatsMeta),
  }
}

function resolveGameStatsDocId({ payload, game }) {
  const fromPayload = clean(payload.gameStatsDocId || payload.statsDocId)
  const fromGame = clean(game && (game.statsDocId || game.gameStatsDocId))
  const gameStatsDocId = fromPayload || fromGame

  if (!gameStatsDocId) {
    throw new Error('[deleteGameStatsDoc] missing gameStatsDocId')
  }

  return gameStatsDocId
}

function assertDocOwnership({
  payload,
  game,
  currentGameStats,
  gameId,
  teamId,
  gameStatsDocId,
}) {
  const payloadGameId = clean(payload.gameId)
  const payloadTeamId = clean(payload.teamId)
  const docGameId = clean(currentGameStats.gameId)
  const docTeamId = clean(currentGameStats.teamId)
  const gameStatsDocIdFromGame = clean(game.statsDocId || game.gameStatsDocId)

  if (payloadGameId && docGameId && payloadGameId !== docGameId) {
    throw new Error('[deleteGameStatsDoc] payload gameId does not match stats doc')
  }

  if (payloadTeamId && docTeamId && payloadTeamId !== docTeamId) {
    throw new Error('[deleteGameStatsDoc] payload teamId does not match stats doc')
  }

  if (docGameId && gameId !== docGameId) {
    throw new Error('[deleteGameStatsDoc] resolved gameId does not match stats doc')
  }

  if (docTeamId && teamId !== docTeamId) {
    throw new Error('[deleteGameStatsDoc] resolved teamId does not match stats doc')
  }

  if (gameStatsDocIdFromGame && gameStatsDocIdFromGame !== gameStatsDocId) {
    throw new Error('[deleteGameStatsDoc] game points to a different stats doc')
  }
}

function buildDeletedGameInfoItem({ current, now }) {
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

function compactAggregate(item) {
  return compactAggregateByKeys({
    item,
    keepKeys: AGGREGATE_META_KEYS,
  })
}

function buildDeletedPlayerAggregate({
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

  return compactAggregate(applyStatsRates(next))
}

function buildDeletedTeamAggregate({
  current,
  teamId,
  gameId,
  delta,
  playersCount,
  now,
}) {
  let next = {
    ...current,
    id: teamId,
    teamId,
    updatedAt: now,
    createdAt: current && current.createdAt ? current.createdAt : now,
  }

  next = applyStatsDelta(next, delta)

  next.gamesWithStats = clampMinZero((current && current.gamesWithStats || 0) - 1)
  next.playersWithStats = clampMinZero(
    (current && current.playersWithStats || 0) - playersCount
  )
  next.statsGameRefs = removeStatsGameRef(current && current.statsGameRefs, gameId)

  return compactAggregate(applyStatsRates(next))
}

function buildRollbackContext({ currentGameStats, resolvedGame, gameId, teamId, gameStatsDocId }) {
  const savedTeamStats = currentGameStats.teamStats || {}
  const gameDuration = toNum(savedTeamStats.timePlayed) || toNum(resolvedGame.gameDuration)

  return {
    gameId,
    teamId,
    gameStatsDocId,
    gameDuration,
    timePlayed: toNum(savedTeamStats.timePlayed) || gameDuration,
    timeVideoStats:
      toNum(savedTeamStats.timeVideoStats) ||
      toNum(savedTeamStats.timePlayed) ||
      gameDuration,
  }
}

function buildNextPlayersStatsList({ playersStatsDoc, prevByPlayerId, gameId, now }) {
  let nextPlayersStatsList = playersStatsDoc.list

  for (const [playerId, prevRow] of prevByPlayerId.entries()) {
    const current = findListItem(nextPlayersStatsList, playerId)

    if (!current) continue

    const delta = buildStatsDelta(prevRow, {})

    const nextItem = buildDeletedPlayerAggregate({
      current,
      playerId,
      gameId,
      delta,
      now,
    })

    nextPlayersStatsList = updateExistingListItem(
      nextPlayersStatsList,
      playerId,
      nextItem
    )
  }

  return nextPlayersStatsList
}

function buildNextTeamsStatsList({
  teamsStatsDoc,
  teamId,
  gameId,
  prevTeamStats,
  now,
}) {
  const teamDelta = buildStatsDelta(prevTeamStats, {})
  const currentTeamStats = findListItem(teamsStatsDoc.list, teamId)

  if (!currentTeamStats) return teamsStatsDoc.list

  return updateExistingListItem(
    teamsStatsDoc.list,
    teamId,
    buildDeletedTeamAggregate({
      current: currentTeamStats,
      teamId,
      gameId,
      delta: teamDelta,
      playersCount: prevTeamStats.playersCount || 0,
      now,
    })
  )
}

function buildDryRunSummary({ data, gameId }) {
  return {
    dryRun: true,
    ids: {
      gameId: gameId || null,
      gameStatsDocId: clean(data.gameStatsDocId || data.statsDocId) || null,
    },
    note: 'dryRun only',
  }
}

function buildDeleteSummary({
  gameId,
  teamId,
  gameStatsDocId,
  prevPlayerStats,
  prevTeamStats,
}) {
  return {
    ok: true,
    ids: {
      gameId,
      teamId,
      gameStatsDocId,
    },
    summary: {
      status: 'deleted',
      playersCount: prevPlayerStats.length,
      teamStatsRemoved: prevTeamStats,
    },
  }
}

function writeDeleteTransaction({
  tx,
  refs,
  docs,
  gameStatsRef,
  nextGameInfoList,
  nextPlayersStatsList,
  nextTeamsStatsList,
  now,
}) {
  tx.delete(gameStatsRef)

  tx.set(
    refs.gameInfoRef,
    buildShortsDocPayload({
      data: docs.gameInfoDoc.data,
      meta: refs.gameInfoMeta,
      docName: 'gameInfo',
      list: nextGameInfoList,
      now,
    }),
    { merge: true }
  )

  tx.set(
    refs.playersStatsRef,
    buildShortsDocPayload({
      data: docs.playersStatsDoc.data,
      meta: refs.playersStatsMeta,
      docName: 'playersStats',
      list: nextPlayersStatsList,
      now,
    }),
    { merge: true }
  )

  tx.set(
    refs.teamsStatsRef,
    buildShortsDocPayload({
      data: docs.teamsStatsDoc.data,
      meta: refs.teamsStatsMeta,
      docName: 'teamsStats',
      list: nextTeamsStatsList,
      now,
    }),
    { merge: true }
  )
}

export async function deleteGameStatsDoc({ payload, draft, dryRun = false } = {}) {
  const data = resolvePayload({ payload, draft })

  ensurePayload(data)

  const draftGameId = clean(data.gameId)
  const now = Timestamp.now()
  const refs = buildRefs()

  if (dryRun) {
    return buildDryRunSummary({ data, gameId: draftGameId })
  }

  return runTransaction(db, async tx => {
    const gameInfoDoc = await readShortListDoc(tx, refs.gameInfoRef)
    const playersStatsDoc = await readShortListDoc(tx, refs.playersStatsRef)
    const teamsStatsDoc = await readShortListDoc(tx, refs.teamsStatsRef)

    const game = draftGameId
      ? findListItem(gameInfoDoc.list, draftGameId)
      : null

    const gameStatsDocId = resolveGameStatsDocId({ payload: data, game })
    const gameStatsRef = doc(gameStatsShortsRef, gameStatsDocId)
    const gameStatsSnap = await tx.get(gameStatsRef)

    if (!gameStatsSnap.exists()) {
      throw new Error(`[deleteGameStatsDoc] gameStats doc not found: ${gameStatsDocId}`)
    }

    const currentGameStats = gameStatsSnap.data() || {}

    const gameId = clean(data.gameId || currentGameStats.gameId)
    const teamId = clean(data.teamId || currentGameStats.teamId || game && game.teamId)

    if (!gameId) throw new Error('[deleteGameStatsDoc] missing resolved gameId')
    if (!teamId) throw new Error('[deleteGameStatsDoc] missing resolved teamId')

    const resolvedGame = game || findListItem(gameInfoDoc.list, gameId)

    if (!resolvedGame) {
      throw new Error(`[deleteGameStatsDoc] game not found in games.gameInfo: ${gameId}`)
    }

    assertDocOwnership({
      payload: data,
      game: resolvedGame,
      currentGameStats,
      gameId,
      teamId,
      gameStatsDocId,
    })

    const context = buildRollbackContext({
      currentGameStats,
      resolvedGame,
      gameId,
      teamId,
      gameStatsDocId,
    })

    const prevPlayerStats = normalizeGamePlayerStatsList(
      currentGameStats.playerStats || [],
      context
    )

    const prevTeamStats = buildGameTeamStats(prevPlayerStats, context)
    const prevByPlayerId = indexPlayerStatsByPlayerId(prevPlayerStats)

    const nextPlayersStatsList = buildNextPlayersStatsList({
      playersStatsDoc,
      prevByPlayerId,
      gameId,
      now,
    })

    const nextTeamsStatsList = buildNextTeamsStatsList({
      teamsStatsDoc,
      teamId,
      gameId,
      prevTeamStats,
      now,
    })

    const nextGameInfoList = updateExistingListItem(
      gameInfoDoc.list,
      gameId,
      buildDeletedGameInfoItem({
        current: resolvedGame,
        now,
      })
    )

    writeDeleteTransaction({
      tx,
      refs,
      docs: {
        gameInfoDoc,
        playersStatsDoc,
        teamsStatsDoc,
      },
      gameStatsRef,
      nextGameInfoList,
      nextPlayersStatsList,
      nextTeamsStatsList,
      now,
    })

    return buildDeleteSummary({
      gameId,
      teamId,
      gameStatsDocId,
      prevPlayerStats,
      prevTeamStats,
    })
  })
}

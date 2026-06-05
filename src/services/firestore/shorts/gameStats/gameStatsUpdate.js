// src/services/firestore/shorts/gameStats/gameStatsUpdate.js

import { doc, runTransaction, Timestamp } from 'firebase/firestore'

import { db } from '../../../firebase/firebase.js'
import { gameStatsShortsRef } from '../../shortsCollections.js'
import { shortsRefs } from '../shorts.refs.js'

import {
  applyStatsDelta,
  applyStatsRates,
  buildGameTeamStats,
  buildStatsDelta,
  buildStatsGameRef,
  getMergedPlayerIds,
  indexPlayerStatsByPlayerId,
  normalizeGamePlayerStatsList,
  removeStatsGameRef,
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
  readShortListDoc,
  resolvePayload,
  upsertListItem,
} from './shared/index.js'

const STATS_SOURCE = 'gameStatsUpdateV1'

function ensurePayload(payload) {
  if (!payload || typeof payload !== 'object') {
    throw new Error('[updateGameStatsDoc] payload is required')
  }

  if (!clean(payload.gameId) && !clean(payload.gameStatsDocId)) {
    throw new Error('[updateGameStatsDoc] missing gameId or gameStatsDocId')
  }

  if (!Array.isArray(payload.playerStats)) {
    throw new Error('[updateGameStatsDoc] playerStats must be an array')
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
  const fromPayload = clean(payload.gameStatsDocId)
  const fromGame = clean(game && game.statsDocId)
  const gameStatsDocId = fromPayload || fromGame

  if (!gameStatsDocId) {
    throw new Error('[updateGameStatsDoc] missing gameStatsDocId')
  }

  return gameStatsDocId
}

function buildNextGameInfoItem({ current, gameStatsDocId, status, now }) {
  return {
    ...current,
    hasStats: true,
    statsStatus: status,
    statsDocId: gameStatsDocId,
    statsUpdatedAt: now,
  }
}

function buildUpdateContext({ data, gameId, teamId, game }) {
  const gameDuration = game.gameDuration || data.gameDuration || 0

  return {
    gameId,
    teamId,
    gameDuration,
    timePlayed: getPayloadNumber({
      payload: data,
      key: 'timePlayed',
      fallback: gameDuration,
    }),
    timeVideoStats: getPayloadNumber({
      payload: data,
      key: 'timeVideoStats',
      fallback: data.teamVideoTime || gameDuration,
    }),
  }
}

function buildNextPlayerAggregate({
  current,
  playerId,
  teamId,
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
    teamId: resolvePlayerAggregateTeamId({ current, nextRow, teamId }),
    updatedAt: now,
    createdAt: current && current.createdAt ? current.createdAt : now,
  }

  next = applyStatsDelta(next, delta)

  if (!hadPrev && hasNext) {
    next.gamesWithStats = clampMinZero((current && current.gamesWithStats || 0) + 1)
    next.statsGameRefs = upsertStatsGameRef(current && current.statsGameRefs, gameRef)
  }

  if (hadPrev && !hasNext) {
    next.gamesWithStats = clampMinZero((current && current.gamesWithStats || 0) - 1)
    next.statsGameRefs = removeStatsGameRef(current && current.statsGameRefs, gameId)
  }

  if (hadPrev && hasNext) {
    next.gamesWithStats = clampMinZero(current && current.gamesWithStats || 0)
    next.statsGameRefs = upsertStatsGameRef(current && current.statsGameRefs, gameRef)
  }

  return applyStatsRates(next)
}

function resolvePlayerAggregateTeamId({ current, nextRow, teamId }) {
  if (nextRow && nextRow.teamId) return nextRow.teamId
  if (current && current.teamId) return current.teamId
  if (teamId) return teamId

  return ''
}

function buildNextTeamAggregate({
  current,
  teamId,
  gameRef,
  gameId,
  delta,
  prevTeamStats,
  nextTeamStats,
  now,
}) {
  const prevPlayersCount = Number(prevTeamStats.playersCount) || 0
  const nextPlayersCount = Number(nextTeamStats.playersCount) || 0

  let next = {
    ...current,
    id: teamId,
    teamId,
    updatedAt: now,
    createdAt: current && current.createdAt ? current.createdAt : now,
  }

  next = applyStatsDelta(next, delta)

  next.gamesWithStats = clampMinZero(current && current.gamesWithStats || 0)
  next.playersWithStats = clampMinZero(
    (current && current.playersWithStats || 0) + nextPlayersCount - prevPlayersCount
  )

  next.statsGameRefs = upsertStatsGameRef(current && current.statsGameRefs, gameRef)

  if (!nextPlayersCount) {
    next.statsGameRefs = removeStatsGameRef(next.statsGameRefs, gameId)
  }

  return applyStatsRates(next)
}

function buildCommittedAt({ current, status, now }) {
  if (status !== 'committed') return undefined
  if (current && current.committedAt) return current.committedAt

  return now
}

function buildNextGameStatsDoc({
  current,
  gameStatsDocId,
  gameId,
  teamId,
  playerStats,
  teamStats,
  rivelStats,
  status,
  now,
}) {
  return compactDoc({
    ...current,

    id: gameStatsDocId,
    docId: gameStatsDocId,

    gameId,
    teamId,

    playerStats,
    teamStats,
    rivelStats: resolveRivelStats({ current, rivelStats }),

    status,
    aggregateStatus: 'synced',

    updatedFrom: STATS_SOURCE,
    updatedAt: now,
    createdAt: current && current.createdAt ? current.createdAt : now,
    committedAt: buildCommittedAt({ current, status, now }),
  })
}

function resolveRivelStats({ current, rivelStats }) {
  if (rivelStats !== undefined && rivelStats !== null) return rivelStats
  if (current && current.rivelStats !== undefined) return current.rivelStats

  return undefined
}

function buildGameRef({ gameId, gameStatsDocId, teamId, game, data, status }) {
  return buildStatsGameRef({
    gameId,
    gameStatsDocId,
    teamId,
    gameDate: game.gameDate || data.gameDate || '',
    status,
  })
}

function buildNextPlayersStatsList({
  playersStatsDoc,
  prevPlayerStats,
  nextPlayerStats,
  teamId,
  gameId,
  gameRef,
  now,
}) {
  const prevByPlayerId = indexPlayerStatsByPlayerId(prevPlayerStats)
  const nextByPlayerId = indexPlayerStatsByPlayerId(nextPlayerStats)
  let nextPlayersStatsList = playersStatsDoc.list

  for (const playerId of getMergedPlayerIds(prevPlayerStats, nextPlayerStats)) {
    const prevRow = prevByPlayerId.get(playerId) || null
    const nextRow = nextByPlayerId.get(playerId) || null
    const current = findListItem(nextPlayersStatsList, playerId)
    const delta = buildStatsDelta(prevRow, nextRow)

    const nextItem = buildNextPlayerAggregate({
      current,
      playerId,
      teamId,
      gameId,
      gameRef,
      delta,
      prevRow,
      nextRow,
      now,
    })

    nextPlayersStatsList = upsertListItem(
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
  gameRef,
  gameId,
  prevTeamStats,
  nextTeamStats,
  now,
}) {
  const teamDelta = buildStatsDelta(prevTeamStats, nextTeamStats)
  const currentTeamStats = findListItem(teamsStatsDoc.list, teamId)

  const nextTeamStatsItem = buildNextTeamAggregate({
    current: currentTeamStats,
    teamId,
    gameRef,
    gameId,
    delta: teamDelta,
    prevTeamStats,
    nextTeamStats,
    now,
  })

  return upsertListItem(teamsStatsDoc.list, teamId, nextTeamStatsItem)
}

function buildDryRunSummary({ data, gameId }) {
  return {
    dryRun: true,
    ids: {
      gameId: gameId || null,
      gameStatsDocId: clean(data.gameStatsDocId) || null,
    },
    note: 'dryRun only',
  }
}

function buildUpdateSummary({
  gameId,
  teamId,
  gameStatsDocId,
  status,
  prevPlayerStats,
  nextPlayerStats,
  nextTeamStats,
}) {
  return {
    ok: true,
    ids: {
      gameId,
      teamId,
      gameStatsDocId,
    },
    summary: {
      status,
      prevPlayersCount: prevPlayerStats.length,
      nextPlayersCount: nextPlayerStats.length,
      teamStats: nextTeamStats,
    },
  }
}

function writeUpdateTransaction({
  tx,
  refs,
  docs,
  gameStatsRef,
  nextGameStatsDoc,
  nextGameInfoList,
  nextPlayersStatsList,
  nextTeamsStatsList,
  now,
}) {
  tx.set(gameStatsRef, nextGameStatsDoc, { merge: true })

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

export async function updateGameStatsDoc({
  payload,
  draft,
  dryRun = false,
} = {}) {
  const data = resolvePayload({ payload, draft })

  ensurePayload(data)

  const draftGameId = clean(data.gameId)
  const status = clean(data.status) || 'draft'
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
      throw new Error(`[updateGameStatsDoc] gameStats doc not found: ${gameStatsDocId}`)
    }

    const currentGameStats = gameStatsSnap.data() || {}
    const gameId = clean(data.gameId || currentGameStats.gameId)
    const teamId = clean(data.teamId || currentGameStats.teamId || game && game.teamId)

    if (!gameId) throw new Error('[updateGameStatsDoc] missing resolved gameId')
    if (!teamId) throw new Error('[updateGameStatsDoc] missing resolved teamId')

    const resolvedGame = game || findListItem(gameInfoDoc.list, gameId)

    if (!resolvedGame) {
      throw new Error(`[updateGameStatsDoc] game not found in games.gameInfo: ${gameId}`)
    }

    const context = buildUpdateContext({
      data,
      gameId,
      teamId,
      game: resolvedGame,
    })

    const prevPlayerStats = normalizeGamePlayerStatsList(
      currentGameStats.playerStats || [],
      context
    )

    const nextPlayerStats = normalizeGamePlayerStatsList(
      data.playerStats || [],
      context
    )

    const prevTeamStats = buildGameTeamStats(prevPlayerStats, context)
    const nextTeamStats = buildGameTeamStats(nextPlayerStats, context)

    const gameRef = buildGameRef({
      gameId,
      gameStatsDocId,
      teamId,
      game: resolvedGame,
      data,
      status,
    })

    const nextPlayersStatsList = buildNextPlayersStatsList({
      playersStatsDoc,
      prevPlayerStats,
      nextPlayerStats,
      teamId,
      gameId,
      gameRef,
      now,
    })

    const nextTeamsStatsList = buildNextTeamsStatsList({
      teamsStatsDoc,
      teamId,
      gameRef,
      gameId,
      prevTeamStats,
      nextTeamStats,
      now,
    })

    const nextGameInfoItem = buildNextGameInfoItem({
      current: resolvedGame,
      gameStatsDocId,
      status,
      now,
    })

    const nextGameInfoList = upsertListItem(
      gameInfoDoc.list,
      gameId,
      nextGameInfoItem
    )

    const nextGameStatsDoc = buildNextGameStatsDoc({
      current: currentGameStats,
      gameStatsDocId,
      gameId,
      teamId,
      playerStats: nextPlayerStats,
      teamStats: nextTeamStats,
      rivelStats: data.rivelStats,
      status,
      now,
    })

    writeUpdateTransaction({
      tx,
      refs,
      docs: {
        gameInfoDoc,
        playersStatsDoc,
        teamsStatsDoc,
      },
      gameStatsRef,
      nextGameStatsDoc,
      nextGameInfoList,
      nextPlayersStatsList,
      nextTeamsStatsList,
      now,
    })

    return buildUpdateSummary({
      gameId,
      teamId,
      gameStatsDocId,
      status,
      prevPlayerStats,
      nextPlayerStats,
      nextTeamStats,
    })
  })
}

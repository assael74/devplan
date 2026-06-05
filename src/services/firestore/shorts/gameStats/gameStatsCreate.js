// src/services/firestore/shorts/gameStats/gameStatsCreate.js

import { doc, runTransaction, Timestamp } from 'firebase/firestore'

import { db } from '../../../firebase/firebase.js'
import { gameStatsShortsRef } from '../../shortsCollections.js'
import { shortsRefs } from '../shorts.refs.js'

import { makeId } from '../../../../utils/id.js'

import {
  buildGameTeamStats,
  buildNextPlayerStatsItem,
  buildNextTeamStatsItem,
  buildStatsGameRef,
  normalizeGamePlayerStatsList,
} from '../../../../shared/stats/engine/index.js'

import {
  buildShortDocRef,
  buildShortsDocPayload,
  clean,
  compactDoc,
  findListItem,
  getPayloadNumber,
  readShortListDoc,
  resolvePayload,
  upsertListItem,
} from './shared/index.js'

const STATS_SOURCE = 'gameStatsCreateV1'

function ensurePayload(payload) {
  if (!payload || typeof payload !== 'object') {
    throw new Error('[createGameStatsDoc] payload is required')
  }

  if (!clean(payload.gameId)) {
    throw new Error('[createGameStatsDoc] missing gameId')
  }

  if (!clean(payload.teamId)) {
    throw new Error('[createGameStatsDoc] missing teamId')
  }

  if (!Array.isArray(payload.playerStats) || !payload.playerStats.length) {
    throw new Error('[createGameStatsDoc] playerStats must be a non-empty array')
  }
}

function resolveGameStatsDocId({ payload, game }) {
  const payloadGameStatsDocId = clean(payload.gameStatsDocId)
  const existingGameStatsDocId = clean(game.statsDocId || game.gameStatsDocId)

  if (existingGameStatsDocId) {
    throw new Error(
      `[createGameStatsDoc] game already has statsDocId: ${existingGameStatsDocId}`
    )
  }

  return payloadGameStatsDocId || makeId('gameStats')
}

function buildNextGameInfoItem({ current, gameStatsDocId, status, now }) {
  return {
    ...current,
    hasStats: true,
    statsStatus: status,
    statsDocId: gameStatsDocId,
    gameStatsDocId,
    statsUpdatedAt: now,
  }
}

function buildGameStatsDetailDoc({
  gameStatsDocId,
  gameId,
  teamId,
  playerStats,
  teamStats,
  rivelStats,
  status,
  source,
  now,
}) {
  return compactDoc({
    id: gameStatsDocId,
    docId: gameStatsDocId,

    gameId,
    teamId,

    playerStats,
    teamStats,
    rivelStats,

    status,
    aggregateStatus: 'synced',

    source: source || STATS_SOURCE,
    updatedFrom: STATS_SOURCE,

    createdAt: now,
    updatedAt: now,
    committedAt: status === 'committed' ? now : undefined,
  })
}

function buildCreateContext({ data, gameId, teamId, game, gameStatsDocId }) {
  const gameDuration = game.gameDuration || data.gameDuration || 0

  return {
    gameId,
    teamId,
    gameStatsDocId,
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

function buildCreateTeamStats({ playerStats, context }) {
  return {
    ...buildGameTeamStats(playerStats, context),
    gameId: context.gameId,
    teamId: context.teamId,
    gameStatsDocId: context.gameStatsDocId,
  }
}

function buildCreateSummary({
  gameId,
  teamId,
  gameStatsDocId,
  status,
  playerStats,
  teamStats,
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
      playersCount: playerStats.length,
      teamStats,
    },
  }
}

function buildDryRunSummary({ data, gameId, teamId }) {
  return {
    dryRun: true,
    ids: {
      gameId,
      itemId: gameId,
      teamId,
      gameStatsDocId: clean(data.gameStatsDocId) || null,
    },
    note: 'dryRun only',
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

function buildGameRef({ gameId, gameStatsDocId, teamId, game, data, status }) {
  return buildStatsGameRef({
    gameId,
    gameStatsDocId,
    teamId,
    gameDate: game.gameDate || data.gameDate || '',
    status,
  })
}

function buildNextPlayersStatsList({ playersStatsDoc, playerStats, gameRef, now }) {
  let nextPlayersStatsList = playersStatsDoc.list

  for (const row of playerStats) {
    const current = findListItem(nextPlayersStatsList, row.playerId)

    const nextItem = buildNextPlayerStatsItem({
      current,
      playerStats: row,
      gameRef,
      now,
    })

    nextPlayersStatsList = upsertListItem(
      nextPlayersStatsList,
      row.playerId,
      nextItem
    )
  }

  return nextPlayersStatsList
}

function buildNextTeamsStatsList({ teamsStatsDoc, teamId, teamStats, gameRef, now }) {
  const currentTeamStats = findListItem(teamsStatsDoc.list, teamId)

  const nextTeamStatsItem = buildNextTeamStatsItem({
    current: currentTeamStats,
    teamStats,
    gameRef,
    now,
  })

  return upsertListItem(teamsStatsDoc.list, teamId, nextTeamStatsItem)
}

function writeCreateTransaction({
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

export async function createGameStatsDoc({ payload, draft, dryRun = false } = {}) {
  const data = resolvePayload({ payload, draft })

  ensurePayload(data)

  const gameId = clean(data.gameId)
  const teamId = clean(data.teamId)
  const status = clean(data.status) || 'draft'
  const now = Timestamp.now()
  const refs = buildRefs()

  if (dryRun) {
    return buildDryRunSummary({ data, gameId, teamId })
  }

  return runTransaction(db, async tx => {
    const gameInfoDoc = await readShortListDoc(tx, refs.gameInfoRef)
    const playersStatsDoc = await readShortListDoc(tx, refs.playersStatsRef)
    const teamsStatsDoc = await readShortListDoc(tx, refs.teamsStatsRef)

    const game = findListItem(gameInfoDoc.list, gameId)

    if (!game) {
      throw new Error(`[createGameStatsDoc] game not found in games.gameInfo: ${gameId}`)
    }

    const gameStatsDocId = resolveGameStatsDocId({ payload: data, game })
    const gameStatsRef = doc(gameStatsShortsRef, gameStatsDocId)
    const gameStatsSnap = await tx.get(gameStatsRef)

    if (gameStatsSnap.exists()) {
      throw new Error(`[createGameStatsDoc] gameStats doc already exists: ${gameStatsDocId}`)
    }

    const context = buildCreateContext({
      data,
      gameId,
      teamId,
      game,
      gameStatsDocId,
    })

    const playerStats = normalizeGamePlayerStatsList(data.playerStats, context)
    const teamStats = buildCreateTeamStats({ playerStats, context })

    if (!playerStats.length) {
      throw new Error('[createGameStatsDoc] no valid playerStats after normalize')
    }

    const gameRef = buildGameRef({
      gameId,
      gameStatsDocId,
      teamId,
      game,
      data,
      status,
    })

    const nextGameInfoItem = buildNextGameInfoItem({
      current: game,
      gameStatsDocId,
      status,
      now,
    })

    const nextGameInfoList = upsertListItem(
      gameInfoDoc.list,
      gameId,
      nextGameInfoItem
    )

    const nextPlayersStatsList = buildNextPlayersStatsList({
      playersStatsDoc,
      playerStats,
      gameRef,
      now,
    })

    const nextTeamsStatsList = buildNextTeamsStatsList({
      teamsStatsDoc,
      teamId,
      teamStats,
      gameRef,
      now,
    })

    const nextGameStatsDoc = buildGameStatsDetailDoc({
      gameStatsDocId,
      gameId,
      teamId,
      playerStats,
      teamStats,
      rivelStats: data.rivelStats,
      status,
      source: data.source,
      now,
    })

    writeCreateTransaction({
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

    return buildCreateSummary({
      gameId,
      teamId,
      gameStatsDocId,
      status,
      playerStats,
      teamStats,
    })
  })
}

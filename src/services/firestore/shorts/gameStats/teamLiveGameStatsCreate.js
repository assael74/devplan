// src/services/firestore/shorts/gameStats/teamLiveGameStatsCreate.js

import { doc, runTransaction, Timestamp } from 'firebase/firestore'

import { db } from '../../../firebase/firebase.js'
import { gameStatsShortsRef } from '../../shortsCollections.js'
import { shortsRefs } from '../shorts.refs.js'

import { applyStatsRates, buildNextTeamStatsItem, buildStatsGameRef } from '../../../../shared/stats/engine/index.js'

import {
  buildShortDocRef,
  buildShortsDocPayload,
  clean,
  compactDoc,
  findListItem,
  readShortListDoc,
  upsertListItem,
} from './shared/index.js'

const STATS_SOURCE = 'teamLiveGameStatsCreateV1'

function ensurePayload(payload) {
  if (!payload || typeof payload !== 'object') {
    throw new Error('[createTeamOnlyGameStatsDoc] payload is required')
  }

  if (!clean(payload.gameId)) {
    throw new Error('[createTeamOnlyGameStatsDoc] missing gameId')
  }

  if (!clean(payload.teamId)) {
    throw new Error('[createTeamOnlyGameStatsDoc] missing teamId')
  }

  if (!payload.teamStats || typeof payload.teamStats !== 'object') {
    throw new Error('[createTeamOnlyGameStatsDoc] missing teamStats')
  }
}

function buildRefs() {
  const gameInfoMeta = shortsRefs.games.gameInfo
  const teamsStatsMeta = shortsRefs.teams.teamsStats

  return {
    gameInfoMeta,
    teamsStatsMeta,
    gameInfoRef: buildShortDocRef(gameInfoMeta),
    teamsStatsRef: buildShortDocRef(teamsStatsMeta),
  }
}

function resolveGameStatsDocId({ payload, gameStatsRef }) {
  return clean(payload.gameStatsDocId || payload.statsDocId) || gameStatsRef.id
}

function assertCanCreate({ game }) {
  if (!game) {
    throw new Error('[createTeamOnlyGameStatsDoc] game not found in games.gameInfo')
  }

  const existingGameStatsDocId = clean(game.statsDocId || game.gameStatsDocId)

  if (existingGameStatsDocId) {
    throw new Error(
      `[createTeamOnlyGameStatsDoc] game already has statsDocId: ${existingGameStatsDocId}`
    )
  }
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

function buildTeamStats({ payload, gameId, teamId, gameStatsDocId }) {
  return applyStatsRates({
    ...(payload.teamStats || {}),
    gameId,
    teamId,
    gameStatsDocId,
    playersCount: Number(payload.teamStats?.playersCount) || 0,
    timePlayed: Number(payload.teamStats?.timePlayed || payload.timePlayed || 0),
    timeVideoStats: Number(
      payload.teamStats?.timeVideoStats ||
        payload.timeVideoStats ||
        payload.teamStats?.timePlayed ||
        payload.timePlayed ||
        0
    ),
  })
}

function buildGameRef({ gameId, gameStatsDocId, teamId, game, payload, status }) {
  return buildStatsGameRef({
    gameId,
    gameStatsDocId,
    teamId,
    gameDate: game.gameDate || payload.gameDate || '',
    status,
  })
}

function buildNextGameStatsDoc({
  gameStatsDocId,
  gameId,
  teamId,
  teamStats,
  status,
  source,
  now,
}) {
  return compactDoc({
    id: gameStatsDocId,
    docId: gameStatsDocId,

    gameId,
    teamId,

    statsScope: 'teamOnly',
    playerStats: [],
    teamStats,
    rivelStats: null,

    status,
    aggregateStatus: 'synced',

    source: source || 'liveTaggingTeamOnly',
    updatedFrom: STATS_SOURCE,

    createdAt: now,
    updatedAt: now,
    committedAt: status === 'committed' ? now : undefined,
  })
}

function buildDryRunSummary({ payload, gameId, teamId }) {
  return {
    dryRun: true,
    ids: {
      gameId,
      teamId,
      gameStatsDocId: clean(payload.gameStatsDocId || payload.statsDocId) || null,
    },
    note: 'dryRun only',
  }
}

function buildCreateSummary({
  gameId,
  teamId,
  gameStatsDocId,
  status,
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
      statsScope: 'teamOnly',
      teamStats,
    },
  }
}

function writeTeamOnlyCreateTransaction({
  tx,
  refs,
  docs,
  gameStatsRef,
  nextGameStatsDoc,
  nextGameInfoList,
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

export async function createTeamOnlyGameStatsDoc({ payload, dryRun = false } = {}) {
  ensurePayload(payload)

  const gameId = clean(payload.gameId)
  const teamId = clean(payload.teamId)
  const status = clean(payload.status) || 'partial'
  const now = Timestamp.now()
  const refs = buildRefs()

  if (dryRun) {
    return buildDryRunSummary({ payload, gameId, teamId })
  }

  return runTransaction(db, async tx => {
    const gameInfoDoc = await readShortListDoc(tx, refs.gameInfoRef)
    const teamsStatsDoc = await readShortListDoc(tx, refs.teamsStatsRef)

    const game = findListItem(gameInfoDoc.list, gameId)

    assertCanCreate({ game })

    const gameStatsRef = doc(gameStatsShortsRef)
    const gameStatsDocId = resolveGameStatsDocId({ payload, gameStatsRef })
    const finalGameStatsRef = doc(gameStatsShortsRef, gameStatsDocId)
    const existingSnap = await tx.get(finalGameStatsRef)

    if (existingSnap.exists()) {
      throw new Error(
        `[createTeamOnlyGameStatsDoc] gameStats doc already exists: ${gameStatsDocId}`
      )
    }

    const teamStats = buildTeamStats({
      payload,
      gameId,
      teamId,
      gameStatsDocId,
    })

    const gameRef = buildGameRef({
      gameId,
      gameStatsDocId,
      teamId,
      game,
      payload,
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

    const currentTeamStats = findListItem(teamsStatsDoc.list, teamId)

    const nextTeamStatsItem = buildNextTeamStatsItem({
      current: currentTeamStats,
      teamStats,
      gameRef,
      now,
    })

    const nextTeamsStatsList = upsertListItem(
      teamsStatsDoc.list,
      teamId,
      nextTeamStatsItem
    )

    const nextGameStatsDoc = buildNextGameStatsDoc({
      gameStatsDocId,
      gameId,
      teamId,
      teamStats,
      status,
      source: payload.source,
      now,
    })

    writeTeamOnlyCreateTransaction({
      tx,
      refs,
      docs: {
        gameInfoDoc,
        teamsStatsDoc,
      },
      gameStatsRef: finalGameStatsRef,
      nextGameStatsDoc,
      nextGameInfoList,
      nextTeamsStatsList,
      now,
    })

    return buildCreateSummary({
      gameId,
      teamId,
      gameStatsDocId,
      status,
      teamStats,
    })
  })
}

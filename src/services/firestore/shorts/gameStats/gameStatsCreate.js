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

const STATS_SOURCE = 'gameStatsCreateV1'

const clean = value => String(value ?? '').trim()

const ensureDraft = draft => {
  if (!draft || typeof draft !== 'object') {
    throw new Error('[createGameStatsDoc] draft is required')
  }

  if (!clean(draft.gameId)) {
    throw new Error('[createGameStatsDoc] missing gameId')
  }

  if (!clean(draft.teamId)) {
    throw new Error('[createGameStatsDoc] missing teamId')
  }

  if (!Array.isArray(draft.playerStats) || !draft.playerStats.length) {
    throw new Error('[createGameStatsDoc] playerStats must be a non-empty array')
  }
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
  return (Array.isArray(list) ? list : []).find(item => item?.id === id) || null
}

const upsertListItem = (list = [], id, nextItem) => {
  const idx = list.findIndex(item => item?.id === id)

  if (idx < 0) return [...list, nextItem]

  return list.map((item, index) => {
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

const resolveGameStatsDocId = ({ draft, game }) => {
  const draftGameStatsDocId = clean(draft?.gameStatsDocId)
  const existingGameStatsDocId = clean(game?.statsDocId)

  if (existingGameStatsDocId) {
    throw new Error(
      `[createGameStatsDoc] game already has statsDocId: ${existingGameStatsDocId}`
    )
  }

  return draftGameStatsDocId || makeId('gameStats')
}

const buildNextGameInfoItem = ({
  current,
  gameStatsDocId,
  status,
  now,
}) => {
  return {
    ...(current || {}),
    hasStats: true,
    statsStatus: status,
    statsDocId: gameStatsDocId,
    statsUpdatedAt: now,
  }
}

const buildGameStatsDetailDoc = ({
  gameStatsDocId,
  gameId,
  teamId,
  playerStats,
  teamStats,
  rivelStats,
  status,
  source,
  now,
}) => {
  return {
    id: gameStatsDocId,
    docId: gameStatsDocId,

    gameId,
    teamId,

    playerStats,
    teamStats,
    rivelStats: rivelStats ?? null,

    status,
    aggregateStatus: 'synced',

    source: source || STATS_SOURCE,
    updatedFrom: STATS_SOURCE,

    createdAt: now,
    updatedAt: now,
    committedAt: status === 'committed' ? now : null,
  }
}

const buildCreateSummary = ({ gameId, teamId, gameStatsDocId, status, playerStats, teamStats }) => {
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

export async function createGameStatsDoc({ draft, dryRun = false } = {}) {
  ensureDraft(draft)

  const gameId = clean(draft.gameId)
  const itemId = gameId
  const teamId = clean(draft.teamId)
  const status = clean(draft.status) || 'partial'
  const now = Timestamp.now()

  const gameInfoMeta = shortsRefs.games.gameInfo
  const playersStatsMeta = shortsRefs.players.playersStats
  const teamsStatsMeta = shortsRefs.teams.teamsStats

  const gameInfoRef = buildShortDocRef(gameInfoMeta)
  const playersStatsRef = buildShortDocRef(playersStatsMeta)
  const teamsStatsRef = buildShortDocRef(teamsStatsMeta)

  if (dryRun) {
    return {
      dryRun: true,
      ids: {
        gameId,
        itemId,
        teamId,
        gameStatsDocId: clean(draft.gameStatsDocId) || null,
      },
      note: 'dryRun only',
    }
  }

  return runTransaction(db, async tx => {
    const gameInfoDoc = await readShortListDoc(tx, gameInfoRef)
    const playersStatsDoc = await readShortListDoc(tx, playersStatsRef)
    const teamsStatsDoc = await readShortListDoc(tx, teamsStatsRef)

    const game = findListItem(gameInfoDoc.list, itemId)

    if (!game) {
      throw new Error(`[createGameStatsDoc] game not found in games.gameInfo: ${itemId}`)
    }

    const gameStatsDocId = resolveGameStatsDocId({ draft, game })
    const gameStatsRef = doc(gameStatsShortsRef, gameStatsDocId)
    const gameStatsSnap = await tx.get(gameStatsRef)

    if (gameStatsSnap.exists()) {
      throw new Error(`[createGameStatsDoc] gameStats doc already exists: ${gameStatsDocId}`)
    }

    const context = {
      gameId,
      teamId,
      gameDuration: game?.gameDuration || draft?.gameDuration,
      timePlayed: draft?.timePlayed || game?.gameDuration || draft?.gameDuration,
      timeVideoStats: draft?.timeVideoStats || draft?.teamVideoTime || game?.gameDuration || draft?.gameDuration,
    }

    const playerStats = normalizeGamePlayerStatsList(draft.playerStats, context)
    const teamStats = buildGameTeamStats(playerStats, context)

    if (!playerStats.length) {
      throw new Error('[createGameStatsDoc] no valid playerStats after normalize')
    }

    const gameRef = buildStatsGameRef({
      gameId,
      gameStatsDocId,
      teamId,
      gameDate: game?.gameDate || draft?.gameDate || '',
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
      itemId,
      nextGameInfoItem
    )

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

    const nextGameStatsDoc = buildGameStatsDetailDoc({
      gameStatsDocId,
      gameId,
      teamId,
      playerStats,
      teamStats,
      rivelStats: draft.rivelStats,
      status,
      source: draft.source,
      now,
    })

    tx.set(gameStatsRef, nextGameStatsDoc, { merge: true })

    tx.set(
      gameInfoRef,
      buildShortsDocPayload({
        data: gameInfoDoc.data,
        meta: gameInfoMeta,
        docName: 'gameInfo',
        list: nextGameInfoList,
        now,
      }),
      { merge: true }
    )

    tx.set(
      playersStatsRef,
      buildShortsDocPayload({
        data: playersStatsDoc.data,
        meta: playersStatsMeta,
        docName: 'playersStats',
        list: nextPlayersStatsList,
        now,
      }),
      { merge: true }
    )

    tx.set(
      teamsStatsRef,
      buildShortsDocPayload({
        data: teamsStatsDoc.data,
        meta: teamsStatsMeta,
        docName: 'teamsStats',
        list: nextTeamsStatsList,
        now,
      }),
      { merge: true }
    )

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

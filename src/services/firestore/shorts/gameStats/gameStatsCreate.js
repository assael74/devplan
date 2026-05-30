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

const clean = value => {
  return String(value ?? '').trim()
}

const isPlainObject = value => {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

const compactDoc = value => {
  if (Array.isArray(value)) {
    return value
      .map(item => compactDoc(item))
      .filter(item => item !== undefined)
  }

  if (!isPlainObject(value)) {
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

const resolvePayload = ({ payload, draft }) => {
  return payload || draft
}

const ensurePayload = payload => {
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

const getPayloadNumber = ({ payload, key, fallback = 0 }) => {
  const value = payload?.meta?.[key] ?? payload?.[key] ?? fallback
  const num = Number(value)

  return Number.isFinite(num) ? num : fallback
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

const resolveGameStatsDocId = ({ payload, game }) => {
  const payloadGameStatsDocId = clean(payload?.gameStatsDocId)
  const existingGameStatsDocId = clean(game?.statsDocId)

  if (existingGameStatsDocId) {
    throw new Error(
      `[createGameStatsDoc] game already has statsDocId: ${existingGameStatsDocId}`
    )
  }

  return payloadGameStatsDocId || makeId('gameStats')
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

const buildCreateSummary = ({
  gameId,
  teamId,
  gameStatsDocId,
  status,
  playerStats,
  teamStats,
}) => {
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

export async function createGameStatsDoc({ payload, draft, dryRun = false } = {}) {
  const data = resolvePayload({ payload, draft })

  ensurePayload(data)

  const gameId = clean(data.gameId)
  const itemId = gameId
  const teamId = clean(data.teamId)
  const status = clean(data.status) || 'draft'
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
        gameStatsDocId: clean(data.gameStatsDocId) || null,
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

    const gameStatsDocId = resolveGameStatsDocId({ payload: data, game })
    const gameStatsRef = doc(gameStatsShortsRef, gameStatsDocId)
    const gameStatsSnap = await tx.get(gameStatsRef)

    if (gameStatsSnap.exists()) {
      throw new Error(`[createGameStatsDoc] gameStats doc already exists: ${gameStatsDocId}`)
    }

    const gameDuration = game?.gameDuration || data?.gameDuration || 0

    const context = {
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
        fallback: data?.teamVideoTime || gameDuration,
      }),
    }

    const playerStats = normalizeGamePlayerStatsList(data.playerStats, context)
    const teamStats = buildGameTeamStats(playerStats, context)

    if (!playerStats.length) {
      throw new Error('[createGameStatsDoc] no valid playerStats after normalize')
    }

    const gameRef = buildStatsGameRef({
      gameId,
      gameStatsDocId,
      teamId,
      gameDate: game?.gameDate || data?.gameDate || '',
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
      rivelStats: data.rivelStats,
      status,
      source: data.source,
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

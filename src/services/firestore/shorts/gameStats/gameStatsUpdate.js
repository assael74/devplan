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

const STATS_SOURCE = 'gameStatsUpdateV1'

const clean = value => String(value ?? '').trim()

const ensureDraft = draft => {
  if (!draft || typeof draft !== 'object') {
    throw new Error('[updateGameStatsDoc] draft is required')
  }

  if (!clean(draft.gameId) && !clean(draft.gameStatsDocId)) {
    throw new Error('[updateGameStatsDoc] missing gameId or gameStatsDocId')
  }

  if (!Array.isArray(draft.playerStats)) {
    throw new Error('[updateGameStatsDoc] playerStats must be an array')
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
  const fromDraft = clean(draft?.gameStatsDocId)
  const fromGame = clean(game?.statsDocId)

  const gameStatsDocId = fromDraft || fromGame

  if (!gameStatsDocId) {
    throw new Error('[updateGameStatsDoc] missing gameStatsDocId')
  }

  return gameStatsDocId
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

const clampMinZero = value => {
  const n = Number(value)
  if (!Number.isFinite(n)) return 0
  return Math.max(0, n)
}

const buildNextPlayerAggregate = ({
  current,
  playerId,
  teamId,
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
    teamId: nextRow?.teamId || current?.teamId || teamId || '',
    updatedAt: now,
    createdAt: current?.createdAt ?? now,
  }

  next = applyStatsDelta(next, delta)

  if (!hadPrev && hasNext) {
    next.gamesWithStats = clampMinZero((current?.gamesWithStats || 0) + 1)
    next.statsGameRefs = upsertStatsGameRef(current?.statsGameRefs, gameRef)
  }

  if (hadPrev && !hasNext) {
    next.gamesWithStats = clampMinZero((current?.gamesWithStats || 0) - 1)
    next.statsGameRefs = removeStatsGameRef(current?.statsGameRefs, gameId)
  }

  if (hadPrev && hasNext) {
    next.gamesWithStats = clampMinZero(current?.gamesWithStats || 0)
    next.statsGameRefs = upsertStatsGameRef(current?.statsGameRefs, gameRef)
  }

  return applyStatsRates(next)
}

const buildNextTeamAggregate = ({
  current,
  teamId,
  gameRef,
  gameId,
  delta,
  prevTeamStats,
  nextTeamStats,
  now,
}) => {
  const prevPlayersCount = Number(prevTeamStats?.playersCount) || 0
  const nextPlayersCount = Number(nextTeamStats?.playersCount) || 0

  let next = {
    ...(current || {}),
    id: teamId,
    teamId,
    updatedAt: now,
    createdAt: current?.createdAt ?? now,
  }

  next = applyStatsDelta(next, delta)

  next.gamesWithStats = clampMinZero(current?.gamesWithStats || 0)
  next.playersWithStats = clampMinZero(
    (current?.playersWithStats || 0) + nextPlayersCount - prevPlayersCount
  )

  next.statsGameRefs = upsertStatsGameRef(current?.statsGameRefs, gameRef)

  if (!nextPlayersCount) {
    next.statsGameRefs = removeStatsGameRef(next.statsGameRefs, gameId)
  }

  return applyStatsRates(next)
}

const buildNextGameStatsDoc = ({
  current,
  gameStatsDocId,
  gameId,
  teamId,
  playerStats,
  teamStats,
  rivelStats,
  status,
  now,
}) => {
  return {
    ...(current || {}),

    id: gameStatsDocId,
    docId: gameStatsDocId,

    gameId,
    teamId,

    playerStats,
    teamStats,
    rivelStats: rivelStats ?? current?.rivelStats ?? null,

    status,
    aggregateStatus: 'synced',

    updatedFrom: STATS_SOURCE,
    updatedAt: now,
    createdAt: current?.createdAt ?? now,
    committedAt: status === 'committed'
      ? (current?.committedAt ?? now)
      : (current?.committedAt ?? null),
  }
}

export async function updateGameStatsDoc({ draft, dryRun = false } = {}) {
  ensureDraft(draft)

  const draftGameId = clean(draft.gameId)
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
        gameId: draftGameId || null,
        gameStatsDocId: clean(draft.gameStatsDocId) || null,
      },
      note: 'dryRun only',
    }
  }

  return runTransaction(db, async tx => {
    const gameInfoDoc = await readShortListDoc(tx, gameInfoRef)
    const playersStatsDoc = await readShortListDoc(tx, playersStatsRef)
    const teamsStatsDoc = await readShortListDoc(tx, teamsStatsRef)

    const game = draftGameId
      ? findListItem(gameInfoDoc.list, draftGameId)
      : null

    const gameStatsDocId = resolveGameStatsDocId({ draft, game })
    const gameStatsRef = doc(gameStatsShortsRef, gameStatsDocId)
    const gameStatsSnap = await tx.get(gameStatsRef)

    if (!gameStatsSnap.exists()) {
      throw new Error(`[updateGameStatsDoc] gameStats doc not found: ${gameStatsDocId}`)
    }

    const currentGameStats = gameStatsSnap.data() || {}

    const gameId = clean(draft.gameId || currentGameStats.gameId)
    const teamId = clean(draft.teamId || currentGameStats.teamId || game?.teamId)

    if (!gameId) throw new Error('[updateGameStatsDoc] missing resolved gameId')
    if (!teamId) throw new Error('[updateGameStatsDoc] missing resolved teamId')

    const resolvedGame = game || findListItem(gameInfoDoc.list, gameId)

    if (!resolvedGame) {
      throw new Error(`[updateGameStatsDoc] game not found in games.gameInfo: ${gameId}`)
    }

    const context = {
      gameId,
      teamId,
      gameDuration: resolvedGame?.gameDuration || draft?.gameDuration,
      timePlayed: draft?.timePlayed || resolvedGame?.gameDuration || draft?.gameDuration,
      timeVideoStats: draft?.timeVideoStats || draft?.teamVideoTime || resolvedGame?.gameDuration || draft?.gameDuration,
    }

    const prevPlayerStats = normalizeGamePlayerStatsList(
      currentGameStats?.playerStats || [],
      context
    )

    const nextPlayerStats = normalizeGamePlayerStatsList(
      draft.playerStats || [],
      context
    )

    const prevTeamStats = buildGameTeamStats(prevPlayerStats, context)
    const nextTeamStats = buildGameTeamStats(nextPlayerStats, context)

    const prevByPlayerId = indexPlayerStatsByPlayerId(prevPlayerStats)
    const nextByPlayerId = indexPlayerStatsByPlayerId(nextPlayerStats)

    const gameRef = buildStatsGameRef({
      gameId,
      gameStatsDocId,
      teamId,
      gameDate: resolvedGame?.gameDate || draft?.gameDate || '',
      status,
    })

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

    const nextTeamsStatsList = upsertListItem(
      teamsStatsDoc.list,
      teamId,
      nextTeamStatsItem
    )

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
      rivelStats: draft.rivelStats,
      status,
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
  })
}

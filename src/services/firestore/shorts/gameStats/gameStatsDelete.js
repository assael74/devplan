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

const STATS_SOURCE = 'gameStatsDeleteV1'

const clean = value => String(value ?? '').trim()

const ensureDraft = draft => {
  if (!draft || typeof draft !== 'object') {
    throw new Error('[deleteGameStatsDoc] draft is required')
  }

  if (!clean(draft.gameId) && !clean(draft.gameStatsDocId)) {
    throw new Error('[deleteGameStatsDoc] missing gameId or gameStatsDocId')
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

const updateExistingListItem = (list = [], id, nextItem) => {
  const idx = list.findIndex(item => item?.id === id)
  if (idx < 0) return list

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

const clampMinZero = value => {
  const num = Number(value)
  if (!Number.isFinite(num)) return 0
  return Math.max(0, num)
}

const resolveGameStatsDocId = ({ draft, game }) => {
  const fromDraft = clean(draft?.gameStatsDocId || draft?.statsDocId)
  const fromGame = clean(game?.statsDocId)

  const gameStatsDocId = fromDraft || fromGame

  if (!gameStatsDocId) {
    throw new Error('[deleteGameStatsDoc] missing gameStatsDocId')
  }

  return gameStatsDocId
}

const buildDeletedGameInfoItem = ({ current, now }) => {
  return {
    ...(current || {}),
    hasStats: false,
    statsStatus: 'none',
    statsDocId: '',
    statsUpdatedAt: now,
  }
}

const buildDeletedGameStatsDoc = ({ current, now }) => {
  return {
    ...(current || {}),

    status: 'deleted',
    aggregateStatus: 'synced',

    deletedAt: now,
    updatedAt: now,
    updatedFrom: STATS_SOURCE,
  }
}

const buildDeletedPlayerAggregate = ({
  current,
  playerId,
  gameId,
  delta,
  now,
}) => {
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

  return applyStatsRates(next)
}

const buildDeletedTeamAggregate = ({
  current,
  teamId,
  gameId,
  delta,
  playersCount,
  now,
}) => {
  let next = {
    ...(current || {}),
    id: teamId,
    teamId,
    updatedAt: now,
    createdAt: current?.createdAt ?? now,
  }

  next = applyStatsDelta(next, delta)

  next.gamesWithStats = clampMinZero((current?.gamesWithStats || 0) - 1)
  next.playersWithStats = clampMinZero(
    (current?.playersWithStats || 0) - playersCount
  )
  next.statsGameRefs = removeStatsGameRef(current?.statsGameRefs, gameId)

  return applyStatsRates(next)
}

export async function deleteGameStatsDoc({ draft, dryRun = false } = {}) {
  ensureDraft(draft)

  const draftGameId = clean(draft.gameId)
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
        gameStatsDocId: clean(draft.gameStatsDocId || draft.statsDocId) || null,
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
      throw new Error(`[deleteGameStatsDoc] gameStats doc not found: ${gameStatsDocId}`)
    }

    const currentGameStats = gameStatsSnap.data() || {}

    if (clean(currentGameStats.status) === 'deleted') {
      throw new Error(`[deleteGameStatsDoc] gameStats doc already deleted: ${gameStatsDocId}`)
    }

    const gameId = clean(draft.gameId || currentGameStats.gameId)
    const teamId = clean(draft.teamId || currentGameStats.teamId || game?.teamId)

    if (!gameId) throw new Error('[deleteGameStatsDoc] missing resolved gameId')
    if (!teamId) throw new Error('[deleteGameStatsDoc] missing resolved teamId')

    const resolvedGame = game || findListItem(gameInfoDoc.list, gameId)

    if (!resolvedGame) {
      throw new Error(`[deleteGameStatsDoc] game not found in games.gameInfo: ${gameId}`)
    }

    const context = {
      gameId,
      teamId,
      gameDuration: resolvedGame?.gameDuration || draft?.gameDuration,
      timePlayed:
        draft?.timePlayed ||
        resolvedGame?.gameDuration ||
        draft?.gameDuration,
      timeVideoStats:
        draft?.timeVideoStats ||
        draft?.teamVideoTime ||
        resolvedGame?.gameDuration ||
        draft?.gameDuration,
    }

    const prevPlayerStats = normalizeGamePlayerStatsList(
      currentGameStats?.playerStats || [],
      context
    )

    const prevTeamStats = buildGameTeamStats(prevPlayerStats, context)
    const prevByPlayerId = indexPlayerStatsByPlayerId(prevPlayerStats)

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

    const teamDelta = buildStatsDelta(prevTeamStats, {})
    const currentTeamStats = findListItem(teamsStatsDoc.list, teamId)

    const nextTeamsStatsList = currentTeamStats
      ? updateExistingListItem(
          teamsStatsDoc.list,
          teamId,
          buildDeletedTeamAggregate({
            current: currentTeamStats,
            teamId,
            gameId,
            delta: teamDelta,
            playersCount: prevTeamStats?.playersCount || 0,
            now,
          })
        )
      : teamsStatsDoc.list

    const nextGameInfoList = updateExistingListItem(
      gameInfoDoc.list,
      gameId,
      buildDeletedGameInfoItem({
        current: resolvedGame,
        now,
      })
    )

    const nextGameStatsDoc = buildDeletedGameStatsDoc({
      current: currentGameStats,
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
        status: 'deleted',
        playersCount: prevPlayerStats.length,
        teamStatsRemoved: prevTeamStats,
      },
    }
  })
}

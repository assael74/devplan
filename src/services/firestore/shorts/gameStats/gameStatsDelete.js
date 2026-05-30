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

const clean = value => {
  return String(value ?? '').trim()
}

const n = value => {
  const num = Number(value)
  return Number.isFinite(num) ? num : 0
}

const resolvePayload = ({ payload, draft }) => {
  return payload || draft
}

const ensurePayload = payload => {
  if (!payload || typeof payload !== 'object') {
    throw new Error('[deleteGameStatsDoc] payload is required')
  }

  if (!clean(payload.gameId) && !clean(payload.gameStatsDocId)) {
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
  return Math.max(0, n(value))
}

const isEmptyAggregateValue = value => {
  if (value === null || value === undefined || value === '') return true
  if (Array.isArray(value) && !value.length) return true

  const num = Number(value)
  return Number.isFinite(num) && num === 0
}

const keepAggregateMetaKey = key => {
  return [
    'id',
    'playerId',
    'teamId',
    'createdAt',
    'updatedAt',
  ].includes(key)
}

const compactAggregate = item => {
  return Object.entries(item || {}).reduce((acc, [key, value]) => {
    if (keepAggregateMetaKey(key)) {
      return {
        ...acc,
        [key]: value,
      }
    }

    if (isEmptyAggregateValue(value)) return acc

    return {
      ...acc,
      [key]: value,
    }
  }, {})
}

const resolveGameStatsDocId = ({ payload, game }) => {
  const fromPayload = clean(payload?.gameStatsDocId || payload?.statsDocId)
  const fromGame = clean(game?.statsDocId || game?.gameStatsDocId)
  const gameStatsDocId = fromPayload || fromGame

  if (!gameStatsDocId) {
    throw new Error('[deleteGameStatsDoc] missing gameStatsDocId')
  }

  return gameStatsDocId
}

const assertDocOwnership = ({
  payload,
  game,
  currentGameStats,
  gameId,
  teamId,
  gameStatsDocId,
}) => {
  const payloadGameId = clean(payload?.gameId)
  const payloadTeamId = clean(payload?.teamId)
  const docGameId = clean(currentGameStats?.gameId)
  const docTeamId = clean(currentGameStats?.teamId)
  const gameStatsDocIdFromGame = clean(game?.statsDocId || game?.gameStatsDocId)

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

const buildDeletedGameInfoItem = ({ current, now }) => {
  const {
    statsStatus,
    statsDocId,
    gameStatsDocId,
    statsUpdatedAt,
    ...base
  } = current || {}

  return {
    ...base,
    hasStats: false,
    statsDeletedAt: now,
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

  return compactAggregate(applyStatsRates(next))
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

  return compactAggregate(applyStatsRates(next))
}

const buildRollbackContext = ({ currentGameStats, resolvedGame, gameId, teamId, gameStatsDocId }) => {
  const savedTeamStats = currentGameStats?.teamStats || {}
  const gameDuration = n(savedTeamStats.timePlayed) || n(resolvedGame?.gameDuration)

  return {
    gameId,
    teamId,
    gameStatsDocId,
    gameDuration,
    timePlayed: n(savedTeamStats.timePlayed) || gameDuration,
    timeVideoStats:
      n(savedTeamStats.timeVideoStats) ||
      n(savedTeamStats.timePlayed) ||
      gameDuration,
  }
}

export async function deleteGameStatsDoc({
  payload,
  draft,
  dryRun = false,
} = {}) {
  const data = resolvePayload({ payload, draft })

  ensurePayload(data)

  const draftGameId = clean(data.gameId)
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
        gameStatsDocId: clean(data.gameStatsDocId || data.statsDocId) || null,
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

    const gameStatsDocId = resolveGameStatsDocId({ payload: data, game })
    const gameStatsRef = doc(gameStatsShortsRef, gameStatsDocId)
    const gameStatsSnap = await tx.get(gameStatsRef)

    if (!gameStatsSnap.exists()) {
      throw new Error(`[deleteGameStatsDoc] gameStats doc not found: ${gameStatsDocId}`)
    }

    const currentGameStats = gameStatsSnap.data() || {}

    const gameId = clean(data.gameId || currentGameStats.gameId)
    const teamId = clean(data.teamId || currentGameStats.teamId || game?.teamId)

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

    tx.delete(gameStatsRef)

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

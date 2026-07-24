// src/application/actions/gameStats/deleteGameStats.action.js

import {
  deleteGameStatsDoc,
  deletePrivatePlayerGameStatsDoc,
} from '../../../services/firestore/shorts/gameStats/index.js'
import { actionFailure, actionSuccess } from '../../shared/actionResult.js'

const clean = value => String(value || '').trim()

function isPrivatePlayerScope(payload) {
  return (
    payload?.scope === 'privatePlayer' ||
    payload?.source === 'privatePlayerProfile' ||
    payload?.meta?.scope === 'privatePlayer' ||
    payload?.meta?.source === 'privatePlayerProfile'
  )
}

function withStatsDocId(payload) {
  const gameStatsDocId = clean(payload?.gameStatsDocId || payload?.statsDocId)

  return {
    ...(payload || {}),
    ...(gameStatsDocId ? { gameStatsDocId } : {}),
  }
}

export async function deleteGameStats({ payload } = {}) {
  const normalizedPayload = withStatsDocId(payload)
  const metadata = {
    action: 'deleteGameStats',
    gameId: clean(normalizedPayload?.gameId) || null,
    gameStatsDocId: clean(normalizedPayload?.gameStatsDocId) || null,
  }

  try {
    const data = isPrivatePlayerScope(normalizedPayload)
      ? await deletePrivatePlayerGameStatsDoc({ payload: normalizedPayload })
      : await deleteGameStatsDoc({ payload: normalizedPayload })

    return actionSuccess({ data, metadata })
  } catch (error) {
    return actionFailure({ error, metadata })
  }
}

// src/application/actions/gameStats/loadGameStats.action.js

import { getGameStatsDoc } from '../../../services/firestore/shorts/gameStats/index.js'
import { actionFailure, actionSuccess } from '../../shared/actionResult.js'

export async function loadGameStats({ gameStatsDocId } = {}) {
  const metadata = {
    action: 'loadGameStats',
    gameStatsDocId: gameStatsDocId || null,
  }

  try {
    if (!gameStatsDocId) {
      throw new Error('[loadGameStats] gameStatsDocId is required')
    }

    const data = await getGameStatsDoc({ gameStatsDocId })
    return actionSuccess({ data, metadata })
  } catch (error) {
    return actionFailure({ error, metadata })
  }
}

// features/playersDatabase/services/write/flows/player/updatePlayerSeasonUrl.flow.js

import {
  updatePlayerSeasonUrl,
} from '../../players/index.js'
import {
  updatePlayerSeasonSearchIndexPlayerUrl,
} from '../../searchIndex/index.js'
import {
  updateTeamSeasonPlayerUrl,
} from '../../teams/index.js'

const buildSyncError = ({ stage, cause, results = {} }) => {
  const error = new Error(cause?.message || `Player season URL sync failed at ${stage}`)

  error.name = 'PlayerSeasonUrlSyncError'
  error.stage = stage
  error.cause = cause
  error.results = results

  return error
}

const assertTeamPlayerUpdated = result => {
  if (result?.updated) return

  const error = new Error('Player was not found in the selected team season')
  error.code = result?.reason || 'team-player-not-found'
  throw error
}

export async function updatePlayerSeasonUrlFlow(payload = {}) {
  const results = {}
  const player = {
    ...(payload.player || {}),
    playerUrl: payload.player?.playerUrl || payload.playerUrl || '',
  }
  const nextPayload = {
    ...payload,
    player,
    playerUrl: player.playerUrl,
  }

  try {
    results.teamSeasonResult = await updateTeamSeasonPlayerUrl(nextPayload)
    assertTeamPlayerUpdated(results.teamSeasonResult)
  } catch (error) {
    throw buildSyncError({
      stage: 'updateTeamSeasonPlayerUrl',
      cause: error,
      results,
    })
  }

  try {
    results.playerSeasonResult = await updatePlayerSeasonUrl(nextPayload)
  } catch (error) {
    throw buildSyncError({
      stage: 'updatePlayerSeasonUrl',
      cause: error,
      results,
    })
  }

  try {
    results.playerSeasonIndexResult = await updatePlayerSeasonSearchIndexPlayerUrl(nextPayload)
  } catch (error) {
    throw buildSyncError({
      stage: 'updatePlayerSeasonSearchIndexPlayerUrl',
      cause: error,
      results,
    })
  }

  return {
    ...results,
    playerUrl: player.playerUrl,
    rowsCount: 1,
    syncStatus: 'complete',
  }
}

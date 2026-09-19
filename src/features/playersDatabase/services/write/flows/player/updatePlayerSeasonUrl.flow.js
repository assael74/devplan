// src/features/playersDatabase/services/write/flows/player/updatePlayerSeasonUrl.flow.js

import { buildWriteFlowSyncError } from '../writeFlowSyncError.js'
import { updatePlayerSeasonUrl } from '../../players/index.js'
import { updatePlayerSeasonSearchIndexPlayerUrl } from '../../searchIndex/index.js'
import { updateTeamSeasonPlayerUrl } from '../../teams/index.js'


const assertTeamPlayerUpdated = result => {
  if (result?.updated) return

  const error = new Error('Player was not found in the selected team season')
  error.code = result?.reason || 'team-player-not-found'
  throw error
}

export async function updatePlayerSeasonUrlFlow(payload = {}) {
  const results = {}
  let teamCanonicalCommitted = false
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
    teamCanonicalCommitted = true
  } catch (error) {
    const syncError = buildWriteFlowSyncError({
      name: 'PlayerSeasonUrlSyncError',
      fallbackMessage: 'Player season URL sync failed',
      stage: 'updateTeamSeasonPlayerUrl',
      cause: error,
      results,
    })
    if (teamCanonicalCommitted) {
      syncError.teamCanonicalCommitted = true
      syncError.projectionsCompleted = false
      syncError.completed = false
      syncError.recoveryRequired = true
    }
    throw syncError
  }

  try {
    results.playerSeasonResult = await updatePlayerSeasonUrl(nextPayload)
  } catch (error) {
    const syncError = buildWriteFlowSyncError({
      name: 'PlayerSeasonUrlSyncError',
      fallbackMessage: 'Player season URL sync failed',
      stage: 'updatePlayerSeasonUrl',
      cause: error,
      results,
    })
    if (teamCanonicalCommitted) {
      syncError.teamCanonicalCommitted = true
      syncError.projectionsCompleted = false
      syncError.completed = false
      syncError.recoveryRequired = true
    }
    throw syncError
  }

  try {
    results.playerSeasonIndexResult = await updatePlayerSeasonSearchIndexPlayerUrl(nextPayload)
  } catch (error) {
    const syncError = buildWriteFlowSyncError({
      name: 'PlayerSeasonUrlSyncError',
      fallbackMessage: 'Player season URL sync failed',
      stage: 'updatePlayerSeasonSearchIndexPlayerUrl',
      cause: error,
      results,
    })
    syncError.teamCanonicalCommitted = true
    syncError.projectionsCompleted = false
    syncError.completed = false
    syncError.recoveryRequired = true
    throw syncError
  }

  return {
    ...results,
    teamCanonicalCommitted: true,
    projectionsCompleted: true,
    completed: true,
    recoveryRequired: false,
    playerUrl: player.playerUrl,
    rowsCount: 1,
    syncStatus: 'complete',
  }
}

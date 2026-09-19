// src/features/playersDatabase/services/write/flows/player/updatePlayerSeasonNotes.flow.js

import { buildWriteFlowSyncError } from '../writeFlowSyncError.js'
import { updatePlayerSeasonNotes } from '../../players/index.js'
import { updatePlayerSeasonSearchIndexNotes } from '../../searchIndex/index.js'


export async function updatePlayerSeasonNotesFlow(payload = {}) {
  const results = {}
  let playerCanonicalCommitted = false

  try {
    results.playerSeasonResult = await updatePlayerSeasonNotes(payload)
    playerCanonicalCommitted = true
  } catch (error) {
    const syncError = buildWriteFlowSyncError({
      name: 'PlayerSeasonNotesSyncError',
      fallbackMessage: 'Player season notes sync failed',
      stage: 'updatePlayerSeasonNotes',
      cause: error,
      results,
    })
    if (playerCanonicalCommitted) {
      syncError.playerCanonicalCommitted = true
      syncError.projectionsCompleted = false
      syncError.completed = false
      syncError.recoveryRequired = true
    }
    throw syncError
  }

  try {
    results.playerSeasonIndexResult = await updatePlayerSeasonSearchIndexNotes(payload)
  } catch (error) {
    const syncError = buildWriteFlowSyncError({
      name: 'PlayerSeasonNotesSyncError',
      fallbackMessage: 'Player season notes sync failed',
      stage: 'updatePlayerSeasonSearchIndexNotes',
      cause: error,
      results,
    })
    syncError.playerCanonicalCommitted = true
    syncError.projectionsCompleted = false
    syncError.completed = false
    syncError.recoveryRequired = true
    throw syncError
  }

  return {
    ...results,
    playerCanonicalCommitted: true,
    projectionsCompleted: true,
    completed: true,
    recoveryRequired: false,
    rowsCount: 1,
    syncStatus: 'complete',
  }
}

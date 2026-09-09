// features/playersDatabase/services/write/flows/player/updatePlayerSeasonNotes.flow.js

import { buildWriteFlowSyncError } from '../writeFlowSyncError.js'
import { updatePlayerSeasonNotes } from '../../players/index.js'
import { updatePlayerSeasonSearchIndexNotes } from '../../searchIndex/index.js'


export async function updatePlayerSeasonNotesFlow(payload = {}) {
  const results = {}

  try {
    results.playerSeasonResult = await updatePlayerSeasonNotes(payload)
  } catch (error) {
    throw buildWriteFlowSyncError({
      name: 'PlayerSeasonNotesSyncError',
      fallbackMessage: 'Player season notes sync failed',
      stage: 'updatePlayerSeasonNotes',
      cause: error,
      results,
    })
  }

  try {
    results.playerSeasonIndexResult = await updatePlayerSeasonSearchIndexNotes(payload)
  } catch (error) {
    throw buildWriteFlowSyncError({
      name: 'PlayerSeasonNotesSyncError',
      fallbackMessage: 'Player season notes sync failed',
      stage: 'updatePlayerSeasonSearchIndexNotes',
      cause: error,
      results,
    })
  }

  return {
    ...results,
    rowsCount: 1,
    syncStatus: 'complete',
  }
}

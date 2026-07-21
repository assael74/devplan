// features/playersDatabase/services/write/flows/player/updatePlayerSeasonNotes.flow.js

import {
  updatePlayerSeasonNotes,
} from '../../players/index.js'
import {
  updatePlayerSeasonSearchIndexNotes,
} from '../../searchIndex/index.js'

const buildSyncError = ({ stage, cause, results = {} }) => {
  const error = new Error(cause?.message || `Player season notes sync failed at ${stage}`)

  error.name = 'PlayerSeasonNotesSyncError'
  error.stage = stage
  error.cause = cause
  error.results = results

  return error
}

export async function updatePlayerSeasonNotesFlow(payload = {}) {
  const results = {}

  try {
    results.playerSeasonResult = await updatePlayerSeasonNotes(payload)
  } catch (error) {
    throw buildSyncError({
      stage: 'updatePlayerSeasonNotes',
      cause: error,
      results,
    })
  }

  try {
    results.playerSeasonIndexResult = await updatePlayerSeasonSearchIndexNotes(payload)
  } catch (error) {
    throw buildSyncError({
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

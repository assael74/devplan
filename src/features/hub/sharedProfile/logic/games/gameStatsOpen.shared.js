// src/features/hub/sharedProfile/logic/games/gameStatsOpen.shared.js

import {
  loadGameStats,
  unwrapActionResult,
} from '../../../application/index.js'

export async function loadProfileGameStats({
  gameStatsDocId,
  onLoadingChange,
  onLoaded,
  onMissing,
  onError,
  errorLabel = '[loadProfileGameStats] failed to load stats doc',
} = {}) {
  if (!gameStatsDocId) {
    if (typeof onMissing === 'function') onMissing()
    return null
  }

  if (typeof onLoadingChange === 'function') {
    onLoadingChange(true, 'טוען סטטיסטיקה שמורה...')
  }

  try {
    const result = await loadGameStats({ gameStatsDocId })
    const statsDoc = unwrapActionResult(result)

    if (!statsDoc) {
      if (typeof onMissing === 'function') onMissing()
      return null
    }

    if (typeof onLoaded === 'function') onLoaded(statsDoc)
    return statsDoc
  } catch (error) {
    console.error(errorLabel, error)

    if (typeof onError === 'function') onError(error)
    return null
  } finally {
    if (typeof onLoadingChange === 'function') {
      onLoadingChange(false, '')
    }
  }
}

// src/features/playersDatabase/services/write/searchIndex/player/playerSeasonIndex.snapshot.js

import {
  buildPlayerStatsSnapshot,
  hasPlayerStatsSnapshotData,
} from '../../../../model/playerStatsSnapshot.model.js'

const clean = value => String(value || '').trim()

const buildExistingSnapshot = existingData => {
  const storedCurrent = existingData?.statsSnapshots?.current

  if (storedCurrent?.snapshotKey) return storedCurrent

  const fallback = buildPlayerStatsSnapshot({
    source: existingData,
    capturedAt: clean(existingData?.updatedAt),
  })

  return hasPlayerStatsSnapshotData(fallback) ? fallback : null
}

export const buildPlayerSeasonStatsSnapshots = ({ existingData = {}, nextStats = {} } = {}) => {
  const current = buildPlayerStatsSnapshot({
    source: nextStats,
    capturedAt: new Date().toISOString(),
  })
  const existingCurrent = buildExistingSnapshot(existingData)
  const storedPrevious = existingData?.statsSnapshots?.previous || null
  const unchanged = existingCurrent?.snapshotKey === current.snapshotKey

  if (unchanged) {
    return {
      previous: storedPrevious,
      current: existingCurrent,
      changed: false,
    }
  }

  return {
    previous: existingCurrent,
    current,
    changed: true,
  }
}

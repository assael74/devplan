// src/features/playersDatabase/services/write/searchIndex/player/playerSeasonIndex.snapshot.js

const toNumber = value => Number.isFinite(Number(value)) ? Number(value) : 0

const clean = value => String(value || '').trim()

const buildSnapshotKey = snapshot => [
  snapshot.teamGamePlayed,
  snapshot.games,
  snapshot.goals,
  snapshot.minutes,
  snapshot.starts,
  snapshot.substituteIn,
  snapshot.substitutedOut,
].join('|')

const buildSnapshot = ({ source = {}, capturedAt = '' } = {}) => {
  const snapshot = {
    capturedAt: clean(capturedAt),
    teamGamePlayed: toNumber(source.teamGamePlayed || source.teamGames),
    games: toNumber(source.games),
    goals: toNumber(source.goals),
    minutes: toNumber(source.minutes),
    starts: toNumber(source.starts),
    substituteIn: toNumber(source.substituteIn),
    substitutedOut: toNumber(source.substitutedOut),
  }

  return {
    ...snapshot,
    snapshotKey: buildSnapshotKey(snapshot),
  }
}

const hasSnapshotData = snapshot => Boolean(
  snapshot.teamGamePlayed ||
  snapshot.games ||
  snapshot.goals ||
  snapshot.minutes ||
  snapshot.starts ||
  snapshot.substituteIn ||
  snapshot.substitutedOut
)

const buildExistingSnapshot = existingData => {
  const storedCurrent = existingData?.statsSnapshots?.current

  if (storedCurrent?.snapshotKey) return storedCurrent

  const fallback = buildSnapshot({
    source: existingData,
    capturedAt: clean(existingData?.updatedAt),
  })

  return hasSnapshotData(fallback) ? fallback : null
}

export const buildPlayerSeasonStatsSnapshots = ({ existingData = {}, nextStats = {} } = {}) => {
  const capturedAt = new Date().toISOString()
  const current = buildSnapshot({
    source: nextStats,
    capturedAt,
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

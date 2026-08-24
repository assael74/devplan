// src/features/playersDatabase/model/playerScoutMeasurement.model.js

import { buildPlayerStatsSnapshot } from './playerStatsSnapshot.model.js'
import { pickDefinedValue } from './value.model.js'

const clean = value => String(value || '').trim()

const toNullableNumber = value => {
  if (value === null || value === undefined || value === '') return null

  const numberValue = Number(value)
  return Number.isFinite(numberValue) ? numberValue : null
}

const normalizeProfileState = (state = {}) => ({
  profileId: clean(state.profileId),
  matched: Boolean(state.matched),
  depth: toNullableNumber(state.depth),
  distance: toNullableNumber(state.distance),
})

const buildProfileStates = player => {
  const signals = Array.isArray(player?.scoutProfiles)
    ? player.scoutProfiles
    : Array.isArray(player?.scoutSignals)
      ? player.scoutSignals
      : []
  const distances = Array.isArray(player?.scoutProfileProgression?.distances)
    ? player.scoutProfileProgression.distances
    : []
  const states = new Map()

  signals.forEach(signal => {
    const profileId = clean(signal?.profileId || signal?.id)
    if (!profileId) return

    states.set(profileId, {
      profileId,
      matched: true,
      depth: toNullableNumber(signal?.profileDepth?.depth),
      distance: 0,
    })
  })

  distances.forEach(distance => {
    const profileId = clean(distance?.profileId)
    if (!profileId) return

    const existing = states.get(profileId) || {}
    states.set(profileId, {
      profileId,
      matched: Boolean(existing.matched || distance?.matched),
      depth: toNullableNumber(existing.depth),
      distance: toNullableNumber(distance?.distance),
    })
  })

  return [...states.values()].map(normalizeProfileState)
}

export const normalizePlayerScoutStatsLoadMeasurement = measurement => {
  if (!measurement || typeof measurement !== 'object') return null

  const snapshotKey = clean(measurement.snapshotKey)
  if (!snapshotKey) return null

  return {
    snapshotKey,
    loadType: clean(measurement.loadType),
    capturedAt: clean(measurement.capturedAt),
    engineVersion: clean(measurement.engineVersion),
    primaryProfileId: clean(measurement.primaryProfileId),
    profileIds: (Array.isArray(measurement.profileIds) ? measurement.profileIds : [])
      .map(clean)
      .filter(Boolean),
    profileStates: (Array.isArray(measurement.profileStates) ? measurement.profileStates : [])
      .map(normalizeProfileState)
      .filter(state => state.profileId),
  }
}

export const normalizePlayerScoutStatsLoadMeasurements = measurements => ({
  previous: normalizePlayerScoutStatsLoadMeasurement(measurements?.previous),
  current: normalizePlayerScoutStatsLoadMeasurement(measurements?.current),
})


const measurementIdentityKey = measurement => {
  const normalized = normalizePlayerScoutStatsLoadMeasurement(measurement)
  if (!normalized) return ''

  return [normalized.snapshotKey, normalized.engineVersion].join('__')
}

export const normalizePlayerScoutStatsLoadMeasurementHistory = history => {
  const values = Array.isArray(history) ? history : []
  const normalized = []
  const indexesByKey = new Map()

  values.forEach(measurement => {
    const nextMeasurement = normalizePlayerScoutStatsLoadMeasurement(measurement)
    if (!nextMeasurement) return

    const key = measurementIdentityKey(nextMeasurement)
    if (!key) return

    if (indexesByKey.has(key)) {
      normalized[indexesByKey.get(key)] = nextMeasurement
      return
    }

    indexesByKey.set(key, normalized.length)
    normalized.push(nextMeasurement)
  })

  return normalized
}

export const buildPlayerScoutStatsLoadMeasurementHistory = ({ existingHistory = [], measurements = {} } = {}) => (
  normalizePlayerScoutStatsLoadMeasurementHistory([
    ...normalizePlayerScoutStatsLoadMeasurementHistory(existingHistory),
    measurements?.previous,
    measurements?.current,
  ])
)

export const buildPlayerScoutStatsLoadMeasurementsFromHistory = history => {
  const normalized = normalizePlayerScoutStatsLoadMeasurementHistory(history)
  const current = normalized.length
    ? normalized[normalized.length - 1]
    : null
  const previous = normalized.length > 1
    ? normalized[normalized.length - 2]
    : null

  return {
    previous,
    current,
  }
}

export const PLAYER_SCOUT_MEASUREMENT_HISTORY_EVENT = Object.freeze({
  PROFILE_REGAINED: 'profile_regained',
  PROFILE_LOST_AFTER_STREAK: 'profile_lost_after_streak',
  PROFILE_RETAINED_STREAK: 'profile_retained_streak',
})

const resolveMeasurementProfileMatched = (measurement, profileId) => {
  const normalizedProfileId = clean(profileId)
  if (!measurement || !normalizedProfileId) return false

  if ((Array.isArray(measurement.profileIds) ? measurement.profileIds : []).includes(normalizedProfileId)) {
    return true
  }

  return (Array.isArray(measurement.profileStates) ? measurement.profileStates : []).some(state => (
    clean(state?.profileId) === normalizedProfileId && state?.matched === true
  ))
}

const isComparableMeasurementPair = (left, right) => {
  const leftVersion = clean(left?.engineVersion)
  const rightVersion = clean(right?.engineVersion)

  return Boolean(leftVersion && rightVersion && leftVersion === rightVersion)
}

const resolveMatchedStreakEndingAt = ({ history, profileId, endIndex }) => {
  if (!Array.isArray(history) || endIndex < 0 || !history[endIndex]) return 0

  const engineVersion = clean(history[endIndex].engineVersion)
  let count = 0

  for (let index = endIndex; index >= 0; index -= 1) {
    const measurement = history[index]
    if (clean(measurement?.engineVersion) !== engineVersion) break
    if (!resolveMeasurementProfileMatched(measurement, profileId)) break
    count += 1
  }

  return count
}

const findEarlierMatchedIndex = ({ history, profileId, beforeIndex, engineVersion }) => {
  for (let index = beforeIndex; index >= 0; index -= 1) {
    const measurement = history[index]
    if (clean(measurement?.engineVersion) !== engineVersion) break
    if (resolveMeasurementProfileMatched(measurement, profileId)) return index
  }

  return -1
}

const buildHistoryEvent = ({
  type,
  profileId,
  history,
  currentIndex,
  measurementCount,
}) => {
  const current = history[currentIndex] || null
  const startIndex = Math.max(0, currentIndex - Math.max(1, measurementCount) + 1)
  const start = history[startIndex] || null

  return {
    id: [type, profileId, clean(current?.snapshotKey)].filter(Boolean).join('__'),
    type,
    profileId,
    measurementCount,
    startIndex,
    currentIndex,
    startCapturedAt: clean(start?.capturedAt),
    endCapturedAt: clean(current?.capturedAt),
    engineVersion: clean(current?.engineVersion),
  }
}

export const buildPlayerScoutStatsLoadMeasurementHistoryEvents = history => {
  const normalized = normalizePlayerScoutStatsLoadMeasurementHistory(history)
  if (normalized.length < 3) return []

  const profileIds = new Set()
  normalized.forEach(measurement => {
    const measuredProfileIds = Array.isArray(measurement.profileIds)
      ? measurement.profileIds
      : []
    const profileStates = Array.isArray(measurement.profileStates)
      ? measurement.profileStates
      : []

    measuredProfileIds.forEach(profileId => {
      const value = clean(profileId)
      if (value) profileIds.add(value)
    })

    profileStates.forEach(state => {
      const value = clean(state?.profileId)
      if (value) profileIds.add(value)
    })
  })

  const events = []

  profileIds.forEach(profileId => {
    for (let index = 1; index < normalized.length; index += 1) {
      const previous = normalized[index - 1]
      const current = normalized[index]
      if (!isComparableMeasurementPair(previous, current)) continue

      const previousMatched = resolveMeasurementProfileMatched(previous, profileId)
      const currentMatched = resolveMeasurementProfileMatched(current, profileId)

      if (previousMatched && !currentMatched) {
        const retainedCount = resolveMatchedStreakEndingAt({
          history: normalized,
          profileId,
          endIndex: index - 1,
        })

        if (retainedCount >= 2) {
          events.push(buildHistoryEvent({
            type: PLAYER_SCOUT_MEASUREMENT_HISTORY_EVENT.PROFILE_LOST_AFTER_STREAK,
            profileId,
            history: normalized,
            currentIndex: index,
            measurementCount: retainedCount + 1,
          }))
        }

        continue
      }

      if (!previousMatched && currentMatched) {
        const earlierMatchedIndex = findEarlierMatchedIndex({
          history: normalized,
          profileId,
          beforeIndex: index - 2,
          engineVersion: clean(current.engineVersion),
        })

        if (earlierMatchedIndex >= 0) {
          events.push(buildHistoryEvent({
            type: PLAYER_SCOUT_MEASUREMENT_HISTORY_EVENT.PROFILE_REGAINED,
            profileId,
            history: normalized,
            currentIndex: index,
            measurementCount: index - earlierMatchedIndex + 1,
          }))
        }
      }
    }

    const lastIndex = normalized.length - 1
    const currentStreak = resolveMatchedStreakEndingAt({
      history: normalized,
      profileId,
      endIndex: lastIndex,
    })

    if (currentStreak >= 3) {
      events.push(buildHistoryEvent({
        type: PLAYER_SCOUT_MEASUREMENT_HISTORY_EVENT.PROFILE_RETAINED_STREAK,
        profileId,
        history: normalized,
        currentIndex: lastIndex,
        measurementCount: currentStreak,
      }))
    }
  })

  return events
    .filter(event => event.id)
    .sort((left, right) => right.currentIndex - left.currentIndex)
}

export const buildPreviousProfileDistancesFromMeasurement = measurement => {
  const normalized = normalizePlayerScoutStatsLoadMeasurement(measurement)
  if (!normalized) return []

  return normalized.profileStates
    .filter(state => Number.isFinite(state.distance))
    .map(state => ({
      profileId: state.profileId,
      distance: state.distance,
    }))
}

export const buildPlayerScoutStatsLoadMeasurement = ({ player = {}, team = {}, capturedAt = '' } = {}) => {
  const statsSnapshot = buildPlayerStatsSnapshot({
    source: {
      ...player,
      teamGamePlayed: pickDefinedValue(
        team.teamStats?.teamGamePlayed,
        team.teamGamePlayed,
        player.playerStats?.teamGames,
      ),
    },
    capturedAt,
  })
  const profileIds = (Array.isArray(player.scoutProfiles) ? player.scoutProfiles : [])
    .map(profile => clean(profile?.profileId || profile?.id))
    .filter(Boolean)
  const primaryProfileId = clean(
    player.scoutProfileHierarchy?.primaryProfileId ||
    player.bestScoutSignal?.profileId
  )

  return {
    snapshotKey: statsSnapshot.snapshotKey,
    capturedAt: statsSnapshot.capturedAt,
    engineVersion: clean(player.scoutEngineVersion),
    primaryProfileId,
    profileIds,
    profileStates: buildProfileStates(player),
  }
}

export const buildPlayerScoutStatsLoadMeasurements = ({ existingMeasurements = {}, player = {}, team = {} } = {}) => {
  const stored = normalizePlayerScoutStatsLoadMeasurements(existingMeasurements)
  const current = buildPlayerScoutStatsLoadMeasurement({
    player,
    team,
    capturedAt: new Date().toISOString(),
  })
  const unchanged = Boolean(
    stored.current?.snapshotKey &&
    stored.current.snapshotKey === current.snapshotKey &&
    stored.current.engineVersion === current.engineVersion
  )

  if (unchanged) return stored

  return {
    previous: stored.current,
    current,
  }
}

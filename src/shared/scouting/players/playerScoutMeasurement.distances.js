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

const normalizePlayerScoutStatsLoadMeasurement = measurement => {
  if (!measurement || typeof measurement !== 'object') return null
  const snapshotKey = clean(measurement.snapshotKey)
  if (!snapshotKey) return null
  return {
    snapshotKey,
    loadType: clean(measurement.loadType),
    capturedAt: clean(measurement.capturedAt),
    engineVersion: clean(measurement.engineVersion),
    primaryProfileId: clean(measurement.primaryProfileId),
    profileIds: (Array.isArray(measurement.profileIds) ? measurement.profileIds : []).map(clean).filter(Boolean),
    profileStates: (Array.isArray(measurement.profileStates) ? measurement.profileStates : [])
      .map(normalizeProfileState).filter(state => state.profileId),
  }
}

export const buildPreviousProfileDistancesFromMeasurement = measurement => {
  const normalized = normalizePlayerScoutStatsLoadMeasurement(measurement)
  if (!normalized) return []
  return normalized.profileStates
    .filter(state => Number.isFinite(state.distance))
    .map(state => ({ profileId: state.profileId, distance: state.distance }))
}

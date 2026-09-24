const normalizeFingerprintValue = value => {
  if (value === undefined) return null
  if (value === null || typeof value !== 'object') return value
  if (typeof value.toMillis === 'function') return { __timestampMillis: value.toMillis() }
  if (Array.isArray(value)) return value.map(normalizeFingerprintValue)

  return Object.keys(value)
    .sort()
    .reduce((result, key) => {
      result[key] = normalizeFingerprintValue(value[key])
      return result
    }, {})
}

export const buildStatsSourceFingerprint = value => JSON.stringify(
  normalizeFingerprintValue(value)
)

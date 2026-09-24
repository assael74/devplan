const normalizeFingerprintValue = value => {
  if (value === undefined) return null
  if (value === null) return null

  if (Array.isArray(value)) return value.map(normalizeFingerprintValue)

  if (value && typeof value.toMillis === 'function') {
    return { __timestampMillis: value.toMillis() }
  }

  if (value && typeof value === 'object') {
    return Object.keys(value)
      .sort()
      .reduce((result, key) => ({
        ...result,
        [key]: normalizeFingerprintValue(value[key]),
      }), {})
  }

  return value
}

export const buildRosterSourceFingerprint = value => (
  JSON.stringify(normalizeFingerprintValue(value))
)

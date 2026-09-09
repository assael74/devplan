export const normalizeComparableValue = (value, { omitKeys = [] } = {}) => {
  const omittedKeys = new Set(omitKeys)

  if (Array.isArray(value)) {
    return value.map(item => normalizeComparableValue(item, { omitKeys }))
  }

  if (
    value &&
    typeof value === 'object' &&
    Object.getPrototypeOf(value) === Object.prototype
  ) {
    return Object.keys(value)
      .sort()
      .reduce((result, key) => {
        if (omittedKeys.has(key)) return result
        result[key] = normalizeComparableValue(value[key], { omitKeys })
        return result
      }, {})
  }

  return value
}

export const areComparableValuesEqual = (left, right, options = {}) => (
  JSON.stringify(normalizeComparableValue(left, options)) ===
  JSON.stringify(normalizeComparableValue(right, options))
)

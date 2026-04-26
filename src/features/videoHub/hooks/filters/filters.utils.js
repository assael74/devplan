// videoHub/components/filters/hooks/filters.utils.js

export const safeId = (v) => (v == null ? '' : String(v))
export const safeStr = (v) => (v == null ? '' : String(v))

export const normalizeToArray = (val) =>
  Array.isArray(val) ? val : val ? [val] : []

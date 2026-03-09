// src/ui/sort/sort.utils.js

export const safeStr = (v) => (v == null ? '' : String(v))

export const findOptionLabel = (options, value, fallback = 'מיון') => {
  const val = safeStr(value)
  const opt = (Array.isArray(options) ? options : []).find((o) => safeStr(o?.value) === val)
  return opt?.label || fallback
}

// ui/forms/helpers/meetingsForm.helpers.js

const toText = (v) => String(v ?? '').trim()
const toNumOrNull = (v) => {
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

const toBoolOrNull = (v) => {
  if (typeof v === 'boolean') return v
  return null
}

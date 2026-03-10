// ui/fields/selectUi/clubs/logic/clubSelect.logic.js

const clean = (v) => String(v ?? '').trim()

export function normalizeClub(c, fallbackImage) {
  const clubName = clean(c?.clubName)

  return {
    value: clean(c?.id),
    label: clubName || 'מועדון',
    avatar: c?.photo || fallbackImage,
    clubName,
    raw: c,
  }
}

export function buildOptions(options = [], fallbackImage) {
  const arr = (options || [])
    .map((c) => normalizeClub(c, fallbackImage))
    .filter((x) => x.value)

  return arr.sort((a, b) => (a.label || '').localeCompare(b.label || '', 'he'))
}

export function findSelected(value, normalizedOptions = []) {
  const id = clean(value)
  if (!id) return null
  return normalizedOptions.find((o) => o.value === id) || null
}

export function formatAff(clubName) {
  const c = clean(clubName)
  if (!c) return ''
  return c
}

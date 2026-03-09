// ui/fields/selectUi/players/logic/playerSelect.logic.js
const clean = (v) => String(v ?? '').trim()

export function normalizePlayer(p, fallbackImage) {
  const fullName = [p?.playerFirstName, p?.playerLastName]
    .filter(Boolean)
    .join(' ')
    .trim()

  return {
    value: clean(p?.id),
    label: clean(fullName || p?.fullName || p?.name) || 'שחקן',
    avatar: p?.photo || p?.playerPhoto || fallbackImage,
    teamId: clean(p?.teamId || p?.team?.id),
    teamName: clean(p?.team?.teamName || p?.teamName),
    clubName: clean(p?.club?.clubName || p?.clubName),
    raw: p,
  }
}

export function buildOptions(options = [], teamId, fallbackImage) {
  const tid = clean(teamId)

  const arr = options
    .map((p) => normalizePlayer(p, fallbackImage))
    .filter((x) => x.value)

  const filtered = tid ? arr.filter((x) => x.teamId === tid) : arr

  return filtered.sort((a, b) =>
    (a.label || '').localeCompare(b.label || '', 'he')
  )
}

export function findSelected(value, normalizedOptions) {
  const id = clean(value)
  if (!id) return null
  return normalizedOptions.find((o) => o.value === id) || null
}

export function formatAff(teamName, clubName) {
  const t = clean(teamName)
  const c = clean(clubName)
  if (!t && !c) return ''
  if (t && c) return `${t} • ${c}`
  return t || c
}

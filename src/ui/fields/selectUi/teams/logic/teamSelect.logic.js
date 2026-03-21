// ui/fields/selectUi/teams/logic/teamSelect.logic.js
const clean = (v) => String(v ?? '').trim()

export function normalizeTeam(t) {
  const teamName = [t?.teamName, t?.teamYear]
    .filter(Boolean)
    .join(' ')
    .trim()

  return {
    value: clean(t?.id),
    label: clean(teamName || t?.fullName || t?.name) || 'שחקן',
    avatar: t?.photo,
    clubId: clean(t?.clubId || t?.club?.id),
    clubName: clean(t?.club?.clubName || t?.clubName),
    club: t.club,
    raw: t,
  }
}

export function buildOptions(options = [], clubId) {
  const cid = clean(clubId)

  const arr = options.map((t) => normalizeTeam(t)).filter((x) => x.value)

  const filtered = cid ? arr.filter((x) => x.clubId === cid) : arr

  return filtered.sort((a, b) => (a.label || '').localeCompare(b.label || '', 'he'))
}

export function findSelected(value, normalizedOptions) {
  const id = clean(value)
  if (!id) return null
  return normalizedOptions.find((o) => o.value === id) || null
}

export function formatAff(clubName) {
  const c = clean(clubName)
  if (!c) return ''
  if (c) return `${c}`
  return c
}

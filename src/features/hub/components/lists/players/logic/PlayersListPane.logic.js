const toText = (v) => (v == null ? '' : String(v)).trim()
const norm = (s) => toText(s).toLowerCase()

export function getBirthYear(p) {
  if (p?.birth == null) return ''
  return String(p.birth)
}

export function getFullName(p) {
  const full = toText(p?.fullName)
  if (full) return full
  const fn = toText(p?.playerFirstName || p?.firstName)
  const ln = toText(p?.playerLastName || p?.lastName)
  return toText(`${fn} ${ln}`) || toText(p?.playerName)
}

export function filterPlayers(players, { q, projectOnly, keyOnly, activeOnly }) {
  const nq = norm(q)

  return (players || []).filter((p) => {
    if (activeOnly && p?.active === false) return false
    if (projectOnly && p?.type !== 'project') return false
    if (keyOnly && p?.isKey !== true) return false

    if (nq) {
      const hay = norm([
        getFullName(p),
        getBirthYear(p),
        p?.idNumber,
        p?.ifaLink,
      ].filter(Boolean).join(' | '))
      if (!hay.includes(nq)) return false
    }

    return true
  })
}

export function buildActiveFilterChips({ q, projectOnly, keyOnly, activeOnly }) {
  const chips = []
  if (q) chips.push({ key: 'q', label: `חיפוש: ${q}` })
  if (projectOnly) chips.push({ key: 'projectOnly', label: 'פרויקט בלבד' })
  if (keyOnly) chips.push({ key: 'keyOnly', label: 'שחקני מפתח בלבד' })
  if (!activeOnly) chips.push({ key: 'activeOnly', label: 'כולם' })
  return chips
}

export function existsInList(list, id) {
  if (!id) return false
  return (list || []).some((p) => String(p?.id) === String(id))
}

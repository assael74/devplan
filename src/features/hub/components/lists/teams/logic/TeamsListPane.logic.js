const toText = (v) => (v == null ? '' : String(v)).trim()
const norm = (s) => toText(s).toLowerCase()

export function getTeamYear(p) {
  if (p?.teamYear == null) return ''
  return String(p.teamYear)
}

export function getTeamName(p) {
  if (p?.teamName == null) return ''
  return String(p.teamName)
}

export function filterTeams(teams, { q, projectOnly, activeOnly }) {
  const nq = norm(q)

  return (teams || []).filter((p) => {
    if (activeOnly && p?.active === false) return false
    if (projectOnly && p?.project === false) return false

    if (nq) {
      const hay = norm([
        getTeamName(p),
        getTeamYear(p),
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
  if (!activeOnly) chips.push({ key: 'activeOnly', label: 'כולם' })
  return chips
}

export function existsInList(list, id) {
  if (!id) return false
  return (list || []).some((p) => String(p?.id) === String(id))
}

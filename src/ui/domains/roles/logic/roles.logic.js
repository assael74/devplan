// src/ui/domains/roles/logic/roles.logic.js

export const asArray = (value) => (Array.isArray(value) ? value : [])
export const norm = (value) => String(value ?? '').trim()
export const normLower = (value) => norm(value).toLowerCase()

export const uniq = (arr) => Array.from(new Set(asArray(arr).filter(Boolean)))

export const removeOne = (arr, value) => asArray(arr).filter((x) => x !== value)

export function buildMembershipPatch(role, { teamId, clubId }, mode) {
  const patch = {}

  if (teamId) {
    patch.teamsId =
      mode === 'add'
        ? uniq([...(role?.teamsId || []), teamId])
        : removeOne(role?.teamsId || [], teamId)
  }

  if (clubId) {
    patch.clubsId =
      mode === 'add'
        ? uniq([...(role?.clubsId || []), clubId])
        : removeOne(role?.clubsId || [], clubId)
  }

  return patch
}

export function pickRoleId(role) {
  return norm(role?.id)
}

export function createRoleFilters() {
  return {
    search: '',
    roleType: 'all',
    contact: 'all',
    assignment: 'all',
    team: 'all',
  }
}

export function hasRoleContact(row) {
  return !!(norm(row?.phone) || norm(row?.email))
}

export function hasRoleAssignment(row) {
  return asArray(row?.teamsId).length > 0 || asArray(row?.clubsId).length > 0
}

export function filterRoleRows(rows = [], filters = {}) {
  const search = normLower(filters?.search)
  const roleType = norm(filters?.roleType || 'all')
  const contact = norm(filters?.contact || 'all')
  const assignment = norm(filters?.assignment || 'all')
  const team = norm(filters?.team || 'all')

  return asArray(rows).filter((row) => {
    const haystack = [
      row?.fullName,
      row?.roleLabel,
      row?.type,
      row?.phone,
      row?.email,
      ...(row?.assignmentLabels || []),
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()

    const passSearch = !search || haystack.includes(search)
    const passRole = roleType === 'all' || norm(row?.type) === roleType

    const hasContact = hasRoleContact(row)
    const passContact =
      contact === 'ok' ? hasContact :
      contact === 'missing' ? !hasContact :
      true

    const teamsId = asArray(row?.teamsId).map(norm)
    const clubsId = asArray(row?.clubsId).map(norm)
    const hasTeams = teamsId.length > 0
    const hasClubs = clubsId.length > 0
    const hasAssignment = hasTeams || hasClubs
    const passAssignment =
      assignment === 'linked' ? hasAssignment :
      assignment === 'missing' ? !hasAssignment :
      assignment === 'teams' ? hasTeams :
      assignment === 'clubs' ? hasClubs :
      true
    const passTeam = team === 'all' || teamsId.includes(team)

    return passSearch && passRole && passContact && passAssignment && passTeam
  })
}

export function buildRoleSummary(rows = []) {
  const list = asArray(rows)

  const summary = {
    total: list.length,
    withContact: 0,
    missingContact: 0,
    linked: 0,
    missingAssignment: 0,
    withTeams: 0,
    withClubs: 0,
    byRoleType: {},
  }

  list.forEach((row) => {
    const type = norm(row?.type || 'unknown')
    const hasTeams = asArray(row?.teamsId).length > 0
    const hasClubs = asArray(row?.clubsId).length > 0

    if (hasRoleContact(row)) summary.withContact += 1
    else summary.missingContact += 1

    if (hasTeams || hasClubs) summary.linked += 1
    else summary.missingAssignment += 1

    if (hasTeams) summary.withTeams += 1
    if (hasClubs) summary.withClubs += 1

    summary.byRoleType[type] = (summary.byRoleType[type] || 0) + 1
  })

  return summary
}

export function buildRoleOptions(rows = []) {
  const map = new Map()

  asArray(rows).forEach((row) => {
    const id = norm(row?.type)
    const label = norm(row?.roleLabel) || id
    if (!id) return
    if (!map.has(id)) map.set(id, { id, label })
  })

  return [{ id: 'all', label: 'כל התפקידים' }, ...Array.from(map.values())]
}

export function buildTeamOptions(rows = []) {
  const map = new Map()

  asArray(rows).forEach((row) => {
    asArray(row?.teamsId).forEach((id, index) => {
      const cleanId = norm(id)
      const label = norm(row?.teamLabels?.[index]) || cleanId
      if (!cleanId) return
      if (!map.has(cleanId)) map.set(cleanId, { id: cleanId, label })
    })
  })

  return [{ id: 'all', label: 'כל הקבוצות' }, ...Array.from(map.values())]
}

export const ROLE_CONTACT_OPTIONS = [
  { id: 'all', label: 'כל מצבי הקשר' },
  { id: 'ok', label: 'יש קשר' },
  { id: 'missing', label: 'חסר קשר' },
]

export const ROLE_ASSIGNMENT_OPTIONS = [
  { id: 'all', label: 'כל מצבי השיוך' },
  { id: 'linked', label: 'משויך' },
  { id: 'missing', label: 'חסר שיוך' },
  { id: 'teams', label: 'משויך לקבוצה' },
  { id: 'clubs', label: 'משויך למועדון' },
]

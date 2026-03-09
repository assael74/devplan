// C:\projects\devplan\src\ui\domains\staff\logic\staff.logic.js

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

export function formatPhoneIl(phone) {
  const raw = norm(phone).replace(/[^\d+]/g, '')
  if (!raw) return ''
  return raw
}

export function createDefaultStaffFilters() {
  return {
    search: '',
    roleType: 'all',
    contact: 'all',
  }
}

export function hasStaffContact(row) {
  return !!(norm(row?.phone) || norm(row?.email))
}

export function filterStaffRows(rows = [], filters = {}) {
  const search = normLower(filters?.search)
  const roleType = norm(filters?.roleType || 'all')
  const contact = norm(filters?.contact || 'all')

  return asArray(rows).filter((row) => {
    const haystack = [
      row?.fullName,
      row?.roleLabel,
      row?.type,
      row?.phone,
      row?.email,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()

    const passSearch = !search || haystack.includes(search)
    const passRole = roleType === 'all' || norm(row?.type) === roleType

    const hasContact = hasStaffContact(row)
    const passContact =
      contact === 'ok' ? hasContact :
      contact === 'missing' ? !hasContact :
      true

    return passSearch && passRole && passContact
  })
}

export function buildStaffSummary(rows = []) {
  const list = asArray(rows)

  const summary = {
    total: list.length,
    withContact: 0,
    missingContact: 0,
    byRoleType: {},
  }

  list.forEach((row) => {
    const type = norm(row?.type || 'unknown')

    if (hasStaffContact(row)) summary.withContact += 1
    else summary.missingContact += 1

    summary.byRoleType[type] = (summary.byRoleType[type] || 0) + 1
  })

  return summary
}

export function buildStaffRoleOptions(rows = []) {
  const map = new Map()

  asArray(rows).forEach((row) => {
    const id = norm(row?.type)
    const label = norm(row?.roleLabel) || id
    if (!id) return
    if (!map.has(id)) map.set(id, { id, label })
  })

  return [{ id: 'all', label: 'כל התפקידים' }, ...Array.from(map.values())]
}

export const STAFF_CONTACT_OPTIONS = [
  { id: 'all', label: 'הכל' },
  { id: 'ok', label: 'יש קשר' },
  { id: 'missing', label: 'חסר קשר' },
]

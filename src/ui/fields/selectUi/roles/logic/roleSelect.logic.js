// ui/fields/selectUi/roles/logic/roleSelect.logic.js
import roleImage from '../../../../core/images/roleImage.png'
import { STAFF_ROLE_OPTIONS } from '../../../../../shared/roles/roles.constants.js'

const clean = (v) => String(v ?? '').trim()
const META_ROLES_MAP = new Map(STAFF_ROLE_OPTIONS.map((opt) => [opt.id, opt]))

export function getFirstTeam(r) {
  const teams = Array.isArray(r?.teams) ? r.teams : []
  return teams[0] || null
}

export function getFirstClub(r) {
  const clubs = Array.isArray(r?.clubs) ? r.clubs : []
  return clubs[0] || null
}

export function buildGroupKey({ clubName, teamName }) {
  if (clubName) return `מועדון: ${clubName}`
  if (teamName) return `קבוצה: ${teamName}`
  return 'ללא שיוך'
}

export function sortGroups(groupKey) {
  if (groupKey.startsWith('מועדון:')) return `1_${groupKey}`
  if (groupKey.startsWith('קבוצה:')) return `2_${groupKey}`
  return `3_${groupKey}`
}

export function formatAff(teamName, clubName) {
  const t = clean(teamName)
  const c = clean(clubName)
  if (!t && !c) return ''
  if (t && c) return `${t} • ${c}`
  return t || c
}

export function normalizeRole(r, fallbackImage = roleImage) {
  const team = getFirstTeam(r)
  const club = getFirstClub(r)

  const fullName = clean(r?.fullName || r?.fulltName || r?.name)
  const type = clean(r?.type)
  const meta = META_ROLES_MAP.get(type)

  const teamName = clean(team?.teamName)
  const clubName = clean(club?.clubName)

  return {
    value: clean(r?.id),
    label: fullName || 'איש מקצוע',
    avatar: r?.photo || fallbackImage,

    type,
    roleLabelH: clean(meta?.labelH || ''),
    roleIconId: clean(meta?.idIcon || ''),

    teamName,
    clubName,
    groupKey: buildGroupKey({ clubName, teamName }),

    raw: r,
  }
}

export function buildOptions(options = []) {
  const arr = (Array.isArray(options) ? options : [])
    .map((r) => normalizeRole(r))
    .filter((x) => x.value)

  return arr.sort((a, b) => {
    const ga = sortGroups(a.groupKey)
    const gb = sortGroups(b.groupKey)
    if (ga < gb) return -1
    if (ga > gb) return 1
    return (a.label || '').localeCompare(b.label || '', 'he')
  })
}

export function findSelected(value, normalizedOptions) {
  const id = clean(value)
  if (!id) return null
  return normalizedOptions.find((o) => o.value === id) || null
}

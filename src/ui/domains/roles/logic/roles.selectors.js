// src/ui/domains/roles/logic/roles.selectors.js

import { pickRoleId } from './roles.logic.js'
import { STAFF_ROLE_OPTIONS } from '../../../../shared/roles/roles.constants.js'

const roleMetaMap = new Map(STAFF_ROLE_OPTIONS.map((item) => [item.id, item]))

const safeArray = value => Array.isArray(value) ? value : []

const getEntityId = entity => {
  return String(entity?.id || entity?.teamId || entity?.clubId || '').trim()
}

const getTeamLabel = team => {
  return team?.teamName || team?.name || team?.label || 'קבוצה ללא שם'
}

const getClubLabel = club => {
  return club?.clubName || club?.name || club?.label || 'מועדון ללא שם'
}

const buildLookup = (items, getLabel) => {
  const map = new Map()

  safeArray(items).forEach(item => {
    const id = getEntityId(item)
    if (!id) return
    map.set(id, getLabel(item))
  })

  return map
}

export function normalizeRoleRow(role, context = {}) {
  const type = String(role?.type || '')
  const meta = roleMetaMap.get(type) || {}
  const teamsId = safeArray(role?.teamsId)
  const clubsId = safeArray(role?.clubsId)
  const teamsById = context?.teamsById || new Map()
  const clubsById = context?.clubsById || new Map()

  const teamLabels = teamsId.map(id => teamsById.get(id) || 'קבוצה לא מזוהה')
  const clubLabels = clubsId.map(id => clubsById.get(id) || 'מועדון לא מזוהה')

  return {
    id: role?.id || '',
    fullName: role?.fullName || 'ללא שם',
    phone: role?.phone || '',
    email: role?.email || '',
    photo: role?.photo || '',
    type,
    roleLabel: role?.roleLabel || meta.labelH || 'ללא תפקיד',
    roleIcon: meta.idIcon || 'role',
    teamsId,
    clubsId,
    teamLabels,
    clubLabels,
    assignmentLabels: [...teamLabels, ...clubLabels],
    raw: role,
  }
}

export function buildRoleRows({ roles = [], teamId, clubId, context = {} }) {
  const list = Array.isArray(roles) ? roles : []
  const normalizedContext = {
    teamsById: buildLookup(context?.teams, getTeamLabel),
    clubsById: buildLookup(context?.clubs, getClubLabel),
  }

  return list
    .filter((role) => {
      if (teamId) return Array.isArray(role?.teamsId) && role.teamsId.includes(teamId)
      if (clubId) return Array.isArray(role?.clubsId) && role.clubsId.includes(clubId)
      return true
    })
    .map(role => normalizeRoleRow(role, normalizedContext))
}

export function buildExcludeIds(roleRows = []) {
  return (Array.isArray(roleRows) ? roleRows : [])
    .map((item) => pickRoleId(item?.raw || item))
    .filter(Boolean)
}

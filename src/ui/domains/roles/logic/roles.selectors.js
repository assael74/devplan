// src/ui/domains/roles/logic/roles.selectors.js

import { pickRoleId } from './roles.logic.js'
import { STAFF_ROLE_OPTIONS } from '../../../../shared/roles/roles.constants.js'

const roleMetaMap = new Map(STAFF_ROLE_OPTIONS.map((item) => [item.id, item]))

export function normalizeRoleRow(role) {
  const type = String(role?.type || '')
  const meta = roleMetaMap.get(type) || {}

  return {
    id: role?.id || '',
    fullName: role?.fullName || '—',
    phone: role?.phone || '',
    email: role?.email || '',
    photo: role?.photo || '',
    type,
    roleLabel: role?.roleLabel || meta.labelH || 'ללא תפקיד',
    teamsId: Array.isArray(role?.teamsId) ? role.teamsId : [],
    clubsId: Array.isArray(role?.clubsId) ? role.clubsId : [],
    raw: role,
  }
}

export function buildRoleRows({ roles = [], teamId, clubId }) {
  const list = Array.isArray(roles) ? roles : []

  return list
    .filter((role) => {
      if (teamId) return Array.isArray(role?.teamsId) && role.teamsId.includes(teamId)
      if (clubId) return Array.isArray(role?.clubsId) && role.clubsId.includes(clubId)
      return true
    })
    .map(normalizeRoleRow)
}

export function buildExcludeIds(roleRows = []) {
  return (Array.isArray(roleRows) ? roleRows : [])
    .map((item) => pickRoleId(item?.raw || item))
    .filter(Boolean)
}

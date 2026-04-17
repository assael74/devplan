// preview/PreviewDomainCard/domains/staff/club/clubStaff.domain.logic

import { DOMAIN_STATE } from '../../../../preview.state'
import { STAFF_ROLE_OPTIONS } from '../../../../../../../../../shared/roles/roles.constants'

const safe = (v) => (v == null ? '' : String(v))
const hasText = (v) => safe(v).trim().length > 0

const roleLabelById = (id) => STAFF_ROLE_OPTIONS.find((o) => o.id === id)?.labelH || 'תפקיד לא ידוע'

const normalizeRole = (r) => ({
  id: safe(r?.id),
  active: !!r?.active,
  clubId: safe(r?.clubId),
  teamsId: Array.isArray(r?.teamsId) ? r.teamsId.map(safe).filter(Boolean) : [],
  type: safe(r?.type),
  roleLabel: roleLabelById(r?.type),
  fullName: safe(r?.fullName),
  phone: safe(r?.phone),
  email: safe(r?.email),
  photo: safe(r?.photo),
})

const buildTypeStats = (roles = []) => {
  const map = new Map()
  for (const r of roles) {
    const key = safe(r.type) || 'unknown'
    if (!map.has(key)) map.set(key, { type: key, label: roleLabelById(key), total: 0, active: 0 })
    const x = map.get(key)
    x.total += 1
    if (r.active) x.active += 1
  }
  return Array.from(map.values()).sort((a, b) => b.total - a.total)
}

export const resolveStaffDomain = (club) => {
  const base = Array.isArray(club?.roles) ? club.roles : []
  const roles = base.map(normalizeRole).filter((r) => r.id)

  const total = roles.length
  const active = roles.filter((r) => r.active).length
  const withPhone = roles.filter((r) => hasText(r.phone)).length
  const withEmail = roles.filter((r) => hasText(r.email)).length

  const missingPhone = total - withPhone
  const missingEmail = total - withEmail

  // “חסר קשר” = אין טלפון וגם אין אימייל
  const missingContact = roles.filter((r) => !hasText(r.phone) && !hasText(r.email)).length

  const coaches = roles.filter((r) => r.type === 'coach').length
  const assistants = roles.filter((r) => r.type === 'assistant').length

  const typeStats = buildTypeStats(roles)

  let state = DOMAIN_STATE.EMPTY
  if (!total) state = DOMAIN_STATE.EMPTY
  else if (missingContact > 0 || missingPhone > 0 || missingEmail > 0) state = DOMAIN_STATE.PARTIAL
  else state = DOMAIN_STATE.OK

  return {
    state,
    summary: {
      total,
      active,
      withPhone,
      withEmail,
      missingPhone,
      missingEmail,
      missingContact,
      coaches,
      assistants,
      topType: typeStats[0] || null,
    },
    roles,
    typeStats,
  }
}

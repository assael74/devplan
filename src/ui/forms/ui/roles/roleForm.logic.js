// src/ui/forms/ui/roles/roleForm.logic.js

export const ROLE_STATUS_OPTIONS = [
  { id: 'pending', label: 'ממתין לאישור' },
  { id: 'active', label: 'פעיל' },
  { id: 'inactive', label: 'לא פעיל' },
]

export const SYSTEM_ACCESS_OPTIONS = [
  { id: '', label: 'ללא הרשאת מערכת' },
  { id: 'admin', label: 'מנהל מערכת' },
  { id: 'external', label: 'משתמש חיצוני' },
]

export const MODULE_ROLE_OPTIONS = [
  { id: 'owner', label: 'מנהל' },
  { id: 'editor', label: 'עריכה' },
  { id: 'viewer', label: 'צפייה' },
]

export const asIdArray = (v) => {
  return Array.isArray(v) ? v.filter(Boolean).map(String) : []
}

export const uniqIds = (arr) => {
  return [...new Set(asIdArray(arr))]
}

export function buildRoleDraft(source = {}) {
  return {
    fullName: source?.fullName || '',
    type: source?.type || '',

    active: source?.active ?? true,
    status: source?.status || 'active',

    authUid: source?.authUid || '',

    clubsId: asIdArray(source?.clubsId),
    teamsId: asIdArray(source?.teamsId),

    phone: source?.phone || '',
    email: source?.email || '',

    systemAccess: {
      level: source?.systemAccess?.level || '',
    },

    moduleAccess: {
      squadSimulator: {
        enabled: Boolean(source?.moduleAccess?.squadSimulator?.enabled),
        role: source?.moduleAccess?.squadSimulator?.role || 'owner',
      },
    },
  }
}

export function isRoleCreateValid(draft = {}) {
  return String(draft?.fullName || '').trim().length >= 2
}

export function buildRoleCreateDraft(draft = {}) {
  return {
    fullName: draft.fullName || '',
    type: draft.type || '',

    active: draft.active ?? true,
    status: draft.status || 'active',

    authUid: draft.authUid || '',

    clubsId: uniqIds(draft.clubsId),
    teamsId: uniqIds(draft.teamsId),

    phone: draft.phone || '',
    email: draft.email || '',

    systemAccess: {
      level: draft?.systemAccess?.level || '',
    },

    moduleAccess: {
      squadSimulator: {
        enabled: Boolean(draft?.moduleAccess?.squadSimulator?.enabled),
        role: draft?.moduleAccess?.squadSimulator?.role || 'owner',
      },
    },

    source: draft?.source || 'manual',
  }
}

export function buildRolePatch(draft = {}, baseline = {}) {
  const patch = {}

  if (draft.fullName !== baseline.fullName) patch.fullName = draft.fullName
  if (draft.type !== baseline.type) patch.type = draft.type
  if (draft.active !== baseline.active) patch.active = draft.active
  if (draft.status !== baseline.status) patch.status = draft.status
  if (draft.authUid !== baseline.authUid) patch.authUid = draft.authUid

  if (!sameIds(draft.clubsId, baseline.clubsId)) patch.clubsId = uniqIds(draft.clubsId)
  if (!sameIds(draft.teamsId, baseline.teamsId)) patch.teamsId = uniqIds(draft.teamsId)

  if (draft.phone !== baseline.phone) patch.phone = draft.phone
  if (draft.email !== baseline.email) patch.email = draft.email

  const nextSystemLevel = draft?.systemAccess?.level || ''
  const baseSystemLevel = baseline?.systemAccess?.level || ''
  if (nextSystemLevel !== baseSystemLevel) {
    patch.systemAccess = { level: nextSystemLevel }
  }

  const nextSimulator = draft?.moduleAccess?.squadSimulator || {}
  const baseSimulator = baseline?.moduleAccess?.squadSimulator || {}

  if (
    Boolean(nextSimulator.enabled) !== Boolean(baseSimulator.enabled) ||
    String(nextSimulator.role || '') !== String(baseSimulator.role || '')
  ) {
    patch.squadSimulatorAccess = {
      enabled: Boolean(nextSimulator.enabled),
      role: nextSimulator.role || 'owner',
    }
  }

  return patch
}

function sameIds(a, b) {
  const A = uniqIds(a).sort()
  const B = uniqIds(b).sort()

  if (A.length !== B.length) return false
  for (let i = 0; i < A.length; i++) {
    if (A[i] !== B[i]) return false
  }

  return true
}

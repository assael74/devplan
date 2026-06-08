// src/shared/access/authAccess.logic.js

const safe = (value) => String(value ?? '').trim()
const safeLower = (value) => safe(value).toLowerCase()

const SUPER_ADMIN_EMAILS = [
  'assael74@gmail.com',
]

export function isSuperAdminAuthUser(firebaseUser) {
  const email = safeLower(firebaseUser?.email)

  return Boolean(email && SUPER_ADMIN_EMAILS.includes(email))
}

export function isApprovedRole(role) {
  return Boolean(
    role &&
    role.active !== false &&
    String(role.status || 'active') === 'active'
  )
}

function isUsableModuleRole(role) {
  return Boolean(
    role &&
    role.active !== false &&
    String(role.status || '').toLowerCase() !== 'inactive'
  )
}

export function isRoleLinkedToAuthUser(role, firebaseUser) {
  if (!role || !firebaseUser) return false

  const uid = safe(firebaseUser.uid)
  const email = safeLower(firebaseUser.email)

  const roleAuthUid = safe(role.authUid)
  const roleEmail = safeLower(role.email)

  if (uid && roleAuthUid && uid === roleAuthUid) return true
  if (email && roleEmail && email === roleEmail) return true

  return false
}

export function getAuthUserRoles(firebaseUser, roles = []) {
  if (!firebaseUser || !Array.isArray(roles)) return []

  return roles.filter(role => isRoleLinkedToAuthUser(role, firebaseUser))
}

export function isApprovedAuthUser(firebaseUser, roles = []) {
  if (isSuperAdminAuthUser(firebaseUser)) return true

  const userRoles = getAuthUserRoles(firebaseUser, roles)

  return userRoles.some(isApprovedRole)
}

export function isAdminAuthUser(firebaseUser, roles = []) {
  if (isSuperAdminAuthUser(firebaseUser)) return true

  const userRoles = getAuthUserRoles(firebaseUser, roles)

  return userRoles.some(role => {
    return (
      isApprovedRole(role) &&
      String(role.systemAccess?.level || '') === 'admin'
    )
  })
}

export function canAccessSquadSimulator(firebaseUser, roles = []) {
  if (isAdminAuthUser(firebaseUser, roles)) return true

  const userRoles = getAuthUserRoles(firebaseUser, roles)

  return userRoles.some(role => {
    const teamIds = Array.isArray(role?.teamsId) ? role.teamsId.filter(Boolean) : []

    return (
      isUsableModuleRole(role) &&
      Boolean(role?.moduleAccess?.squadSimulator?.enabled) &&
      teamIds.length > 0
    )
  })
}

export function getSquadSimulatorTeamIds(firebaseUser, roles = []) {
  if (!firebaseUser || !Array.isArray(roles)) return []

  const userRoles = getAuthUserRoles(firebaseUser, roles)
  const ids = userRoles.flatMap(role => {
    if (!isUsableModuleRole(role)) return []
    if (!role?.moduleAccess?.squadSimulator?.enabled) return []

    return Array.isArray(role?.teamsId) ? role.teamsId.filter(Boolean) : []
  })

  return [...new Set(ids.map(String))]
}

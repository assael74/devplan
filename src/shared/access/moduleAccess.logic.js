// src/shared/access/moduleAccess.logic.js

import { APP_MODULES } from './appModules.js'

export function isActiveRole(role) {
  return Boolean(role?.active !== false && role?.status !== 'inactive')
}

export function getRoleTeamIds(role) {
  if (Array.isArray(role?.teamsId)) return role.teamsId.filter(Boolean)
  if (role?.teamId) return [role.teamId]

  return []
}

export function roleHasModuleAccess(role, moduleId) {
  return Boolean(role?.moduleAccess?.[moduleId]?.enabled)
}

export function resolveUserModuleAccess({ user, roles }) {
  if (!user || user?.status === 'blocked') return createEmptyUserAccess(user)

  const userRoles = getUserActiveRoles(user, roles)
  const squadRoles = userRoles.filter(role => {
    return roleHasModuleAccess(role, APP_MODULES.SQUAD_SIMULATOR)
  })

  const teamIds = uniqueIds(squadRoles.flatMap(getRoleTeamIds))

  return {
    userId: user?.id || null,
    authUid: user?.authUid || null,
    modules: {
      [APP_MODULES.SQUAD_SIMULATOR]: {
        enabled: teamIds.length > 0,
        role: 'owner',
        scope: {
          type: 'team',
          teamIds,
          defaultTeamId: teamIds[0] || null,
        },
      },
    },
  }
}

export function canAccessModule(access, moduleId) {
  return Boolean(access?.modules?.[moduleId]?.enabled)
}

export function getModuleScope(access, moduleId) {
  return access?.modules?.[moduleId]?.scope || null
}

export function getModuleTeamIds(access, moduleId) {
  const scope = getModuleScope(access, moduleId)

  if (scope?.type !== 'team') return []

  return Array.isArray(scope.teamIds) ? scope.teamIds : []
}

export function canAccessTeamInModule(access, moduleId, teamId) {
  if (!teamId) return false

  const teamIds = getModuleTeamIds(access, moduleId)

  return teamIds.map(String).includes(String(teamId))
}

function getUserActiveRoles(user, roles) {
  if (!Array.isArray(roles)) return []

  return roles.filter(role => {
    return (
      isActiveRole(role) &&
      isSameUserRole(user, role)
    )
  })
}

function isSameUserRole(user, role) {
  if (!user || !role) return false

  if (user.id && role.userId) {
    return String(user.id) === String(role.userId)
  }

  if (user.authUid && role.authUid) {
    return String(user.authUid) === String(role.authUid)
  }

  if (user.email && role.email) {
    return String(user.email).toLowerCase() === String(role.email).toLowerCase()
  }

  return false
}

function uniqueIds(ids) {
  return [...new Set((ids || []).filter(Boolean).map(String))]
}

function createEmptyUserAccess(user) {
  return {
    userId: user?.id || null,
    authUid: user?.authUid || null,
    modules: {},
  }
}

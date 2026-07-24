// src/app/routes/routeAccess.js

import { canAccessSquadSimulator, isAdminAuthUser } from '../../shared/access/index.js'

export const ROUTE_ACCESS_STATE = {
  authLoading: 'authLoading',
  signedOut: 'signedOut',
  accessLoading: 'accessLoading',
  pendingApproval: 'pendingApproval',
  admin: 'admin',
  squadSimulator: 'squadSimulator',
}

export function resolveRouteAccess({
  user,
  authLoading,
  accessLoading,
  roles = [],
}) {
  if (authLoading) {
    return {
      state: ROUTE_ACCESS_STATE.authLoading,
      isAdmin: false,
      canUseSquadSimulator: false,
      canEnterAnyArea: false,
    }
  }

  if (!user) {
    return {
      state: ROUTE_ACCESS_STATE.signedOut,
      isAdmin: false,
      canUseSquadSimulator: false,
      canEnterAnyArea: false,
    }
  }

  const isAdmin = isAdminAuthUser(user, roles)
  const canUseSquadSimulator = canAccessSquadSimulator(user, roles)
  const canEnterAnyArea = isAdmin || canUseSquadSimulator

  if (accessLoading && !isAdmin) {
    return {
      state: ROUTE_ACCESS_STATE.accessLoading,
      isAdmin,
      canUseSquadSimulator,
      canEnterAnyArea,
    }
  }

  if (!canEnterAnyArea) {
    return {
      state: ROUTE_ACCESS_STATE.pendingApproval,
      isAdmin,
      canUseSquadSimulator,
      canEnterAnyArea,
    }
  }

  return {
    state: isAdmin
      ? ROUTE_ACCESS_STATE.admin
      : ROUTE_ACCESS_STATE.squadSimulator,
    isAdmin,
    canUseSquadSimulator,
    canEnterAnyArea,
  }
}

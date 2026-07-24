// src/app/routes/AppRoutes.js

import React from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'

import { useAuth } from '../../features/auth'
import { useCoreData } from '../../features/coreData/CoreDataProvider'
import buildReportsPublicRoutes from './ReportsPublicRoutes.js'
import renderAuthenticatedRoutes from './AuthenticatedRoutes'
import { lazyRoute, LoadingScreen } from './routeUi'
import {
  AbilitiesPublicRouteEntry,
  ADMIN_ROUTE_LOADERS,
  ForgotPasswordPage,
  LoginPage,
  PendingApprovalPage,
  preloadRoutes,
  PublicReportPage,
  RegisterPage,
  SQUAD_ROUTE_LOADERS,
} from './routeComponents'
import { PUBLIC_ROUTES, ROUTE_REDIRECTS } from './routeCatalog'
import { resolveRouteAccess, ROUTE_ACCESS_STATE } from './routeAccess'

export default function AppRoutes() {
  const { user, loading } = useAuth()
  const { roles = [], accessLoading } = useCoreData()

  const routeAccess = resolveRouteAccess({
    user,
    authLoading: loading,
    accessLoading,
    roles,
  })

  React.useEffect(() => {
    if (!user || accessLoading) return undefined

    const loaders = routeAccess.isAdmin ? ADMIN_ROUTE_LOADERS : SQUAD_ROUTE_LOADERS
    const runPreload = () => preloadRoutes(loaders)

    if (typeof window === 'undefined') {
      runPreload()
      return undefined
    }

    if (typeof window.requestIdleCallback === 'function') {
      const id = window.requestIdleCallback(runPreload, { timeout: 4000 })

      return () => {
        window.cancelIdleCallback?.(id)
      }
    }

    const id = window.setTimeout(runPreload, 1200)

    return () => {
      window.clearTimeout(id)
    }
  }, [accessLoading, routeAccess.isAdmin, user])

  if (routeAccess.state === ROUTE_ACCESS_STATE.authLoading) {
    return <LoadingScreen label='טוען התחברות...' />
  }

  return (
    <Routes>
      <Route
        path={PUBLIC_ROUTES.abilitiesForm}
        element={lazyRoute(<AbilitiesPublicRouteEntry />)}
      />

      {buildReportsPublicRoutes({
        lazyRoute,
        PublicReportPage,
      })}

      {routeAccess.state === ROUTE_ACCESS_STATE.signedOut ? (
        <>
          <Route path={PUBLIC_ROUTES.login} element={lazyRoute(<LoginPage />)} />
          <Route path={PUBLIC_ROUTES.register} element={lazyRoute(<RegisterPage />)} />
          <Route
            path={PUBLIC_ROUTES.forgotPassword}
            element={lazyRoute(<ForgotPasswordPage />)}
          />
          <Route path='/' element={<Navigate to={ROUTE_REDIRECTS.signedOut} replace />} />
          <Route path='*' element={<Navigate to={ROUTE_REDIRECTS.signedOut} replace />} />
        </>
      ) : routeAccess.state === ROUTE_ACCESS_STATE.accessLoading ? (
        <Route path='*' element={<LoadingScreen label='טוען נתונים...' />} />
      ) : routeAccess.state === ROUTE_ACCESS_STATE.pendingApproval ? (
        <>
          <Route
            path={PUBLIC_ROUTES.pendingApproval}
            element={lazyRoute(<PendingApprovalPage />)}
          />
          <Route
            path='*'
            element={<Navigate to={ROUTE_REDIRECTS.pendingApproval} replace />}
          />
        </>
      ) : (
        renderAuthenticatedRoutes({ isAdmin: routeAccess.isAdmin })
      )}
    </Routes>
  )
}

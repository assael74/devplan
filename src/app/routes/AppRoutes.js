// src/app/routes/AppRoutes.js

// src/app/routes/AppRoutes.js

import React from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { Box, Typography, CircularProgress, Button } from '@mui/joy'

import { useAuth } from '../AuthProvider'
import { useNotificationsContext } from '../NotificationsProvider'
import { useCoreData } from '../../features/coreData/CoreDataProvider'
import {
  canAccessSquadSimulator,
  isAdminAuthUser,
} from '../../shared/access/index.js'

import AppLayout from '../layout/AppLayout'
import TopBar from '../../ui/core/layout/TopBar'

import NotificationsBell from '../../features/notifications/components/NotificationsBell'
import NotificationsDrawer from '../../features/notifications/components/NotificationsDrawer'

import DefaultSkeleton from '../../ui/loading/pages/DefaultSkeleton.js'
import HomeSkeleton from '../../ui/loading/pages/HomeSkeleton.js'
import HubSkeleton from '../../ui/loading/pages/HubSkeleton.js'
import CalendarSkeleton from '../../ui/loading/pages/CalendarSkeleton.js'
import VideoSkeleton from '../../ui/loading/pages/VideoSkeleton.js'
import TagsSkeleton from '../../ui/loading/pages/TagsSkeleton.js'
import ProfileSkeleton from '../../ui/loading/pages/ProfileSkeleton.js'
import SimulatorSkeleton from '../../ui/loading/pages/SimulatorSkeleton.js'

const loadHomePage = () => import('../../features/home/HomePage')

const loadCalendarHubPage = () => import('../../features/calendarHub/CalendarHubPage')

const loadVideoHubPage = () => import('../../features/videoHub/VideoHubPage')

const loadTagsManagementPage = () => import('../../features/tagsHub/TagsManagementPage.js')

const loadPlayersDatabasePage = () => import('../../features/playersDatabase/index.js')

const loadPlayersDatabaseLeaguePage = () => {
  return import('../../features/playersDatabase/index.js').then(module => ({
    default: module.LeaguePage,
  }))
}

const loadPlayersDatabaseScanPage = () => {
  return import('../../features/playersDatabase/index.js').then(module => ({
    default: module.ScanCenterPage,
  }))
}

const loadHubPage = () => import('../../features/hub/ui/HubPage')

const loadPlayerProfilePage = () => import('../../features/hub/playerProfile/PlayerProfilePage')

const loadTeamProfilePage = () => import('../../features/hub/teamProfile/TeamProfilePage')

const loadClubProfilePage = () => import('../../features/hub/clubProfile/ClubProfilePage')

const loadAbilitiesPublicRouteEntry = () => import('./AbilitiesPublicRouteEntry.js')

const loadInsightsPage = () => import('../../features/insightsHub/InsightsPage.js')

const loadAbilitiesExplainerPage = () => {
  return import('../../features/abilities/explainer/AbilitiesExplainerPage.js')
}

const loadLoginPage = () => import('../../features/auth/pages/LoginPage')

const loadRegisterPage = () => import('../../features/auth/pages/RegisterPage')

const loadForgotPasswordPage = () => import('../../features/auth/pages/ForgotPasswordPage')

const loadPendingApprovalPage = () => import('../../features/auth/pages/PendingApprovalPage')

const loadSquadSimulatorPage = () => {
  return import('../../features/squadSimulator/index.js').then(module => ({
    default: module.SquadSimulatorPage,
  }))
}

const loadLiveTaggingPanel = () => {
  return import('../../features/liveTagging/index.js').then(module => ({
    default: module.LiveTaggingPanel,
  }))
}

const loadFirestoreUsagePage = () => {
  return import('../../features/firestoreUsage/FirestoreUsagePage.js')
}

const loadReportsDevPage = () => {
  return import('../../dev/reports/index.js').then(module => ({
    default: module.ReportsDevPage,
  }))
}

const HomePage = React.lazy(loadHomePage)
const CalendarHubPage = React.lazy(loadCalendarHubPage)
const VideoHubPage = React.lazy(loadVideoHubPage)
const TagsManagementPage = React.lazy(loadTagsManagementPage)
const PlayersDatabasePage = React.lazy(loadPlayersDatabasePage)
const PlayersDatabaseLeaguePage = React.lazy(loadPlayersDatabaseLeaguePage)
const PlayersDatabaseScanPage = React.lazy(loadPlayersDatabaseScanPage)

const HubPage = React.lazy(loadHubPage)
const PlayerProfilePage = React.lazy(loadPlayerProfilePage)
const TeamProfilePage = React.lazy(loadTeamProfilePage)
const ClubProfilePage = React.lazy(loadClubProfilePage)

const AbilitiesPublicRouteEntry = React.lazy(loadAbilitiesPublicRouteEntry)
const InsightsPage = React.lazy(loadInsightsPage)
const AbilitiesExplainerPage = React.lazy(loadAbilitiesExplainerPage)

const LoginPage = React.lazy(loadLoginPage)
const RegisterPage = React.lazy(loadRegisterPage)
const ForgotPasswordPage = React.lazy(loadForgotPasswordPage)
const PendingApprovalPage = React.lazy(loadPendingApprovalPage)

const SquadSimulatorPage = React.lazy(loadSquadSimulatorPage)
const LiveTaggingPanel = React.lazy(loadLiveTaggingPanel)
const FirestoreUsagePage = React.lazy(loadFirestoreUsagePage)
const ReportsDevPage = React.lazy(loadReportsDevPage)

const ADMIN_ROUTE_LOADERS = [
  loadHubPage,
  loadCalendarHubPage,
  loadVideoHubPage,
  loadTagsManagementPage,
  loadLiveTaggingPanel,
  loadFirestoreUsagePage,
  loadReportsDevPage,
]

const SQUAD_ROUTE_LOADERS = [
  loadSquadSimulatorPage,
]

function preloadRoutes(loaders) {
  loaders.forEach(loader => {
    loader().catch(() => {})
  })
}

function LoadingScreen({ label = 'טוען...' }) {
  return (
    <Box sx={{ p: 6, textAlign: 'center' }}>
      <CircularProgress size="lg" />

      <Typography level="body-md" sx={{ mt: 2 }}>
        {label}
      </Typography>
    </Box>
  )
}

function lazyRoute(element, fallback = <DefaultSkeleton />) {
  return (
    <React.Suspense fallback={fallback}>
      {element}
    </React.Suspense>
  )
}

function TopBarNotificationsHost() {
  const navigate = useNavigate()
  const { logout } = useAuth()

  const {
    open,
    toggleNotifications,
    closeNotifications,
    notifications,
    unreadCount,
    loading,
    pendingIds,
    markAsRead,
    markAllAsRead,
    getNotificationTarget,
    deleteNotification,
  } = useNotificationsContext()

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  const handleMarkAsRead = async item => {
    if (!item?.id || item?.isRead) return

    await markAsRead(item.id)
  }

  const handleOpenTarget = async item => {
    if (!item) return

    if (!item.isRead) {
      await markAsRead(item.id)
    }

    const target = getNotificationTarget(item)

    if (!target?.path) return

    navigate(target.path, {
      replace: Boolean(target.replace),
    })

    closeNotifications()
  }

  const handleDeleteNotification = async item => {
    if (!item?.id || !deleteNotification) return

    await deleteNotification(item.id)
  }

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Button
          size="sm"
          variant="soft"
          color="neutral"
          onClick={handleLogout}
        >
          התנתקות
        </Button>

        <NotificationsBell
          unreadCount={unreadCount}
          onClick={toggleNotifications}
        />
      </Box>

      <NotificationsDrawer
        open={open}
        onClose={closeNotifications}
        notifications={notifications}
        unreadCount={unreadCount}
        loading={loading}
        pendingIds={pendingIds}
        onMarkAsRead={handleMarkAsRead}
        onOpenTarget={handleOpenTarget}
        onDelete={handleDeleteNotification}
        onMarkAllAsRead={markAllAsRead}
      />
    </>
  )
}

export default function AppRoutes() {
  const { user, loading } = useAuth()
  const { roles = [], accessLoading } = useCoreData()

  const isAdmin = user ? isAdminAuthUser(user, roles) : false
  const canUseSquadSimulator = user ? canAccessSquadSimulator(user, roles) : false
  const canEnterAnyArea = isAdmin || canUseSquadSimulator

  React.useEffect(() => {
    if (!user || accessLoading) return undefined

    const loaders = isAdmin ? ADMIN_ROUTE_LOADERS : SQUAD_ROUTE_LOADERS
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
  }, [accessLoading, isAdmin, user])

  if (loading) {
    return <LoadingScreen label="טוען התחברות..." />
  }

  return (
    <Routes>
      <Route
        path="/forms/abilities/:token"
        element={lazyRoute(<AbilitiesPublicRouteEntry />)}
      />

      {!user ? (
        <>
          <Route
            path="/login"
            element={lazyRoute(<LoginPage />)}
          />

          <Route
            path="/register"
            element={lazyRoute(<RegisterPage />)}
          />

          <Route
            path="/forgot-password"
            element={lazyRoute(<ForgotPasswordPage />)}
          />

          <Route
            path="/"
            element={<Navigate to="/login" replace />}
          />

          <Route
            path="*"
            element={<Navigate to="/login" replace />}
          />
        </>
      ) : accessLoading && !isAdmin ? (
        <Route
          path="*"
          element={<LoadingScreen label="טוען נתונים..." />}
        />
      ) : !canEnterAnyArea ? (
        <>
          <Route
            path="/pending-approval"
            element={lazyRoute(<PendingApprovalPage />)}
          />

          <Route
            path="*"
            element={<Navigate to="/pending-approval" replace />}
          />
        </>
      ) : (
        <Route
          element={
            <AppLayout
              navMode={isAdmin ? 'full' : 'squadSimulator'}
              topbar={
                <TopBar
                  title="DevPlan"
                  right={<TopBarNotificationsHost />}
                />
              }
              navBadges={{ players: 108, teams: 7, clubs: 3 }}
            />
          }
        >
          {isAdmin ? (
            <>
              <Route
                path="/login"
                element={<Navigate to="/home" replace />}
              />

              <Route
                path="/register"
                element={<Navigate to="/home" replace />}
              />

              <Route
                path="/forgot-password"
                element={<Navigate to="/home" replace />}
              />

              <Route
                path="/pending-approval"
                element={<Navigate to="/home" replace />}
              />

              <Route
                path="/"
                element={<Navigate to="/home" replace />}
              />

              <Route
                path="/home"
                element={lazyRoute(<HomePage />, <HomeSkeleton />)}
              />

              <Route
                path="/hub"
                element={lazyRoute(<HubPage />, <HubSkeleton />)}
              />

              <Route
                path="/calendar"
                element={lazyRoute(<CalendarHubPage />, <CalendarSkeleton />)}
              />

              <Route
                path="/video"
                element={lazyRoute(<VideoHubPage />, <VideoSkeleton />)}
              />

              <Route
                path="/tags"
                element={lazyRoute(<TagsManagementPage />, <TagsSkeleton />)}
              />

              <Route
                path="/players-database"
                element={lazyRoute(<PlayersDatabasePage />)}
              />

              <Route
                path="/players-database/scan"
                element={lazyRoute(<PlayersDatabaseScanPage />)}
              />

              <Route
                path="/players-database/leagues/:leagueId"
                element={lazyRoute(<PlayersDatabaseLeaguePage />)}
              />

              <Route
                path="/liveTagging"
                element={lazyRoute(<LiveTaggingPanel />)}
              />

              <Route
                path="/abilities/explainer"
                element={lazyRoute(<AbilitiesExplainerPage />)}
              />

              <Route
                path="/insights/explainer"
                element={lazyRoute(<InsightsPage />)}
              />

              <Route
                path="/squad-simulator"
                element={lazyRoute(<SquadSimulatorPage />, <SimulatorSkeleton />)}
              />

              <Route
                path="/admin/firestore-usage"
                element={lazyRoute(<FirestoreUsagePage />)}
              />

              <Route
                path="/dev/reports"
                element={lazyRoute(<ReportsDevPage />)}
              />

              <Route
                path="/clubs/:clubId"
                element={lazyRoute(<ClubProfilePage />, <ProfileSkeleton />)}
              />

              <Route
                path="/clubs/:clubId/:tabKey"
                element={lazyRoute(<ClubProfilePage />, <ProfileSkeleton />)}
              />

              <Route
                path="/teams/:teamId"
                element={lazyRoute(<TeamProfilePage />, <ProfileSkeleton />)}
              />

              <Route
                path="/teams/:teamId/:tabKey"
                element={lazyRoute(<TeamProfilePage />, <ProfileSkeleton />)}
              />

              <Route
                path="/players/:playerId"
                element={lazyRoute(<PlayerProfilePage />, <ProfileSkeleton />)}
              />

              <Route
                path="/players/:playerId/:tabKey"
                element={lazyRoute(<PlayerProfilePage />, <ProfileSkeleton />)}
              />

              <Route
                path="*"
                element={<Navigate to="/hub" replace />}
              />
            </>
          ) : (
            <>
              <Route
                path="/login"
                element={<Navigate to="/squad-simulator" replace />}
              />

              <Route
                path="/register"
                element={<Navigate to="/squad-simulator" replace />}
              />

              <Route
                path="/forgot-password"
                element={<Navigate to="/squad-simulator" replace />}
              />

              <Route
                path="/pending-approval"
                element={<Navigate to="/squad-simulator" replace />}
              />

              <Route
                path="/"
                element={<Navigate to="/squad-simulator" replace />}
              />

              <Route
                path="/squad-simulator"
                element={lazyRoute(<SquadSimulatorPage />, <SimulatorSkeleton />)}
              />

              <Route
                path="*"
                element={<Navigate to="/squad-simulator" replace />}
              />
            </>
          )}
        </Route>
      )}
    </Routes>
  )
}

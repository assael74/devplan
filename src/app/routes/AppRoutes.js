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

import HomePage from '../../features/home/HomePage'
import CalendarHubPage from '../../features/calendarHub/CalendarHubPage'
import VideoHubPage from '../../features/videoHub/VideoHubPage'
import TagsManagementPage from '../../features/tagsHub/TagsManagementPage.js'

import HubPage from '../../features/hub/ui/HubPage'
import PlayerProfilePage from '../../features/hub/playerProfile/PlayerProfilePage'
import TeamProfilePage from '../../features/hub/teamProfile/TeamProfilePage'
import ClubProfilePage from '../../features/hub/clubProfile/ClubProfilePage'

import AbilitiesPublicRouteEntry from './AbilitiesPublicRouteEntry.js'

import InsightsPage from '../../features/insightsHub/InsightsPage.js'

import AbilitiesExplainerPage from '../../features/abilities/explainer/AbilitiesExplainerPage.js'
import { SquadSimulatorPage } from '../../features/squadSimulator/index.js'

import LoginPage from '../../features/auth/pages/LoginPage'
import RegisterPage from '../../features/auth/pages/RegisterPage'
import ForgotPasswordPage from '../../features/auth/pages/ForgotPasswordPage'
import PendingApprovalPage from '../../features/auth/pages/PendingApprovalPage'

import { LiveTaggingPanel } from '../../features/liveTagging/index.js'

import NotificationsBell from '../../features/notifications/components/NotificationsBell'
import NotificationsDrawer from '../../features/notifications/components/NotificationsDrawer'

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

  const handleMarkAsRead = async (item) => {
    if (!item?.id || item?.isRead) return
    await markAsRead(item.id)
  }

  const handleOpenTarget = async (item) => {
    if (!item) return

    if (!item?.isRead) {
      await markAsRead(item.id)
    }

    const target = getNotificationTarget(item)

    if (target?.path) {
      navigate(target.path, { replace: Boolean(target?.replace) })
      closeNotifications()
    }
  }

  const handleDeleteNotification = async (item) => {
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
  const { roles = [], loading: coreLoading } = useCoreData()

  const isCoreLoaded = !coreLoading
  const isAdmin = user ? isAdminAuthUser(user, roles) : false
  const canUseSquadSimulator = user ? canAccessSquadSimulator(user, roles) : false
  const canEnterAnyArea = isAdmin || canUseSquadSimulator

  if (loading) {
    return <LoadingScreen label="טוען התחברות..." />
  }

  return (
    <Routes>
      <Route path="/forms/abilities/:token" element={<AbilitiesPublicRouteEntry />} />

      {!user ? (
        <>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </>
      ) : !isCoreLoaded ? (
        <Route path="*" element={<LoadingScreen label="טוען נתונים..." />} />
      ) : !canEnterAnyArea ? (
        <>
          <Route path="/pending-approval" element={<PendingApprovalPage />} />
          <Route path="*" element={<Navigate to="/pending-approval" replace />} />
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
              <Route path="/login" element={<Navigate to="/home" replace />} />
              <Route path="/register" element={<Navigate to="/home" replace />} />
              <Route path="/forgot-password" element={<Navigate to="/home" replace />} />
              <Route path="/pending-approval" element={<Navigate to="/home" replace />} />

              <Route path="/" element={<Navigate to="/home" replace />} />

              <Route path="/home" element={<HomePage />} />
              <Route path="/hub" element={<HubPage />} />
              <Route path="/calendar" element={<CalendarHubPage />} />
              <Route path="/video" element={<VideoHubPage />} />
              <Route path="/tags" element={<TagsManagementPage />} />

              <Route path="/liveTagging" element={<LiveTaggingPanel />} />

              <Route path="/abilities/explainer" element={<AbilitiesExplainerPage />} />
              <Route path="/insights/explainer" element={<InsightsPage />} />
              <Route path="/squad-simulator" element={<SquadSimulatorPage />} />

              <Route path="/clubs/:clubId" element={<ClubProfilePage />} />
              <Route path="/clubs/:clubId/:tabKey" element={<ClubProfilePage />} />

              <Route path="/teams/:teamId" element={<TeamProfilePage />} />
              <Route path="/teams/:teamId/:tabKey" element={<TeamProfilePage />} />

              <Route path="/players/:playerId" element={<PlayerProfilePage />} />
              <Route path="/players/:playerId/:tabKey" element={<PlayerProfilePage />} />

              <Route path="*" element={<Navigate to="/hub" replace />} />
            </>
          ) : (
            <>
              <Route path="/login" element={<Navigate to="/squad-simulator" replace />} />
              <Route path="/register" element={<Navigate to="/squad-simulator" replace />} />
              <Route path="/forgot-password" element={<Navigate to="/squad-simulator" replace />} />
              <Route path="/pending-approval" element={<Navigate to="/squad-simulator" replace />} />
              <Route path="/" element={<Navigate to="/squad-simulator" replace />} />
              <Route path="/squad-simulator" element={<SquadSimulatorPage />} />
              <Route path="*" element={<Navigate to="/squad-simulator" replace />} />
            </>
          )}
        </Route>
      )}
    </Routes>
  )
}

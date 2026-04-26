import React from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { Box, Typography, CircularProgress } from '@mui/joy'

import { useAuth } from '../AuthProvider'
import { useNotificationsContext } from '../NotificationsProvider'

import AppLayout from '../layout/AppLayout'
import TopBar from '../../ui/core/layout/TopBar'

import HubPage from '../../features/hub/ui/HubPage'
import HomePage from '../../features/home/HomePage'
import PlayerProfilePage from '../../features/hub/playerProfile/PlayerProfilePage'
import TeamProfilePage from '../../features/hub/teamProfile/TeamProfilePage'
import ClubProfilePage from '../../features/hub/clubProfile/ClubProfilePage'
import CalendarHubPage from '../../features/calendarHub/CalendarHubPage'
import VideoHubPage from '../../features/videoHub/VideoHubPage'

import AbilitiesPublicRouteEntry from './AbilitiesPublicRouteEntry.js'
import TagsManagementPage from '../../features/tagsHub/TagsManagementPage.js'
import AbilitiesExplainerPage from '../../features/abilities/explainer/AbilitiesExplainerPage.js'

import LoginPage from '../../features/auth/pages/LoginPage'
import ForgotPasswordPage from '../../features/auth/pages/ForgotPasswordPage'

import NotificationsBell from '../../features/notifications/components/NotificationsBell'
import NotificationsDrawer from '../../features/notifications/components/NotificationsDrawer'

function TopBarNotificationsHost() {
  const navigate = useNavigate()

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

  const handleMarkAsRead = async (item) => {
    if (!item?.id || item?.isRead) return
    await markAsRead(item.id)
  }

  const handleOpenTarget = async (item) => {
    if (!item) return

    if (!item?.isRead) {
      await markAsRead(item.id)
    }

    const target = getNotificationTarget?.(item)

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
      <NotificationsBell
        unreadCount={unreadCount}
        onClick={toggleNotifications}
      />

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

  const isCoreLoaded = true

  if (loading) {
    return (
      <Box sx={{ p: 6, textAlign: 'center' }}>
        <CircularProgress size="lg" />
        <Typography level="body-md" sx={{ mt: 2 }}>
          טוען התחברות...
        </Typography>
      </Box>
    )
  }

  return (
    <Routes>
      <Route path="/forms/abilities/:token" element={<AbilitiesPublicRouteEntry />} />

      {!user ? (
        <>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </>
      ) : !isCoreLoaded ? (
        <Route
          path="*"
          element={
            <Box sx={{ p: 6, textAlign: 'center' }}>
              <CircularProgress size="lg" />
              <Typography level="body-md" sx={{ mt: 2 }}>
                טוען נתונים...
              </Typography>
            </Box>
          }
        />
      ) : (
        <Route
          element={
            <AppLayout
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
          <Route path="/login" element={<Navigate to="/home" replace />} />
          <Route path="/forgot-password" element={<Navigate to="/home" replace />} />

          <Route path="/" element={<Navigate to="/home" replace />} />

          <Route path="/home" element={<HomePage />} />
          <Route path="/hub" element={<HubPage />} />
          <Route path="/calendar" element={<CalendarHubPage />} />
          <Route path="/video" element={<VideoHubPage />} />
          <Route path="/tags" element={<TagsManagementPage />} />
          <Route path="/abilities/explainer" element={<AbilitiesExplainerPage />} />

          <Route path="/clubs/:clubId" element={<ClubProfilePage />} />
          <Route path="/clubs/:clubId/:tabKey" element={<ClubProfilePage />} />

          <Route path="/teams/:teamId" element={<TeamProfilePage />} />
          <Route path="/teams/:teamId/:tabKey" element={<TeamProfilePage />} />

          <Route path="/players/:playerId" element={<PlayerProfilePage />} />
          <Route path="/players/:playerId/:tabKey" element={<PlayerProfilePage />} />

          <Route path="*" element={<Navigate to="/hub" replace />} />
        </Route>
      )}
    </Routes>
  )
}

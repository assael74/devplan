// src/app/routes/TopBarNotificationsHost.js

import React from 'react'
import { Box, Button } from '@mui/joy'
import { useNavigate } from 'react-router-dom'

import { useAuth } from '../../features/auth'
import NotificationsBell from '../../features/notifications/components/NotificationsBell'
import NotificationsDrawer from '../../features/notifications/components/NotificationsDrawer'
import { useNotificationsContext } from '../NotificationsProvider'

export default function TopBarNotificationsHost() {
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

    navigate(target.path, { replace: Boolean(target.replace) })
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
          size='sm'
          variant='soft'
          color='neutral'
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

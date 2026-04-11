// src/features/notifications/components/NotificationsList.js

import { Box, CircularProgress, Stack, Typography } from '@mui/joy'
import NotificationListItem from './NotificationListItem'
import { notificationsSx as sx } from '../sx/notifications.sx'

export default function NotificationsList({
  notifications = [],
  loading = false,
  pendingIds = {},
  onMarkAsRead,
  onOpenTarget,
  onDelete,
}) {
  if (loading) {
    return (
      <Box sx={sx.emptyWrap}>
        <Stack spacing={1} alignItems="center">
          <CircularProgress size="sm" />
          <Typography level="body-sm">טוען התראות...</Typography>
        </Stack>
      </Box>
    )
  }

  if (!notifications.length) {
    return (
      <Box sx={sx.emptyWrap}>
        <Typography level="body-sm" color="neutral">
          אין התראות להצגה
        </Typography>
      </Box>
    )
  }

  return (
    <Stack spacing={1}>
      {notifications.map((item) => (
        <NotificationListItem
          key={item.id}
          item={item}
          pending={Boolean(pendingIds?.[item.id])}
          onMarkAsRead={onMarkAsRead}
          onOpenTarget={onOpenTarget}
          onDelete={onDelete}
        />
      ))}
    </Stack>
  )
}

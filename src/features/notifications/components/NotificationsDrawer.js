// src/features/notifications/components/NotificationsDrawer.js

import { Box, Button, Divider, Drawer, Stack, Typography, Sheet } from '@mui/joy'
import NotificationsList from './NotificationsList'
import useMediaQuery from '@mui/material/useMediaQuery'
import { notificationsSx as sx } from '../sx/notifications.sx'

export default function NotificationsDrawer({
  open = false,
  onClose,
  notifications = [],
  unreadCount = 0,
  loading = false,
  pendingIds = {},
  onMarkAsRead,
  onOpenTarget,
  onDelete,
  onMarkAllAsRead,
}) {
  const isMobile = useMediaQuery('(max-width:900px)')

  return (
    <Drawer
      open={open}
      onClose={onClose}
      anchor={isMobile ? 'bottom' : 'right'}
      size="md"
      slotProps={{
        content: {
          sx: sx.drawer(isMobile),
        },
      }}
    >
      <Sheet sx={sx.drawerSheet}>
        <Box sx={sx.drawerHeader}>
          <Stack spacing={0.25}>
            <Typography level="title-md">התראות</Typography>
            <Typography level="body-sm" color="neutral">
              {unreadCount ? `${unreadCount} לא נקראו` : 'הכול נקרא'}
            </Typography>
          </Stack>

          <Button
            size="sm"
            variant="soft"
            color="neutral"
            onClick={onMarkAllAsRead}
            disabled={!unreadCount}
          >
            סמן הכול כנקרא
          </Button>
        </Box>

        <Divider />

        <Box sx={sx.listWrap} className="dpScrollThin">
          <NotificationsList
            notifications={notifications}
            loading={loading}
            pendingIds={pendingIds}
            onMarkAsRead={onMarkAsRead}
            onOpenTarget={onOpenTarget}
            onDelete={onDelete}
          />
        </Box>
      </Sheet>
    </Drawer>
  )
}

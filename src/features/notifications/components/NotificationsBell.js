import { Badge, IconButton } from '@mui/joy'
import { iconUi } from '../../../ui/core/icons/iconUi'
import { notificationsSx as sx } from '../sx/notifications.sx'

function getBadgeLabel(unreadCount) {
  if (!unreadCount) return 0
  if (unreadCount > 99) return '99+'
  return unreadCount
}

export default function NotificationsBell({
  unreadCount = 0,
  open = false,
  onClick,
}) {
  const hasUnread = unreadCount > 0

  return (
    <IconButton
      variant={open ? 'solid' : 'soft'}
      color={hasUnread ? 'primary' : 'neutral'}
      onClick={onClick}
      sx={{ position: 'relative' }}
    >
      <Badge
        badgeContent={getBadgeLabel(unreadCount)}
        color="danger"
        size="sm"
        invisible={!hasUnread}
      >
        {iconUi({ id: 'notifications' })}
      </Badge>
    </IconButton>
  )
}

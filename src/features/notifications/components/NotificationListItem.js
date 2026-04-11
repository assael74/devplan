// src/features/notifications/components/NotificationListItem.js

import { Avatar, Box, Chip, IconButton, Typography } from '@mui/joy'
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'
import { iconUi } from '../../../ui/core/icons/iconUi'
import { formatNotificationDateTime } from '../logic/notifications.logic'
import { notificationsSx as sx } from '../sx/notifications.sx'

export default function NotificationListItem({
  item,
  pending = false,
  onMarkAsRead,
  onOpenTarget,
  onDelete,
}) {
  const isUnread = !item?.isRead
  const meta = item?.meta || {}
  const title = item?.display?.title || item?.title || 'התראה'
  const body = item?.display?.body || item?.body || ''
  const avatar = item?.display?.avatar || ''
  const logo = item?.display?.logo || ''

  const handleCardClick = () => {
    onMarkAsRead(item)
  }

  const handleTitleClick = (event) => {
    event.stopPropagation()
    onOpenTarget(item)
  }

  const handleDeleteClick = (event) => {
    event.stopPropagation()
    onDelete(item)
  }

  return (
    <Box
      onClick={handleCardClick}
      sx={{
        ...sx.itemCard,
        ...(isUnread ? sx.itemUnread : null),
      }}
    >
      <Box sx={sx.itemTopRow}>
        <Chip
          size="sm"
          variant="soft"
          color={meta?.color || 'neutral'}
          startDecorator={iconUi({ id: meta?.iconId || 'notifications' })}
        >
          {meta?.label || 'מערכת'}
        </Chip>

        <Typography level="body-xs" noWrap>
          {formatNotificationDateTime(item)}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {avatar ? (
          <Avatar src={avatar} size="sm" />
        ) : logo ? (
          <Avatar src={logo} size="sm" />
        ) : null}

        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography
            level="title-sm"
            sx={{ fontWeight: 700, lineHeight: 1.25, textAlign: 'right' }}
            onClick={handleTitleClick}
          >
            {title}
          </Typography>

          {body ? (
            <Typography level="body-sm" sx={{ color: 'text.secondary', lineHeight: 1.45, textAlign: 'right' }}>
              {body}
            </Typography>
          ) : null}
        </Box>
      </Box>

      <Box sx={sx.itemFooter}>
        <Chip
          size="sm"
          color={isUnread ? 'primary' : 'neutral'}
          variant={isUnread ? 'solid' : 'soft'}
        >
          {isUnread ? 'לא נקרא' : 'נקרא'}
        </Chip>

        <IconButton
          size="sm"
          variant="plain"
          color="danger"
          onClick={handleDeleteClick}
          loading={pending}
        >
          <DeleteOutlineRoundedIcon />
        </IconButton>
      </Box>
    </Box>
  )
}

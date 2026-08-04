// features/hub/components/lists/clubs/ClubRow.js

import React from 'react'
import { Box, Typography, Avatar, IconButton } from '@mui/joy'
import { buildFallbackAvatar } from '../../../../../ui/core/avatars/fallbackAvatar.js'
import { iconUi } from '../../../../../ui/core/icons/iconUi.js'

import { listSx as sx } from '../list.sx.js'

function ColorDot({ active }) {
  let bg = '#9e9e9e'
  if (active === true) bg = '#2e7d32'
  if (active === false) bg = '#d32f2f'
  return <Box sx={sx.colorDot(bg)} />
}

export default function ClubRow({
  club,
  isMobile = false,
  onSelect,
  selected,
  onOpenRoute,
  onOpenActions,
}) {
  const src =
    club?.photo ||
    buildFallbackAvatar({
      entityType: 'club',
      id: club?.id,
      name: club?.clubName,
    })

  const clubName = club?.clubName || club?.name || 'מועדון'
  const subLine = [
    club?.clubCity || club?.city,
    club?.clubYear || club?.year,
    club?.active === false ? 'לא פעיל' : null,
  ].filter(Boolean).join(' · ')

  const handleRowClick = (e) => {
    e.stopPropagation()

    if (isMobile) {
      if (onOpenRoute) {
        onOpenRoute(club)
        return
      }
      onSelect(club)
      return
    }

    onSelect(club)
  }

  return (
    <Box
      onMouseDown={(e) => e.stopPropagation()}
      onClick={handleRowClick}
      sx={sx.row(selected)}
    >
      <Avatar size="sm" src={src}>
        {clubName[0] || '?'}
      </Avatar>

      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <ColorDot active={club?.active} />

          <Typography level="title-sm" noWrap sx={{ minWidth: 0 }}>
            {clubName}
          </Typography>
        </Box>

        <Typography level="body-xs" sx={sx.subLine} noWrap>
          {subLine}
        </Typography>
      </Box>

      {!!onOpenActions && (
        <IconButton
          size="sm"
          variant="plain"
          className="hub-row-action"
          sx={sx.actionButton(selected)}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation()
            onOpenActions(club)
          }}
        >
          {iconUi({ id: 'more', size: 'small' })}
        </IconButton>
      )}
    </Box>
  )
}

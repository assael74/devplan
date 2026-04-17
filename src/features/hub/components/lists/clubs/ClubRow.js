// features/hub/components/lists/clubs/ClubRow.js

import React from 'react'
import { Box, Typography, Avatar, IconButton } from '@mui/joy'
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded'
import { buildFallbackAvatar } from '../../../../../ui/core/avatars/fallbackAvatar.js'

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

  const subLine = [club?.clubCity, club?.clubYear, club?.active === false ? 'לא פעיל' : null].filter(Boolean).join(' • ')

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
        {club?.clubName[0] || '?'}
      </Avatar>

      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <ColorDot active={club?.active} />
          <Typography level="title-sm" noWrap sx={{ minWidth: 0 }}>
            {club?.clubName || 'מועדון'}
          </Typography>
        </Box>

        <Typography
          level="body-xs"
          sx={{ opacity: 0.75, mt: 0.25, lineHeight: 1.2, ml: 1 }}
          noWrap
        >
          {subLine}
        </Typography>
      </Box>

      {!!onOpenActions && (
        <IconButton
          size="sm"
          variant="plain"
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation()
            onOpenActions(club)
          }}
        >
          <MoreVertRoundedIcon />
        </IconButton>
      )}
    </Box>
  )
}

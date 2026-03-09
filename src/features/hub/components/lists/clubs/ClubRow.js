import React from 'react'
import { Box, Typography, Avatar, IconButton } from '@mui/joy'
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded'
import { buildFallbackAvatar } from '../../../../../ui/core/avatars/fallbackAvatar.js'
import { rowSx } from '../../layout/hubComponents.sx.js'

function ColorDot({ active }) {
  let bg = '#9e9e9e'

  if (active === true) bg = '#2e7d32'
  if (active === false) bg = '#d32f2f'

  return (
    <Box
      sx={{
        width: 8,
        height: 8,
        borderRadius: '50%',
        bgcolor: bg,
        boxShadow: '0 0 0 2px #fff',
        flexShrink: 0,
      }}
    />
  )
}

export default function ClubRow({ club, onSelect, onOpenActions, selected }) {
  const src = club?.photo || buildFallbackAvatar({ entityType: 'club', id: club?.id, name: club?.clubName })
  const subLine = [club?.clubCity, club?.clubYear, club?.active === false ? 'לא פעיל' : null].filter(Boolean).join(' • ')

  return (
    <Box
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => {
        e.stopPropagation()
        onSelect?.(club)
      }}
      sx={rowSx(selected)}
    >
      <Avatar size="sm" src={src}>{club?.clubName?.[0] || '?'}</Avatar>

      <Box sx={{ minWidth: 0, flex: 1 }}>

        {/* שורה עליונה */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <ColorDot active={club?.active} />
          <Typography level="title-sm" noWrap sx={{ minWidth: 0 }}>
            {club?.clubName || 'מועדון'}
          </Typography>
        </Box>

        {/* שורה תחתונה */}
        <Typography level="body-xs" sx={{ opacity: 0.75, mt: 0.25, lineHeight: 1.2, ml: 1 }} noWrap>
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

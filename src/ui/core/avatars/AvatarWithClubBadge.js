// ui/core/avatars/AvatarWithClubBadge.js
import React from 'react'
import { Box, Avatar } from '@mui/joy'

function normalizeBadgeColor(color) {
  if (!color) return null
  if (typeof color === 'string') return { bg: color, border: color }
  return {
    bg: color?.bg || color?.main || color?.solidBg || '#1976d2',
    border: color?.text || color?.tex || color?.solidColor || '#fff',
  }
}

export function AvatarWithClubBadge({ src, sx, clubColor }) {
  const c = normalizeBadgeColor(clubColor)

  return (
    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
      <Avatar src={src} sx={sx} />
      {c && (
        <Box
          sx={{
            position: 'absolute',
            bottom: -1,
            left: -1,
            width: 8,
            height: 8,
            borderRadius: '50%',
            bgcolor: c.bg,
            border: '1.5px solid',
            borderColor: c.border,
          }}
        />
      )}
    </Box>
  )
}

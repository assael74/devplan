// src/ui/core/layout/TopBar.js

import React from 'react'
import { Box, IconButton, Typography } from '@mui/joy'
import MenuIcon from '@mui/icons-material/Menu'

export default function TopBar({ title = 'DevPlan', right, onMenuClick }) {
  return (
    <Box
      sx={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        bgcolor: 'background.body',
        borderBottom: '1px solid',
        borderColor: 'divider',
        px: { xs: 1.5, sm: 2 },
        py: 1,
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        flexDirection: 'row-reverse',
      }}
    >
      <IconButton
        variant="soft"
        size="sm"
        aria-label="תפריט"
        onClick={onMenuClick}
      >
        <MenuIcon />
      </IconButton>

      <Typography
        level="title-md"
        sx={{
          flex: 1,
          minWidth: 0,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {title}
      </Typography>

      {right ? (
        <Box sx={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 1 }}>
          {right}
        </Box>
      ) : null}
    </Box>
  )
}

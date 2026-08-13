// features/hub/sharedProfile/desktop/SectionPanel.js

import React from 'react'
import { Box, Sheet, Typography } from '@mui/joy'

export default function SectionPanel({
  title,
  subtitle,
  right,
  children,
  scrollMode = 'page',
}) {
  const isContained = scrollMode === 'contained'

  return (
    <Sheet
      variant="soft"
      sx={{
        p: 1,
        borderRadius: 'md',
        height: isContained ? '100%' : 'auto',
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        overflow: isContained ? 'hidden' : 'visible',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 1,
        }}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {title ? (
            <Typography level="title-sm">
              {title}
            </Typography>
          ) : null}

          {subtitle ? (
            <Typography
              level="body-xs"
              noWrap
              sx={{
                mt: 0.25,
                opacity: 0.75,
              }}
            >
              {subtitle}
            </Typography>
          ) : null}
        </Box>

        {right ? (
          <Box sx={{ flexShrink: 0 }}>
            {right}
          </Box>
        ) : null}
      </Box>

      <Box
        className={isContained ? 'dpScrollThin' : undefined}
        sx={{
          flex: isContained ? 1 : 'none',
          minHeight: 0,
          minWidth: 0,
          pt: 0.75,
          pr: 0.5,
          pb: isContained ? 7 : 1,
          overflowY: isContained ? 'auto' : 'visible',
          overflowX: isContained ? 'hidden' : 'visible',
        }}
      >
        {children}
      </Box>
    </Sheet>
  )
}

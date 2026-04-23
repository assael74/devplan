// ui/patterns/insights/InsightsDrawerShell.js

import React from 'react'
import { Drawer, Sheet, DialogContent } from '@mui/joy'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'

import { insightsPatternSx as sx } from './sx/insights.sx.js'

export default function InsightsDrawerShell({
  open,
  onClose,
  size = 'lg',
  header = null,
  children,
}) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const anchor = isMobile ? 'bottom' : 'right'

  return (
    <Drawer
      size={size}
      variant="plain"
      anchor={anchor}
      open={open}
      onClose={onClose}
      slotProps={{
        content: { sx: isMobile ? sx.drawerContentMobile : sx.drawerSx },
      }}
    >
      <Sheet sx={isMobile ? sx.drawerSheetMobile : sx.drawerSheet}>
        {header}

        <DialogContent sx={{ gap: 2 }}>
          <Sheet sx={sx.content} className="dpScrollThin">
            {children}
          </Sheet>
        </DialogContent>
      </Sheet>
    </Drawer>
  )
}

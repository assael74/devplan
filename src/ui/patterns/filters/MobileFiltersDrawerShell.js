// ui/patterns/filters/MobileFiltersDrawerShell.js

import React from 'react'
import { Drawer, Sheet, Box, Typography, Button, IconButton } from '@mui/joy'
import { iconUi } from '../../core/icons/iconUi.js'
import { drawerSx as sx } from './drawer.sx'

import { getEntityColors } from '../../core/theme/Colors.js'

const c = (entity) => getEntityColors(entity)

export default function MobileFiltersDrawerShell({
  open,
  onClose,
  entity,
  title = 'סינון',
  subtitle = '',
  resultsText = '',
  onReset,
  resetDisabled = false,
  children,
}) {
  return (
    <Drawer
      open={!!open}
      anchor="bottom"
      onClose={onClose}
      slotProps={{
        content: {
          sx: { bgcolor: 'transparent', p: 0, justifyContent: 'flex-end' },
        },
      }}
    >
      <Sheet sx={sx.sheet}>
        <Box sx={sx.header}>
          <Box sx={sx.headerText}>
            <Typography level="title-md" sx={{ minWidth: 0 }}>
              {title}
            </Typography>

            {subtitle ? (
              <Typography level="body-xs" sx={{ color: 'text.tertiary' }}>
                {subtitle}
              </Typography>
            ) : resultsText ? (
              <Typography level="body-xs" sx={{ color: 'text.tertiary' }}>
                {resultsText}
              </Typography>
            ) : null}
          </Box>

          <IconButton size="sm" variant="soft" color="neutral" onClick={onClose}>
            {iconUi({ id: 'close' })}
          </IconButton>
        </Box>

        <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', p: 1 }} className="dpScrollThin">
          {children}
        </Box>

        <Box sx={sx.footer}>
          <Button size="sm" variant="solid" onClick={onClose}  sx={{ bgcolor: c(entity).accent }}>
            סגור
          </Button>
          
          <Button
            size="sm"
            color='neutral'
            variant="outlined"
            onClick={onReset}
            disabled={resetDisabled}
          >
            איפוס
          </Button>
        </Box>
      </Sheet>
    </Drawer>
  )
}

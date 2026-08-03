// features/hub/components/desktop/navigation/HubToolbar.js

import React from 'react'
import { Sheet, Typography, Box } from '@mui/joy'

import { navSx as sx } from './nav.sx.js'
import { iconUi } from '../../../../../ui/core/icons/iconUi.js'

export default function HubToolbar({ title, subtitle }) {
  return (
    <Sheet variant="soft" sx={sx.sheet}>
      <Box>
        <Typography level="h3" startDecorator={iconUi({ id: 'dashboard' })}>
          {title || 'מרכז שליטה'}
        </Typography>

        {subtitle ? (
          <Typography level="body-sm" sx={{ mt: 0.25, color: 'text.tertiary' }}>
            {subtitle}
          </Typography>
        ) : null}
      </Box>
    </Sheet>
  )
}

// features/hub/sharedProfile/mobile/SectionPanelMobile.js

import React from 'react'
import { Sheet, Box, Typography } from '@mui/joy'

import { sharedSx as sx } from './shared.sx'

export default function SectionPanelMobile({
  title,
  right,
  subtitle,
  children,
}) {
  return (
    <Sheet variant="plain" sx={sx.panel}>
      {(title || subtitle || right) ? (
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, flex: '0 0 auto' }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            {title ? <Typography level="title-sm">{title}</Typography> : null}

            {subtitle ? (
              <Typography level="body-xs" sx={{ opacity: 0.75, mt: 0.25 }} noWrap>
                {subtitle}
              </Typography>
            ) : null}
          </Box>

          {right ? <Box sx={{ flexShrink: 0 }}>{right}</Box> : null}
        </Box>
      ) : null}

      <Box sx={{ minWidth: 0, minHeight: 0, pt: title || subtitle || right ? 0.75 : 0, overflow: 'visible' }}>
        {children}
      </Box>
    </Sheet>
  )
}

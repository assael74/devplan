// ui/patterns/insights/layout/LocalInsightsSection.js

import React from 'react'
import { Box, Divider, Typography } from '@mui/joy'

import { iconUi } from '../../../core/icons/iconUi.js'
import { localSx as sx } from './sx/local.sx'

export default function LocalInsightsSection({
  title,
  sub,
  icon = 'insights',
  action = null,
  children,
}) {
  return (
    <Box sx={sx.sectionBlock}>
      <Box sx={sx.sectionHead}>
        <Box sx={sx.sectionTitleWrap}>
          <Box sx={sx.sectionIcon}>
            {iconUi({ id: icon })}
          </Box>

          <Box>
          <Typography level="title-sm" sx={sx.sectionTitle}>
            {title}
          </Typography>

          {sub ? (
            <Typography level="body-sm" sx={sx.sectionSubTitle}>
              {sub}
            </Typography>
          ) : null}
          </Box>
        </Box>

        {action}
      </Box>

      <Divider sx={{ my: 0.1 }} />

      {children}
    </Box>
  )
}

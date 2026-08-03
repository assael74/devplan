// src/features/hub/components/mobile/HubHomeMobile.js

import React from 'react'
import { Box, Typography } from '@mui/joy'

import HubSectionCardMobile from './HubSectionCardMobile.js'
import { iconUi } from '../../../../ui/core/icons/iconUi.js'
import { getEntityColors } from '../../../../ui/core/theme/Colors.js'
import { hubMobileSx as sx } from './sx/hubMobile.sx.js'

const c = (entity) => getEntityColors(entity)

export default function HubHomeMobile({
  title,
  subtitle,
  tabsMeta = [],
  counts = {},
  onSelectMode,
}) {
  return (
    <Box sx={sx.homeBox} className="dpScrollThin">
      <Box sx={{ display: 'grid', gap: 1.25 }}>
        <Box>
          <Typography level="title-lg" startDecorator={iconUi({ id: 'hub' })}>
            {title || 'מרכז שליטה'}
          </Typography>

          <Typography level="body-sm" sx={{ mt: 0.35, color: 'text.tertiary' }}>
            {subtitle || 'בחר אזור כדי לצפות ברשימה המתאימה'}
          </Typography>
        </Box>

        <Box sx={sx.homeGrid}>
          {tabsMeta.map((tab) => (
            <HubSectionCardMobile
              key={tab.value}
              label={tab.label}
              icon={tab.icon}
              color={c(tab.value).bg}
              count={counts[tab.value]}
              onClick={() => onSelectMode(tab.value)}
            />
          ))}
        </Box>
      </Box>
    </Box>
  )
}

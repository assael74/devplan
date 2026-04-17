// features/hub/components/mobile/HubHomeMobile.js

import React from 'react'
import { Box, Typography } from '@mui/joy'
import HubSectionCardMobile from './HubSectionCardMobile'

export default function HubHomeMobile({
  tabsMeta = [],
  counts = {},
  onSelectMode,
}) {
  return (
    <Box
      sx={{
        flex: 1,
        minHeight: 0,
        overflow: 'auto',
        p: 1.25,
      }}
      className="dpScrollThin"
    >
      <Box sx={{ display: 'grid', gap: 1.25 }}>
        <Box>
          <Typography level="title-lg">מרכז שליטה</Typography>
          <Typography level="body-sm" sx={{ mt: 0.35, color: 'text.tertiary' }}>
            בחר אזור כדי לצפות ברשימה המתאימה
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
            gap: 1,
          }}
        >
          {tabsMeta.map((tab) => (
            <HubSectionCardMobile
              key={tab.value}
              label={tab.label}
              icon={tab.icon}
              count={counts?.[tab.value]}
              onClick={() => onSelectMode(tab.value)}
            />
          ))}
        </Box>
      </Box>
    </Box>
  )
}

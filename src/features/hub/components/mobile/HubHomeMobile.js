// features/hub/components/mobile/HubHomeMobile.js

import React from 'react'
import { Box, Typography } from '@mui/joy'
import HubSectionCardMobile from './HubSectionCardMobile'

import playersImg from '../../../../ui/core/images/players.png'
import staffImg from '../../../../ui/core/images/staff.png'
import teamsImg from '../../../../ui/core/images/teams.png'
import { iconUi } from '../../../../ui/core/icons/iconUi.js'

import { hubMobileSx as sx } from './sx/hubMobile.sx'

import { getEntityColors } from '../../../../ui/core/theme/Colors.js'

const c = (entity) => getEntityColors(entity)

function getMobileSectionImage(key) {
  if (key === 'players') return playersImg
  if (key === 'staff') return staffImg
  if (key === 'teams') return teamsImg
  if (key === 'clubs') return teamsImg
  return playersImg
}

export default function HubHomeMobile({
  tabsMeta = [],
  counts = {},
  onSelectMode,
}) {

  return (
    <Box sx={sx.homeBox} className="dpScrollThin">
      <Box sx={{ display: 'grid', gap: 1.25 }}>
        <Box>
          <Typography level="title-lg" startDecorator={iconUi({id: 'hub'})}>מרכז שליטה</Typography>
          <Typography level="body-sm" sx={{ mt: 0.35, color: 'text.tertiary' }}>
            בחר אזור כדי לצפות ברשימה המתאימה
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
              avatarSrc={getMobileSectionImage(tab.value)}
              onClick={() => onSelectMode(tab.value)}
            />
          ))}
        </Box>
      </Box>
    </Box>
  )
}

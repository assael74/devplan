// features/hub/teamProfile/mobile/ProfileSectionMobile.js

import React from 'react'
import { Box, Typography, IconButton } from '@mui/joy'

import { profileSx as sx } from './sx/profile.sx'

import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded'

export default function ProfileSectionMobile({
  mode,
  tabsMeta = [],
  children,
  onBack,
}) {
  const currentTab = tabsMeta.find((tab) => tab.value === mode) || null

  return (
    <Box sx={sx.boxWraper}>
      <Box sx={sx.boxScreen}>
        <IconButton variant="soft" color="neutral" onClick={onBack} aria-label="חזרה">
          <ArrowBackRoundedIcon />
        </IconButton>

        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography level="title-md" noWrap>
            {currentTab?.label || 'אזור'}
          </Typography>

          <Typography level="body-xs" sx={{ mt: 0.25, color: 'text.tertiary' }}>
            רשימת אובייקטים
          </Typography>
        </Box>

        <Box sx={{ display: 'grid', placeItems: 'center', flexShrink: 0 }}>
          {currentTab?.icon || null}
        </Box>
      </Box>

      <Box sx={sx.box}>
        {children}
      </Box>
    </Box>
  )
}

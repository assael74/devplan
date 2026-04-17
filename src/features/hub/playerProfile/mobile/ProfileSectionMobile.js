// features/hub/playerProfile/mobile/ProfileSectionMobile.js

import React from 'react'
import { Box, Typography, IconButton } from '@mui/joy'

import { profileSx as sx } from './sx/profile.sx'

import { iconUi } from '../../../../ui/core/icons/iconUi.js'
import { getEntityColors } from '../../../../ui/core/theme/Colors.js'
import { sharedSx } from './../../sharedProfile/mobile/shared.sx.js'

import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded'

const c = (entity) => getEntityColors(entity)

export default function ProfileSectionMobile({
  mode,
  tabsMeta = [],
  children,
  onBack,
}) {
  const currentTab = tabsMeta.find((tab) => tab.value === mode) || null
  const colors = c(currentTab?.color)

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

        <Box sx={sharedSx?.navIcon(true, colors, { width: 30, height: 30 })}>
          {iconUi({id: currentTab?.icon || 'dot', sx: { fontSize: 18, color: 'inherit' }, })}
        </Box>
      </Box>

      <Box sx={sx.box}>
        {children}
      </Box>
    </Box>
  )
}

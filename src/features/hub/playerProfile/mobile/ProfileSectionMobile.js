// features/hub/playerProfile/mobile/ProfileSectionMobile.js

import React from 'react'
import { Box, Typography, IconButton } from '@mui/joy'

import { profileSx as sx } from './sx/profile.sx'

import { iconUi } from '../../../../ui/core/icons/iconUi.js'
import { getEntityColors } from '../../../../ui/core/theme/Colors.js'
import { sharedSx } from './../../sharedProfile/mobile/shared.sx.js'

import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded'

const c = (entity) => getEntityColors(entity)

function getSectionSubtitle(mode) {
  if (mode === 'info') return 'חזרה לפרופיל השחקן'
  if (mode === 'meetings') return 'ניהול ורשימת מפגשים'
  if (mode === 'games') return 'רשימת משחקים ופרטים'
  if (mode === 'abilities') return 'יכולות, ציונים ותובנות'
  if (mode === 'performance') return 'ביצועים וסטטיסטיקות'
  if (mode === 'videoAnalysis') return 'וידאו וניתוחים'
  if (mode === 'payments') return 'תשלומים ומעקב'
  if (mode === 'trainings') return 'אימונים ומעקב'
  return 'חזרה לפרופיל השחקן'
}

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
      <Box sx={sx.sectionHeader}>
        <Box sx={sx.sectionHeaderMain}>
          <Box sx={sharedSx?.navIcon(true, colors, { width: 28, height: 28 })}>
            {iconUi({ id: currentTab?.icon || 'dot', sx: { fontSize: 16, color: 'inherit' } })}
          </Box>

          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography level="title-sm" noWrap sx={{ fontWeight: 700, lineHeight: 1.1 }}>
              {currentTab?.label || 'אזור'}
            </Typography>

            <Typography level="body-xs" sx={{ mt: 0.25, color: 'text.tertiary' }} noWrap>
              {getSectionSubtitle(mode)}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
          <IconButton
            size="sm"
            variant="soft"
            color="neutral"
            onClick={onBack}
            aria-label="חזרה"
            sx={{ flexShrink: 0 }}
          >
            <ArrowBackRoundedIcon />
          </IconButton>
        </Box>
      </Box>

      <Box sx={sx.box}>
        {children}
      </Box>
    </Box>
  )
}

// features/hub/components/mobile/HubSectionScreenMobile.js

import React, { useMemo } from 'react'
import { Box } from '@mui/joy'
import { useNavigate } from 'react-router-dom'

import { hubMobileSx as sx } from './sx/hubMobile.sx'
import HeaderStripMobile from '../../sharedProfile/mobile/HeaderStripMobile'

import playersImg from '../../../../ui/core/images/players.png'
import staffImg from '../../../../ui/core/images/staff.png'
import teamsImg from '../../../../ui/core/images/teams.png'

export function getMobileSectionImage(key) {
  if (key === 'players') return playersImg
  if (key === 'staff') return staffImg
  if (key === 'teams') return teamsImg
  if (key === 'clubs') return teamsImg
  return playersImg
}

export default function HubSectionScreenMobile({
  mode,
  tabsMeta = [],
  children,
  onBack,
}) {
  const navigate = useNavigate()

  const currentTab = tabsMeta.find((tab) => tab.value === mode) || null

  const pathItems = useMemo(() => {
    return [
      {
        label: 'מרכז שליטה',
        onClick: () => navigate('/hub'),
      },
    ]
  }, [navigate])

  const subtitle = useMemo(() => {
    if (mode === 'players') return 'רשימת שחקנים'
    if (mode === 'teams') return 'רשימת קבוצות'
    if (mode === 'clubs') return 'רשימת מועדונים'
    if (mode === 'staff') return 'רשימת אנשי צוות'
    if (mode === 'privates') return 'שחקנים פרטיים'
    if (mode === 'scouting') return 'שחקנים למעקב'
    return 'רשימת אובייקטים'
  }, [mode])

  return (
    <Box sx={sx.boxWraper}>
      <HeaderStripMobile
        avatarSrc={getMobileSectionImage(mode)}
        title={currentTab?.label || 'אזור'}
        subtitle={subtitle}
        onBack={onBack}
        pathItems={pathItems}
      />

      <Box sx={sx.box}>
        {children}
      </Box>
    </Box>
  )
}

// src/features/hub/components/mobile/HubSectionScreenMobile.js

import React, { useMemo } from 'react'
import { Box } from '@mui/joy'
import { useNavigate } from 'react-router-dom'

import HeaderStripMobile from '../../sharedProfile/mobile/HeaderStripMobile.js'
import { hubMobileSx as sx } from './sx/hubMobile.sx.js'

export default function HubSectionScreenMobile({
  mode,
  title,
  tabsMeta = [],
  children,
  onBack,
}) {
  const navigate = useNavigate()

  const currentTab = tabsMeta.find((tab) => tab.value === mode) || null

  const pathItems = useMemo(() => {
    return [
      {
        label: title || 'מרכז שליטה',
        onClick: () => navigate('/hub'),
      },
    ]
  }, [navigate, title])

  const subtitle = useMemo(() => {
    if (mode === 'players') return 'רשימת שחקנים'
    if (mode === 'teams') return 'רשימת קבוצות'
    if (mode === 'clubs') return 'רשימת מועדונים'
    if (mode === 'privates') return 'שחקנים פרטיים'
    if (mode === 'scouting') return 'שחקנים למעקב'
    return 'רשימת אובייקטים'
  }, [mode])

  return (
    <Box sx={sx.boxWraper}>
      <HeaderStripMobile
        avatarContent={currentTab?.icon || null}
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

// src/features/hub/components/mobile/HubRootMobile.js

import React, { useState } from 'react'
import { Sheet } from '@mui/joy'

import HubHomeMobile from './HubHomeMobile'
import HubSectionScreenMobile from './HubSectionScreenMobile'
import HubContentMobile from './HubContentMobile'

import { hubMobileSx as sx } from './sx/hubMobile.sx'

export default function HubRootMobile({
  mode,
  counts = {},
  tabsMeta = [],
  onModeChange,
  mobileListsProps = {},
}) {
  const [mobileView, setMobileView] = useState('home')

  const handleSelectMode = (nextMode) => {
    onModeChange(nextMode)
    setMobileView('section')
  }

  const handleBack = () => {
    setMobileView('home')
  }

  return (
    <Sheet sx={sx.root}>
      {mobileView === 'home' ? (
        <HubHomeMobile
          tabsMeta={tabsMeta}
          counts={counts}
          onSelectMode={handleSelectMode}
        />
      ) : (
        <HubSectionScreenMobile
          mode={mode}
          tabsMeta={tabsMeta}
          onBack={handleBack}
        >
          <HubContentMobile
            mode={mode}
            listProps={mobileListsProps[mode] || {}}
          />
        </HubSectionScreenMobile>
      )}
    </Sheet>
  )
}

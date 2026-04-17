/// src/features/hub/clubProfile/mobile/components/ClubNav.js

import React from 'react'
import NavCardsMobile from '../../../sharedProfile/mobile/NavCardsMobile.js'
import { CLUB_TABS, DEFAULT_TAB } from '../../clubProfile.routes'

export default function ClubNav({ tab }) {
  return (
    <NavCardsMobile
      tabs={CLUB_TABS}
      activeTab={tab}
      defaultTab={DEFAULT_TAB}
    />
  )
}

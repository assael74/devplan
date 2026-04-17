// features/hub/teamProfile/desktop/components/TeamNav.js

import React from 'react'
import NavCards from '../../../../hub/sharedProfile/desktop/NavCards'
import { TEAM_TABS, DEFAULT_TAB } from '../../teamProfile.routes'

export default function TeamNav({ tab }) {
  return (
    <NavCards
      tabs={TEAM_TABS}
      activeTab={tab}
      defaultTab={DEFAULT_TAB}
    />
  )
}

/// src/features/hub/teamProfile/components/TeamNav.js
import React from 'react'
import NavCards from '../../../hub/sharedProfile/NavCards'
import { CLUB_TABS, DEFAULT_TAB } from '../clubProfile.routes'

export default function ClubNav({ tab }) {
  return (
    <NavCards
      tabs={CLUB_TABS}
      activeTab={tab}
      defaultTab={DEFAULT_TAB}
    />
  )
}

// src/features/players/playerProfile/desktop/components/PlayerNav.js

import React, { useMemo } from 'react'
import NavCards from '../../../../hub/sharedProfile/desktop/NavCards'
import { PLAYER_TABS, PLAYER_PROJECT_TABS, DEFAULT_TAB } from '../../playerProfile.routes'

export default function PlayerNav({ tab, entity }) {
  const tabs = useMemo(() => {
    const isProject = entity?.type === 'project'
    return isProject ? PLAYER_PROJECT_TABS : PLAYER_TABS
  }, [entity?.type])

  return (
    <NavCards
      tabs={tabs}
      activeTab={tab}
      defaultTab={DEFAULT_TAB}
    />
  )
}

// src/features/players/playerProfile/desktop/components/PlayerNav.js

import React, { useMemo } from 'react'
import NavCards from '../../../../hub/sharedProfile/desktop/NavCards'
import {
  PLAYER_TABS,
  PLAYER_PROJECT_TABS,
  PRIVATE_PLAYER_TABS,
  DEFAULT_TAB,
} from '../../playerProfile.routes'

export default function PlayerNav({ tab, entity }) {
  const tabs = useMemo(() => {
    if (entity?.type === 'project') return PLAYER_PROJECT_TABS
    if (entity?.isPrivatePlayer === true) return PRIVATE_PLAYER_TABS
    return PLAYER_TABS
  }, [entity?.type, entity?.isPrivatePlayer])

  return (
    <NavCards
      tabs={tabs}
      activeTab={tab}
      defaultTab={DEFAULT_TAB}
    />
  )
}

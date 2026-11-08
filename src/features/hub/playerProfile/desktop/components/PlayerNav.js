// src/features/hub/playerProfile/desktop/components/PlayerNav.js

import React, { useMemo } from 'react'
import { Box } from '@mui/joy'
import NavCards from '../../../../hub/sharedProfile/desktop/NavCards'
import { devPlanColors } from '../../../../../ui/core/theme/Colors.js'
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
    <Box sx={{ pb: 1.25, borderBottom: '1px solid', borderColor: devPlanColors.border }}>
      <NavCards
        tabs={tabs}
        activeTab={tab}
        defaultTab={DEFAULT_TAB}
      />
    </Box>
  )
}

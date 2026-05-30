// playerProfile/desktop/modules/abilities/PlayerAbilitiesModule.js

import React from 'react'

import PlayerAbilitiesToolbar from './components/PlayerAbilitiesToolbar.js'
import AbilitiesDomainCard from './components/AbilitiesDomainCard'
import AbilitiesInviteCreateDrawer from './components/inviteDrawer/AbilitiesInviteCreateDrawer'
import PlayerAbilitiesInsightsDrawer from './components/insightsDrawer/PlayerAbilitiesInsightsDrawer.js'

import {
  abilitiesModuleSx,
  stickyHeaderWrapSx,
} from './sx/Ability.module.sx'

import { PlayerAbilitiesModuleBase } from '../../../sharedModules/abilities'

export default function PlayerAbilitiesModule(props) {
  return (
    <PlayerAbilitiesModuleBase
      {...props}
      isMobile={false}
      desktopRootSx={abilitiesModuleSx}
      stickyHeaderSx={stickyHeaderWrapSx}
      PlayerAbilitiesToolbar={PlayerAbilitiesToolbar}
      AbilitiesDomainCard={AbilitiesDomainCard}
      AbilitiesInviteCreateDrawer={AbilitiesInviteCreateDrawer}
      PlayerAbilitiesInsightsDrawer={PlayerAbilitiesInsightsDrawer}
    />
  )
}

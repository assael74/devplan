// teamProfile/desktop/modules/abilities/TeamAbilitiesModule.js

import React from 'react'

import TeamAbilitiesToolbar from './components/TeamAbilitiesToolbar.js'
import AbilitiesDomainCard from './components/AbilitiesDomainCard.js'
import TeamAbilitiesInsightsDrawer from './components/insightsDrawer/TeamAbilitiesInsightsDrawer.js'

import { moduleSx as sx } from './sx/module.sx.js'

import { TeamAbilitiesModuleBase } from '../../../sharedModules/abilities'

export default function TeamAbilitiesModule(props) {
  return (
    <TeamAbilitiesModuleBase
      {...props}
      isMobile={false}
      toolbarWrapSx={sx.toolbarWrap}
      stickySx={sx.sticky}
      TeamAbilitiesToolbar={TeamAbilitiesToolbar}
      AbilitiesDomainCard={AbilitiesDomainCard}
      TeamAbilitiesInsightsDrawer={TeamAbilitiesInsightsDrawer}
    />
  )
}

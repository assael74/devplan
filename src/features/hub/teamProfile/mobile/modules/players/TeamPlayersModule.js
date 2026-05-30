// teamProfile/mobile/modules/players/TeamPlayersModule.js

import React from 'react'

import SectionPanelMobile from '../../../../sharedProfile/mobile/SectionPanelMobile.js'

import TeamPlayersToolbar from './components/toolbar/TeamPlayersToolbar.js'
import TeamPlayersList from './components/TeamPlayersList.js'

import TeamPlayerQuickEditDrawer from './components/drawer/TeamPlayerQuickEditDrawer.js'
import TeamPlayerPositionsDrawer from './components/drawer/TeamPlayerPositionsModal.js'
import TeamPlayersInsightsDrawer from './components/insightsDrawer/TeamPlayersInsightsDrawer.js'

import { TeamPlayersModuleBase } from '../../../sharedModules/players'

import { profileSx as sx } from './../../sx/profile.sx'

export default function TeamPlayersModule(props) {
  return (
    <TeamPlayersModuleBase
      {...props}
      Section={SectionPanelMobile}
      ToolbarComponent={TeamPlayersToolbar}
      ListComponent={TeamPlayersList}
      QuickEditDrawerComponent={TeamPlayerQuickEditDrawer}
      PositionsDrawerComponent={TeamPlayerPositionsDrawer}
      InsightsDrawerComponent={TeamPlayersInsightsDrawer}
      toolbarWrapSx={sx.moduleRoot}
    />
  )
}

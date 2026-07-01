// teamProfile/desktop/modules/players/TeamPlayersModule.js

import React from 'react'

import SectionPanel from '../../../../sharedProfile/desktop/SectionPanel.js'

import TeamPlayersToolbar from './components/toolbar/TeamPlayersToolbar.js'
import TeamPlayersList from './components/TeamPlayersList.js'

import TeamPlayerQuickEditDrawer from './components/drawer/TeamPlayerQuickEditDrawer.js'
import TeamPlayerPositionsDrawer from './components/drawer/TeamPlayerPositionsModal.js'
import TeamPlayersInsightsDrawer from './components/insightsDrawer/TeamPlayersInsightsDrawer.js'

import { TeamPlayersModuleBase, teamPlayersModuleSx } from '../../../sharedModules/players'

export default function TeamPlayersModule(props) {
  return (
    <TeamPlayersModuleBase
      {...props}
      bulkEnabled
      Section={SectionPanel}
      ToolbarComponent={TeamPlayersToolbar}
      ListComponent={TeamPlayersList}
      QuickEditDrawerComponent={TeamPlayerQuickEditDrawer}
      PositionsDrawerComponent={TeamPlayerPositionsDrawer}
      InsightsDrawerComponent={TeamPlayersInsightsDrawer}
      toolbarWrapSx={teamPlayersModuleSx.desktopToolbarWrap}
    />
  )
}

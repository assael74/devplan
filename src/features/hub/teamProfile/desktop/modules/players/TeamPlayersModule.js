// teamProfile/desktop/modules/players/TeamPlayersModule.js

import React from 'react'

import SectionPanel from '../../../../sharedProfile/desktop/SectionPanel.js'

import { TeamPlayersModuleBase, teamPlayersModuleSx } from '../../../sharedModules/players'

const TeamPlayersToolbar = React.lazy(() => import('./components/toolbar/TeamPlayersToolbar.js'))
const TeamPlayersList = React.lazy(() => import('./components/TeamPlayersList.js'))
const TeamPlayerQuickEditDrawer = React.lazy(() => import('./components/drawer/TeamPlayerQuickEditDrawer.js'))
const TeamPlayerPositionsDrawer = React.lazy(() => import('./components/drawer/TeamPlayerPositionsModal.js'))
const TeamPlayersInsightsDrawer = React.lazy(() => import('./components/insightsDrawer/TeamPlayersInsightsDrawer.js'))

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

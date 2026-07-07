// teamProfile/desktop/modules/games/TeamGamesModule.js

import React from 'react'

import SectionPanel from '../../../../sharedProfile/desktop/SectionPanel.js'

import {
  TeamGamesModuleBase,
  desktopTeamGamesModuleSx,
} from '../../../sharedModules/games'

const TeamGamesToolbar = React.lazy(() => import('./components/toolbar/TeamGamesToolbar.js'))
const TeamGamesList = React.lazy(() => import('./components/TeamGamesList.js'))
const TeamGamesInsightsDrawer = React.lazy(() => import('./components/insightsDrawer/TeamGamesInsightsDrawer.js'))
const EditDrawer = React.lazy(() => import('./components/drawer/EditDrawer.js'))
const EntryEditDrawer = React.lazy(() => import('./components/entryDrawer/EntryEditDrawer.js'))

export default function TeamGamesModule(props) {
  return (
    <TeamGamesModuleBase
      {...props}
      Section={SectionPanel}
      ToolbarComponent={TeamGamesToolbar}
      ListComponent={TeamGamesList}
      InsightsDrawerComponent={TeamGamesInsightsDrawer}
      EditDrawerComponent={EditDrawer}
      EntryEditDrawerComponent={EntryEditDrawer}
      toolbarWrapSx={desktopTeamGamesModuleSx.desktopToolbarWrap}
      enableStatsForm
    />
  )
}

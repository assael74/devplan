// teamProfile/desktop/modules/games/TeamGamesModule.js

import React from 'react'

import SectionPanel from '../../../../sharedProfile/desktop/SectionPanel.js'

import TeamGamesToolbar from './components/toolbar/TeamGamesToolbar.js'
import TeamGamesList from './components/TeamGamesList.js'
import TeamGamesInsightsDrawer from './components/insightsDrawer/TeamGamesInsightsDrawer.js'
import EditDrawer from './components/drawer/EditDrawer.js'
import EntryEditDrawer from './components/entryDrawer/EntryEditDrawer.js'

import {
  TeamGamesModuleBase,
  desktopTeamGamesModuleSx,
} from '../../../sharedModules/games'

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

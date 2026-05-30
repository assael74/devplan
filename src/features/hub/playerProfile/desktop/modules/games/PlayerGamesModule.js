// playerProfile/desktop/modules/games/PlayerGamesModule.js

import React from 'react'

import SectionPanel from '../../../../sharedProfile/desktop/SectionPanel.js'

import PlayerGamesToolbar from './components/toolbar/PlayerGamesToolbar.js'
import PlayerGamesList from './components/PlayerGamesList.js'
import PlayerGamesInsightsDrawer from './components/insightsDrawer/PlayerGamesInsightsDrawer.js'
import EntryEditDrawer from './components/entryDrawer/EntryEditDrawer.js'
import EditDrawer from './components/drawer/EditDrawer.js'

import {
  PlayerGamesModuleBase,
  playerGamesModuleSx,
} from '../../../sharedModules/games'

export default function PlayerGamesModule(props) {
  return (
    <PlayerGamesModuleBase
      {...props}
      Section={SectionPanel}
      ToolbarComponent={PlayerGamesToolbar}
      ListComponent={PlayerGamesList}
      InsightsDrawerComponent={PlayerGamesInsightsDrawer}
      EntryEditDrawerComponent={EntryEditDrawer}
      EditDrawerComponent={EditDrawer}
      toolbarWrapSx={playerGamesModuleSx.desktopToolbarWrap}
      seasonStartYear={2025}
    />
  )
}

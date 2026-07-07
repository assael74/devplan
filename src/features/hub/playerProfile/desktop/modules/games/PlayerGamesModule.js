// playerProfile/desktop/modules/games/PlayerGamesModule.js

import React from 'react'

import SectionPanel from '../../../../sharedProfile/desktop/SectionPanel.js'

import {
  PlayerGamesModuleBase,
  playerGamesModuleSx,
} from '../../../sharedModules/games'

const PlayerGamesToolbar = React.lazy(() => import('./components/toolbar/PlayerGamesToolbar.js'))
const PlayerGamesList = React.lazy(() => import('./components/PlayerGamesList.js'))
const PlayerGamesInsightsDrawer = React.lazy(() => import('./components/insightsDrawer/PlayerGamesInsightsDrawer.js'))
const EntryEditDrawer = React.lazy(() => import('./components/entryDrawer/EntryEditDrawer.js'))
const EditDrawer = React.lazy(() => import('./components/drawer/EditDrawer.js'))

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

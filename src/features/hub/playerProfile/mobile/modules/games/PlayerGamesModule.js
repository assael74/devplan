// playerProfile/mobile/modules/games/PlayerGamesModule.js

import React from 'react'

import SectionPanelMobile from '../../../../sharedProfile/mobile/SectionPanelMobile.js'

import PlayerGamesToolbar from './components/PlayerGamesToolbar.js'
import PlayerGamesList from './components/PlayerGamesList.js'
import PlayerGamesInsightsDrawer from './components/insightsDrawer/PlayerGamesInsightsDrawer.js'
import EntryEditDrawer from './components/entryDrawer/EntryEditDrawer.js'
import EditDrawer from './components/drawer/EditDrawer.js'

import { PlayerGamesModuleBase } from '../../../sharedModules/games'

import { profileSx as sx } from './../../sx/profile.sx'

export default function PlayerGamesModule(props) {
  return (
    <PlayerGamesModuleBase
      {...props}
      Section={SectionPanelMobile}
      ToolbarComponent={PlayerGamesToolbar}
      ListComponent={PlayerGamesList}
      InsightsDrawerComponent={PlayerGamesInsightsDrawer}
      EntryEditDrawerComponent={EntryEditDrawer}
      EditDrawerComponent={EditDrawer}
      toolbarWrapSx={sx.moduleRoot}
      seasonStartYear={2025}
    />
  )
}

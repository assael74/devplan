// playerProfile/mobile/modules/games/PlayerGamesModule.js

import React from 'react'

import SectionPanelMobile from '../../../../sharedProfile/mobile/SectionPanelMobile.js'

import { PlayerGamesModuleBase } from '../../../sharedModules/games'

import { profileSx as sx } from './../../sx/profile.sx'

const PlayerGamesToolbar = React.lazy(() => import('./components/PlayerGamesToolbar.js'))
const PlayerGamesList = React.lazy(() => import('./components/PlayerGamesList.js'))
const PlayerGamesInsightsDrawer = React.lazy(() => import('./components/insightsDrawer/PlayerGamesInsightsDrawer.js'))
const EntryEditDrawer = React.lazy(() => import('./components/entryDrawer/EntryEditDrawer.js'))
const EditDrawer = React.lazy(() => import('./components/drawer/EditDrawer.js'))

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

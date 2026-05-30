// teamProfile/mobile/modules/games/TeamGamesModule.js

import React from 'react'

import SectionPanelMobile from '../../../../sharedProfile/mobile/SectionPanelMobile.js'

import TeamGamesList from './components/TeamGamesList.js'
import TeamGamesToolbar from './components/toolbar/TeamGamesToolbar.js'
import TeamGamesInsightsDrawer from './components/insightsDrawer/TeamGamesInsightsDrawer.js'
import EditDrawer from './components/drawer/EditDrawer.js'
import EntryEditDrawer from './components/entryDrawer/EntryEditDrawer.js'

import { TeamGamesModuleBase } from '../../../sharedModules/games'

import { profileSx as sx } from './../../sx/profile.sx'

export default function TeamGamesModule(props) {
  return (
    <TeamGamesModuleBase
      {...props}
      Section={SectionPanelMobile}
      ToolbarComponent={TeamGamesToolbar}
      ListComponent={TeamGamesList}
      InsightsDrawerComponent={TeamGamesInsightsDrawer}
      EditDrawerComponent={EditDrawer}
      EntryEditDrawerComponent={EntryEditDrawer}
      toolbarWrapSx={sx.moduleRoot}
      enableStatsForm={false}
    />
  )
}

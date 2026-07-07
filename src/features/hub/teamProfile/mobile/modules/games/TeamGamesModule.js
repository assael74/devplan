// teamProfile/mobile/modules/games/TeamGamesModule.js

import React from 'react'

import SectionPanelMobile from '../../../../sharedProfile/mobile/SectionPanelMobile.js'

import { TeamGamesModuleBase } from '../../../sharedModules/games'

import { profileSx as sx } from './../../sx/profile.sx'

const TeamGamesList = React.lazy(() => import('./components/TeamGamesList.js'))
const TeamGamesToolbar = React.lazy(() => import('./components/toolbar/TeamGamesToolbar.js'))
const TeamGamesInsightsDrawer = React.lazy(() => import('./components/insightsDrawer/TeamGamesInsightsDrawer.js'))
const EditDrawer = React.lazy(() => import('./components/drawer/EditDrawer.js'))
const EntryEditDrawer = React.lazy(() => import('./components/entryDrawer/EntryEditDrawer.js'))

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

// teamProfile/mobile/modules/players/TeamPlayersModule.js

import React from 'react'

import SectionPanelMobile from '../../../../sharedProfile/mobile/SectionPanelMobile.js'

import { TeamPlayersModuleBase } from '../../../sharedModules/players'

import { profileSx as sx } from './../../sx/profile.sx'

const TeamPlayersToolbar = React.lazy(() => import('./components/toolbar/TeamPlayersToolbar.js'))
const TeamPlayersList = React.lazy(() => import('./components/TeamPlayersList.js'))
const TeamPlayerQuickEditDrawer = React.lazy(() => import('./components/drawer/TeamPlayerQuickEditDrawer.js'))
const TeamPlayerPositionsDrawer = React.lazy(() => import('./components/drawer/TeamPlayerPositionsModal.js'))
const TeamPlayersInsightsDrawer = React.lazy(() => import('./components/insightsDrawer/TeamPlayersInsightsDrawer.js'))

export default function TeamPlayersModule(props) {
  return (
    <TeamPlayersModuleBase
      {...props}
      Section={SectionPanelMobile}
      ToolbarComponent={TeamPlayersToolbar}
      ListComponent={TeamPlayersList}
      QuickEditDrawerComponent={TeamPlayerQuickEditDrawer}
      PositionsDrawerComponent={TeamPlayerPositionsDrawer}
      InsightsDrawerComponent={TeamPlayersInsightsDrawer}
      toolbarWrapSx={sx.moduleRoot}
    />
  )
}

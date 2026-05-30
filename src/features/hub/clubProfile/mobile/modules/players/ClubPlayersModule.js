// clubProfile/mobile/modules/players/ClubPlayersModule.js

import React from 'react'

import SectionPanelMobile from '../../../../sharedProfile/mobile/SectionPanelMobile.js'

import ClubPlayersToolbar from './components/toolbar/ClubPlayersToolbar.js'
import ClubPlayersList from './components/ClubPlayersList.js'
import ClubPlayersInsightsDrawer from './components/insightsDrawer/ClubPlayersInsightsDrawer.js'

import { profileSx as sx } from './../../sx/profile.sx'

import { ClubPlayersModuleBase } from '../../../sharedModules/players'

export default function ClubPlayersModule(props) {
  return (
    <ClubPlayersModuleBase
      {...props}
      Section={SectionPanelMobile}
      isMobile
      ToolbarComponent={ClubPlayersToolbar}
      ListComponent={ClubPlayersList}
      InsightsDrawerComponent={ClubPlayersInsightsDrawer}
      toolbarWrapSx={sx.moduleRoot}
    />
  )
}

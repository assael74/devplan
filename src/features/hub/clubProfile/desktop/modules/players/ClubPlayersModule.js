// clubProfile/desktop/modules/players/ClubPlayersModule.js

import React from 'react'

import SectionPanel from '../../../../sharedProfile/desktop/SectionPanel.js'

import ClubPlayersToolbar from './components/toolbar/ClubPlayersToolbar.js'
import ClubPlayersList from './components/ClubPlayersList.js'
import ClubPlayersInsightsDrawer from './components/insightsDrawer/ClubPlayersInsightsDrawer.js'

import {
  ClubPlayersModuleBase,
  clubPlayersModuleSx,
} from '../../../sharedModules/players'

export default function ClubPlayersModule(props) {
  return (
    <ClubPlayersModuleBase
      {...props}
      Section={SectionPanel}
      isMobile={false}
      ToolbarComponent={ClubPlayersToolbar}
      ListComponent={ClubPlayersList}
      InsightsDrawerComponent={ClubPlayersInsightsDrawer}
      toolbarWrapSx={clubPlayersModuleSx.desktopToolbarWrap}
    />
  )
}

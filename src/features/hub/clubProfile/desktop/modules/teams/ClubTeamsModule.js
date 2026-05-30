// clubProfile/desktop/modules/teams/ClubTeamsModule.js

import React from 'react'

import SectionPanel from '../../../../sharedProfile/desktop/SectionPanel.js'

import ClubTeamsToolbar from './components/toolbar/ClubTeamsToolbar.js'
import ClubTeamsList from './components/ClubTeamsList.js'
import EditDrawer from './components/drawer/EditDrawer.js'
import ClubTeamsInsightsDrawer from './components/insightsDrawer/ClubTeamsInsightsDrawer.js'

import {
  ClubTeamsModuleBase,
  clubTeamsModuleSx,
} from '../../../sharedModules/teams'

export default function ClubTeamsModule(props) {
  return (
    <ClubTeamsModuleBase
      {...props}
      Section={SectionPanel}
      isMobile={false}
      ToolbarComponent={ClubTeamsToolbar}
      ListComponent={ClubTeamsList}
      InsightsDrawerComponent={ClubTeamsInsightsDrawer}
      EditDrawerComponent={EditDrawer}
      toolbarWrapSx={clubTeamsModuleSx.desktopToolbarWrap}
      initialSortDirection="desc"
    />
  )
}

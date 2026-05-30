// clubProfile/mobile/modules/teams/ClubTeamsModule.js

import React from 'react'

import SectionPanelMobile from '../../../../sharedProfile/mobile/SectionPanelMobile.js'

import ClubTeamsToolbar from './components/toolbar/ClubTeamsToolbar.js'
import ClubTeamsList from './components/ClubTeamsList.js'
import ClubTeamsInsightsDrawer from './components/insightsDrawer/ClubTeamsInsightsDrawer.js'
import EditDrawer from './components/drawer/EditDrawer.js'

import { profileSx as sx } from './../../sx/profile.sx'

import { ClubTeamsModuleBase } from '../../../sharedModules/teams'

export default function ClubTeamsModule(props) {
  return (
    <ClubTeamsModuleBase
      {...props}
      Section={SectionPanelMobile}
      isMobile
      ToolbarComponent={ClubTeamsToolbar}
      ListComponent={ClubTeamsList}
      InsightsDrawerComponent={ClubTeamsInsightsDrawer}
      EditDrawerComponent={EditDrawer}
      toolbarWrapSx={sx.moduleRoot}
      initialSortDirection="asc"
    />
  )
}

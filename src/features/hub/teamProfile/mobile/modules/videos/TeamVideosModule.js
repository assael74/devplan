// teamProfile/mobile/modules/videos/TeamVideosModule.js

import React from 'react'

import SectionPanelMobile from '../../../../sharedProfile/mobile/SectionPanelMobile.js'

import TeamVideosToolbar from './components/toolbar/TeamVideosToolbar.js'
import TeamVideosList from './components/TeamVideosList.js'

import TeamVideosInsightsDrawer from './components/insightsDrawer/TeamVideosInsightsDrawer.js'
import EditDrawer from './components/drawer/EditDrawer.js'

import { TeamVideosModuleBase } from '../../../sharedModules/videos'

import { profileSx as sx } from './../../sx/profile.sx'

export default function TeamVideosModule(props) {
  return (
    <TeamVideosModuleBase
      {...props}
      Section={SectionPanelMobile}
      ToolbarComponent={TeamVideosToolbar}
      ListComponent={TeamVideosList}
      InsightsDrawerComponent={TeamVideosInsightsDrawer}
      EditDrawerComponent={EditDrawer}
      toolbarWrapSx={sx.moduleRoot}
      seasonStartYear={2025}
    />
  )
}

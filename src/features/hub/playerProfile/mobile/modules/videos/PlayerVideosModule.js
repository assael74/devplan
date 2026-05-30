// playerProfile/mobile/modules/videos/PlayerVideosModule.js

import React from 'react'

import SectionPanelMobile from '../../../../sharedProfile/mobile/SectionPanelMobile.js'

import PlayerVideosToolbar from './components/toolbar/PlayerVideosToolbar.js'
import PlayerVideosList from './components/PlayerVideosList.js'

import PlayerVideosInsightsDrawer from './components/insightsDrawer/PlayerVideosInsightsDrawer.js'
import EditDrawer from './components/drawer/EditDrawer.js'

import { PlayerVideosModuleBase } from '../../../sharedModules/videos'

import { profileSx as sx } from './../../sx/profile.sx'

export default function PlayerVideosModule(props) {
  return (
    <PlayerVideosModuleBase
      {...props}
      Section={SectionPanelMobile}
      ToolbarComponent={PlayerVideosToolbar}
      ListComponent={PlayerVideosList}
      InsightsDrawerComponent={PlayerVideosInsightsDrawer}
      EditDrawerComponent={EditDrawer}
      toolbarWrapSx={sx.moduleRoot}
      seasonStartYear={2025}
    />
  )
}

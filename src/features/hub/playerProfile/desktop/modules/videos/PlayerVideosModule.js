// playerProfile/desktop/modules/videos/PlayerVideosModule.js

import React from 'react'

import SectionPanel from '../../../../sharedProfile/desktop/SectionPanel.js'

import PlayerVideosToolbar from './components/toolbar/PlayerVideosToolbar.js'
import PlayerVideosList from './components/PlayerVideosList.js'

import PlayerVideosInsightsDrawer from './components/insightsDrawer/PlayerVideosInsightsDrawer.js'

import {
  PlayerVideosModuleBase,
  playerVideosModuleSx,
} from '../../../sharedModules/videos'

export default function PlayerVideosModule(props) {
  return (
    <PlayerVideosModuleBase
      {...props}
      Section={SectionPanel}
      ToolbarComponent={PlayerVideosToolbar}
      ListComponent={PlayerVideosList}
      InsightsDrawerComponent={PlayerVideosInsightsDrawer}
      toolbarWrapSx={playerVideosModuleSx.desktopToolbarWrap}
      seasonStartYear={2025}
    />
  )
}

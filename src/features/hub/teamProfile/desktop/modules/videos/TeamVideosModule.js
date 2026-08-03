// teamProfile/desktop/modules/videos/TeamVideosModule.js

import React from 'react'

import SectionPanel from '../../../../sharedProfile/desktop/SectionPanel.js'

import TeamVideosToolbar from './components/toolbar/TeamVideosToolbar.js'
import TeamVideosList from './components/TeamVideosList.js'

import TeamVideosInsightsDrawer from './components/insightsDrawer/TeamVideosInsightsDrawer.js'

import {
  TeamVideosModuleBase,
  teamVideosModuleSx,
} from '../../../sharedModules/videos'

export default function TeamVideosModule(props) {
  return (
    <TeamVideosModuleBase
      {...props}
      Section={SectionPanel}
      ToolbarComponent={TeamVideosToolbar}
      ListComponent={TeamVideosList}
      InsightsDrawerComponent={TeamVideosInsightsDrawer}
      toolbarWrapSx={teamVideosModuleSx.desktopToolbarWrap}
      seasonStartYear={2025}
    />
  )
}

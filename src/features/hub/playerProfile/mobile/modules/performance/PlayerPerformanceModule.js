// src/features/hub/playerProfile/mobile/modules/performance/PlayerPerformanceModule.js

import React from 'react'
import SectionPanelMobile from '../../../../sharedProfile/mobile/SectionPanelMobile.js'
import PlayerPerformanceWorkspace from '../../../sharedModules/performance/PlayerPerformanceModule.js'

export default function PlayerPerformanceModule(props) {
  return <SectionPanelMobile><PlayerPerformanceWorkspace {...props} /></SectionPanelMobile>
}

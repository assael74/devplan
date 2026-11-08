// src/features/hub/playerProfile/desktop/modules/performance/PlayerPerformanceModule.js

import React from 'react'
import SectionPanel from '../../../../sharedProfile/desktop/SectionPanel.js'
import PlayerPerformanceWorkspace from '../../../sharedModules/performance/PlayerPerformanceModule.js'

export default function PlayerPerformanceModule(props) {
  return <SectionPanel scrollMode="contained"><PlayerPerformanceWorkspace {...props} /></SectionPanel>
}

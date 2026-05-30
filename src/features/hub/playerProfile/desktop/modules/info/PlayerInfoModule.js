// playerProfile/desktop/modules/info/PlayerInfoModule.js

import React from 'react'

import SectionPanel from '../../../../sharedProfile/desktop/SectionPanel.js'
import { moduleSx as sx } from './module.sx.js'

import PlayerStatusCard from './components/PlayerStatusCard.js'
import ProjectStatusCard from './components/ProjectStatusCard.js'
import PlayerNamesCard from './components/PlayerNamesCard.js'
import PlayerAffiliationCard from './components/PlayerAffiliationCard.js'
import PlayerPhysicalCard from './components/PlayerPhysicalCard.js'
import PlayerBirthCard from './components/PlayerBirthCard.js'
import PlayerPositionCard from './components/PlayerPositionCard.js'
import PlayerTargetsCard from './components/PlayerTargetsCard.js'
import PlayerInfoToolbar from './components/PlayerInfoToolbar.js'
import PlayerInfoTabs, { PLAYER_INFO_TABS } from './components/PlayerInfoTabs.js'

import { PlayerInfoModuleBase } from '../../../sharedModules/info'

export default function PlayerInfoModule(props) {
  return (
    <PlayerInfoModuleBase
      {...props}
      Section={SectionPanel}
      isMobile={false}
      source="PlayerInfoModule"
      toolbarWrapSx={sx.stickyToolbar}
      gridSx={sx.grid}
      PlayerInfoToolbar={PlayerInfoToolbar}
      PlayerInfoTabs={PlayerInfoTabs}
      playerInfoTabs={PLAYER_INFO_TABS}
      PlayerStatusCard={PlayerStatusCard}
      ProjectStatusCard={ProjectStatusCard}
      PlayerNamesCard={PlayerNamesCard}
      PlayerAffiliationCard={PlayerAffiliationCard}
      PlayerPhysicalCard={PlayerPhysicalCard}
      PlayerBirthCard={PlayerBirthCard}
      PlayerPositionCard={PlayerPositionCard}
      PlayerTargetsCard={PlayerTargetsCard}
    />
  )
}

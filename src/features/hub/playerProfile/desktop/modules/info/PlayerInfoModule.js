// playerProfile/desktop/modules/info/PlayerInfoModule.js

import React from 'react'

import SectionPanel from '../../../../sharedProfile/desktop/SectionPanel.js'
import { moduleSx as sx } from './module.sx.js'
import PlayerInfoTabs, { PLAYER_INFO_TABS } from './components/PlayerInfoTabs.js'

import { PlayerInfoModuleBase } from '../../../sharedModules/info'

const PlayerStatusCard = React.lazy(() => import('./components/PlayerStatusCard.js'))
const ProjectStatusCard = React.lazy(() => import('./components/ProjectStatusCard.js'))
const PlayerNamesCard = React.lazy(() => import('./components/PlayerNamesCard.js'))
const PlayerAffiliationCard = React.lazy(() => import('./components/PlayerAffiliationCard.js'))
const PlayerPhysicalCard = React.lazy(() => import('./components/PlayerPhysicalCard.js'))
const PlayerBirthCard = React.lazy(() => import('./components/PlayerBirthCard.js'))
const PlayerPositionCard = React.lazy(() => import('./components/PlayerPositionCard.js'))
const PlayerTargetsCard = React.lazy(() => import('./components/PlayerTargetsCard.js'))
const PlayerInfoToolbar = React.lazy(() => import('./components/PlayerInfoToolbar.js'))

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

// playerProfile/mobile/modules/info/PlayerInfoModule.js

import React from 'react'

import SectionPanelMobile from '../../../../sharedProfile/mobile/SectionPanelMobile.js'
import { profileSx as sx } from './../../sx/profile.sx'

import { PlayerInfoModuleBase } from '../../../sharedModules/info'

const PlayerStatusCard = React.lazy(() => import('./components/PlayerStatusCard.js'))
const ProjectStatusCard = React.lazy(() => import('./components/ProjectStatusCard.js'))
const PlayerNamesCard = React.lazy(() => import('./components/PlayerNamesCard.js'))
const PlayerAffiliationCard = React.lazy(() => import('./components/PlayerAffiliationCard.js'))
const PlayerPhysicalCard = React.lazy(() => import('./components/PlayerPhysicalCard.js'))
const PlayerBirthCard = React.lazy(() => import('./components/PlayerBirthCard.js'))
const PlayerInfoToolbar = React.lazy(() => import('./PlayerInfoToolbar.js'))

export default function PlayerInfoModule(props) {
  return (
    <PlayerInfoModuleBase
      {...props}
      Section={SectionPanelMobile}
      isMobile
      source="PlayerInfoModuleMobile"
      rootSx={sx.moduleRoot}
      PlayerInfoToolbar={PlayerInfoToolbar}
      PlayerStatusCard={PlayerStatusCard}
      ProjectStatusCard={ProjectStatusCard}
      PlayerNamesCard={PlayerNamesCard}
      PlayerAffiliationCard={PlayerAffiliationCard}
      PlayerPhysicalCard={PlayerPhysicalCard}
      PlayerBirthCard={PlayerBirthCard}
    />
  )
}

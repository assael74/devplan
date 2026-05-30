// playerProfile/mobile/modules/info/PlayerInfoModule.js

import React from 'react'

import SectionPanelMobile from '../../../../sharedProfile/mobile/SectionPanelMobile.js'
import { profileSx as sx } from './../../sx/profile.sx'

import PlayerStatusCard from './components/PlayerStatusCard.js'
import ProjectStatusCard from './components/ProjectStatusCard.js'
import PlayerNamesCard from './components/PlayerNamesCard.js'
import PlayerAffiliationCard from './components/PlayerAffiliationCard.js'
import PlayerPhysicalCard from './components/PlayerPhysicalCard.js'
import PlayerBirthCard from './components/PlayerBirthCard.js'
import PlayerInfoToolbar from './PlayerInfoToolbar.js'

import { PlayerInfoModuleBase } from '../../../sharedModules/info'

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

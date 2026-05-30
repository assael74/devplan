// teamProfile/mobile/modules/abilities/TeamAbilitiesModule.js

import React from 'react'

import SectionPanelMobile from '../../../../sharedProfile/mobile/SectionPanelMobile.js'

import TeamAbilitiesToolbar from './components/TeamAbilitiesToolbar.js'
import AbilitiesFiltersContent from './components/AbilitiesFiltersContent.js'
import AbilitiesDomainCard from './components/AbilitiesDomainCard.js'
import TeamAbilitiesInsightsDrawer from './components/insightsDrawer/TeamAbilitiesInsightsDrawer.js'

import { TeamAbilitiesModuleBase } from '../../../sharedModules/abilities'

import { profileSx as sx } from '../../sx/profile.sx'

export default function TeamAbilitiesModule(props) {
  return (
    <TeamAbilitiesModuleBase
      {...props}
      isMobile
      Section={SectionPanelMobile}
      rootSx={sx.moduleRoot}
      TeamAbilitiesToolbar={TeamAbilitiesToolbar}
      AbilitiesFiltersContent={AbilitiesFiltersContent}
      AbilitiesDomainCard={AbilitiesDomainCard}
      TeamAbilitiesInsightsDrawer={TeamAbilitiesInsightsDrawer}
    />
  )
}

// playerProfile/mobile/modules/abilities/PlayerAbilitiesModule.js

import React from 'react'
import { useTheme } from '@mui/joy/styles'
import useMediaQuery from '@mui/material/useMediaQuery'

import SectionPanelMobile from '../../../../sharedProfile/mobile/SectionPanelMobile.js'

import PlayerAbilitiesToolbar from './components/PlayerAbilitiesToolbar.js'
import AbilitiesFiltersContent from './components/AbilitiesFiltersContent.js'
import AbilitiesDomainCard from './components/AbilitiesDomainCard'
import AbilitiesInviteCreateDrawer from './components/inviteDrawer/AbilitiesInviteCreateDrawer'
import PlayerAbilitiesInsightsDrawer from './components/insightsDrawer/PlayerAbilitiesInsightsDrawer.js'

import { PlayerAbilitiesModuleBase } from '../../../sharedModules/abilities'

import { profileSx as sx } from './../../sx/profile.sx'

export default function PlayerAbilitiesModule(props) {
  const theme = useTheme()
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'))

  return (
    <PlayerAbilitiesModuleBase
      {...props}
      isMobile
      isSmallMobile={isSmallMobile}
      Section={SectionPanelMobile}
      rootSx={sx.moduleRoot}
      PlayerAbilitiesToolbar={PlayerAbilitiesToolbar}
      AbilitiesFiltersContent={AbilitiesFiltersContent}
      AbilitiesDomainCard={AbilitiesDomainCard}
      AbilitiesInviteCreateDrawer={AbilitiesInviteCreateDrawer}
      PlayerAbilitiesInsightsDrawer={PlayerAbilitiesInsightsDrawer}
    />
  )
}

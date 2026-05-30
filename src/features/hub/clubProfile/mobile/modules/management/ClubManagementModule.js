// clubProfile/mobile/modules/management/ClubManagementModule.js

import React from 'react'

import SectionPanelMobile from '../../../../sharedProfile/mobile/SectionPanelMobile.js'

import { profileSx as sx } from './../../sx/profile.sx'

import ClubManagementInfoCard from './components/ClubManagementInfoCard.js'
import ClubManagementToolbar from './components/ClubManagementToolbar.js'

import { ClubManagementModuleBase } from '../../../sharedModules/management'

export default function ClubManagementModule(props) {
  return (
    <ClubManagementModuleBase
      {...props}
      Section={SectionPanelMobile}
      isMobile
      rootSx={sx.moduleRoot}
      emptyWrapSx={sx.moduleRoot}
      createIfMissing
      ClubManagementInfoCard={ClubManagementInfoCard}
      ClubManagementToolbar={ClubManagementToolbar}
    />
  )
}

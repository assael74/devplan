// clubProfile/desktop/modules/management/ClubManagementModule.js

import React from 'react'

import SectionPanel from '../../../../sharedProfile/desktop/SectionPanel.js'

import ClubManagementInfoCard from './components/ClubManagementInfoCard.js'
import ClubManagementToolbar from './components/ClubManagementToolbar.js'

import { moduleSx as sx } from './sx/module.sx'
import { ClubManagementModuleBase } from '../../../sharedModules/management'

export default function ClubManagementModule(props) {
  return (
    <ClubManagementModuleBase
      {...props}
      Section={SectionPanel}
      isMobile={false}
      rootSx={sx.root}
      rolesWrapSx={sx.rolesWrap}
      createIfMissing={false}
      ClubManagementInfoCard={ClubManagementInfoCard}
      ClubManagementToolbar={ClubManagementToolbar}
    />
  )
}

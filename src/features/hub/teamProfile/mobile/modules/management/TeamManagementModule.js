// teamProfile/mobile/modules/management/TeamManagementModule.js

import React from 'react'

import SectionPanelMobile from '../../../../sharedProfile/mobile/SectionPanelMobile.js'

import { profileSx as sx } from './../../sx/profile.sx'

import { TeamManagementModuleBase } from '../../../sharedModules/management'

export default function TeamManagementModule(props) {
  return (
    <TeamManagementModuleBase
      {...props}
      Section={SectionPanelMobile}
      isMobile
      saveSource="TeamManagementModuleMobile"
      toolbarWrapSx={sx.moduleRoot}
      emptyWrapSx={sx.moduleRoot}
    />
  )
}

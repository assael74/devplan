// teamProfile/desktop/modules/management/TeamManagementModule.js

import React from 'react'

import SectionPanel from '../../../../sharedProfile/desktop/SectionPanel.js'

import {
  TeamManagementModuleBase,
  teamManagementModuleSx,
} from '../../../sharedModules/management'

export default function TeamManagementModule(props) {
  return (
    <TeamManagementModuleBase
      {...props}
      Section={SectionPanel}
      isMobile={false}
      saveSource="TeamManagementModule"
      toolbarWrapSx={teamManagementModuleSx.desktopToolbarWrap}
      staffWrapSx={teamManagementModuleSx.desktopStaffWrap}
      wrapStaff
    />
  )
}

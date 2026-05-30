// teamProfile/sharedModules/management/TeamManagementModuleBase.js

import React from 'react'
import { Box } from '@mui/joy'

import EmptyState from '../../../sharedProfile/EmptyState.js'
import ManagementStaffCard from '../../../../../ui/domains/staff/ManagementStaffCard.js'

import {
  ManagementInfo,
  ManagementTabs,
  ManagementTargets,
  ManagementTargetsPrintButton,
  ManagementToolbar,
} from '../../sharedUi/management/index.js'

import useTeamManagementModuleModel from './useTeamManagementModuleModel.js'
import { teamManagementModuleSx } from './teamManagementModule.sx.js'

export default function TeamManagementModuleBase({
  entity,
  context,
  onSaved,
  onClose,

  Section,
  isMobile = false,
  saveSource = 'TeamManagementModule',

  toolbarWrapSx,
  emptyWrapSx,
  staffWrapSx,
  wrapStaff = false,
}) {
  const model = useTeamManagementModuleModel({
    entity,
    context,
    onSaved,
    onClose,
    saveSource,
  })

  const {
    team,
    activeTab,
    staffPool,
    baseModel,
    draft,
    clubName,
    isDirty,
    canSave,
    pending,

    setActiveTab,
    setDraft,

    handleReset,
    handleSave,
  } = model

  const Wrap = Section
  const finalToolbarWrapSx =
    toolbarWrapSx || teamManagementModuleSx.desktopToolbarWrap

  if (!team) {
    return (
      <Wrap>
        {emptyWrapSx ? (
          <Box sx={emptyWrapSx}>
            <EmptyState title="אין מידע לקבוצה" />
          </Box>
        ) : (
          <EmptyState title="אין מידע לקבוצה" />
        )}
      </Wrap>
    )
  }

  const staffCard = (
    <ManagementStaffCard
      isMobile={isMobile}
      teamId={baseModel.id}
      roles={staffPool}
      disabled={pending}
      compact={isMobile}
    />
  )

  return (
    <Wrap>
      <ManagementTabs
        isMobile={isMobile}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <Box sx={finalToolbarWrapSx}>
        <ManagementToolbar
          isMobile={isMobile}
          activeTab={activeTab}
          isDirty={isDirty}
          canSave={canSave}
          pending={pending}
          onReset={handleReset}
          onSave={handleSave}
          extraActions={
            activeTab.id === 'targets' ? (
              <ManagementTargetsPrintButton
                team={team}
                draft={draft}
                disabled={pending}
                iconOnly={isMobile}
              />
            ) : null
          }
        />
      </Box>

      {activeTab.id === 'info' && (
        <ManagementInfo
          draft={draft}
          isMobile={isMobile}
          clubName={clubName}
          onDraft={setDraft}
          pending={pending}
        />
      )}

      {activeTab.id === 'targets' && (
        <ManagementTargets
          team={team}
          draft={draft}
          isMobile={isMobile}
          onDraft={setDraft}
          pending={pending}
          showPrint={false}
        />
      )}

      {activeTab.id === 'staff' && (
        wrapStaff ? (
          <Box sx={staffWrapSx || teamManagementModuleSx.desktopStaffWrap}>
            {staffCard}
          </Box>
        ) : staffCard
      )}
    </Wrap>
  )
}

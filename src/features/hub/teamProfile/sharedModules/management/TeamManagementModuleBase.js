// teamProfile/sharedModules/management/TeamManagementModuleBase.js

import React from 'react'
import { Box } from '@mui/joy'

import EmptyState from '../../../sharedProfile/EmptyState.js'
import RolesCard from '../../../../../ui/domains/roles/RolesCard.js'

import {
  ManagementInfo,
  ManagementTabs,
  ManagementTargets,
  ManagementToolbar,
} from '../../sharedUi/management/index.js'
import {
  TeamTargetsReportButton,
} from '../../../../reports/publicApi.js'

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
  rolesWrapSx,
  wrapRoles = false,
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
    isEditingInfo,
    saveAttempted,
    rolesPool,
    baseModel,
    draft,
    clubName,
    isDirty,
    canSave,
    pending,

    setActiveTab,
    setIsEditingInfo,
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
            <EmptyState title='אין מידע לקבוצה' />
          </Box>
        ) : (
          <EmptyState title='אין מידע לקבוצה' />
        )}
      </Wrap>
    )
  }

  const rolesCard = (
    <RolesCard
      isMobile={isMobile}
      teamId={baseModel.id}
      roles={rolesPool}
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
          isEditing={activeTab.id !== 'info' || isEditingInfo}
          onEdit={() => setIsEditingInfo(true)}
          onReset={handleReset}
          onSave={handleSave}
          extraActions={
            activeTab.id === 'targets' ? (
              <TeamTargetsReportButton
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
          readOnly={!isEditingInfo}
          saveAttempted={saveAttempted}
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

      {activeTab.id === 'roles' && (
        wrapRoles ? (
          <Box sx={rolesWrapSx || teamManagementModuleSx.desktopRolesWrap}>
            {rolesCard}
          </Box>
        ) : rolesCard
      )}
    </Wrap>
  )
}

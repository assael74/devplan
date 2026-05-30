// clubProfile/sharedModules/management/ClubManagementModuleBase.js

import React from 'react'
import { Box } from '@mui/joy'

import EmptyState from '../../../sharedProfile/EmptyState.js'
import ManagementStaffCard from '../../../../../ui/domains/staff/ManagementStaffCard.js'

import useClubManagementModuleModel from './useClubManagementModuleModel.js'

export default function ClubManagementModuleBase({
  entity,
  context,
  onSaved,
  onClose,

  Section,
  isMobile = false,
  rootSx,
  emptyWrapSx,
  staffWrapSx,

  createIfMissing = false,

  ClubManagementInfoCard,
  ClubManagementToolbar,
}) {
  const {
    club,
    staffPool,
    baseModel,
    draft,
    isDirty,
    canSave,
    pending,

    setDraft,
    handleReset,
    handleSave,
  } = useClubManagementModuleModel({
    entity,
    context,
    onSaved,
    onClose,
    createIfMissing,
  })

  const Wrap = Section

  if (!club) {
    return (
      <Wrap>
        {emptyWrapSx ? (
          <Box sx={emptyWrapSx}>
            <EmptyState title="אין מידע למועדון" />
          </Box>
        ) : (
          <EmptyState title="אין מידע למועדון" />
        )}
      </Wrap>
    )
  }

  return (
    <Wrap>
      {ClubManagementToolbar ? (
        <Box sx={rootSx}>
          <ClubManagementToolbar
            isDirty={isDirty}
            canSave={canSave}
            pending={pending}
            onSave={handleSave}
            onReset={handleReset}
          />
        </Box>
      ) : null}

      <Box sx={rootSx}>
        <Box sx={isMobile ? null : { display: 'grid', gridTemplateColumns: '1fr .8fr', gap: 1.5 }}>
          <ClubManagementInfoCard
            draft={draft}
            isDirty={isDirty}
            canSave={canSave}
            onDraft={setDraft}
            onConfirm={handleSave}
            onReset={handleReset}
            pending={pending}
          />

          <Box sx={staffWrapSx || { minWidth: 0, alignSelf: 'start', height: 'auto' }}>
            <ManagementStaffCard
              clubId={baseModel.id}
              roles={staffPool}
              disabled={pending}
              compact={isMobile}
            />
          </Box>
        </Box>
      </Box>
    </Wrap>
  )
}

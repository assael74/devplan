// clubProfile/sharedModules/management/ClubManagementModuleBase.js

import React, { useCallback, useEffect, useState } from 'react'
import { Box, Typography } from '@mui/joy'

import EmptyState from '../../../sharedProfile/EmptyState.js'
import RolesCard from '../../../../../ui/domains/roles/RolesCard.js'

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
  rolesWrapSx,

  createIfMissing = false,

  ClubManagementInfoCard,
  ClubManagementToolbar,
}) {
  const {
    club,
    rolesPool,
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
  const [isEditing, setIsEditing] = useState(isMobile)

  useEffect(() => {
    setIsEditing(isMobile)
  }, [baseModel?.id, isMobile])

  const handleEdit = useCallback(() => {
    if (pending) return
    setIsEditing(true)
  }, [pending])

  const handleCancel = useCallback(() => {
    if (pending) return
    handleReset()
    setIsEditing(false)
  }, [handleReset, pending])

  const handleSaveAndCloseEdit = useCallback(async () => {
    if (!canSave) return
    await handleSave()
    setIsEditing(false)
  }, [canSave, handleSave])

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
            isEditing={isEditing}
            onEdit={handleEdit}
            onSave={handleSaveAndCloseEdit}
            onReset={handleCancel}
          />
        </Box>
      ) : null}

      <Box sx={rootSx}>
        <Box sx={isMobile ? null : { display: 'grid', gridTemplateColumns: 'minmax(280px, .8fr) minmax(420px, 1.2fr)', gap: 1.5, alignItems: 'start' }}>
          <Box sx={{ display: 'grid', gap: 0.75, minWidth: 0 }}>
            <Box sx={{ minWidth: 0 }}>
              <Typography level="title-sm" sx={{ fontWeight: 700 }}>
                מידע המועדון
              </Typography>
              <Typography level="body-xs" sx={{ color: 'text.tertiary', mt: 0.15 }}>
                שם, קישור התאחדות וסטטוס פעילות
              </Typography>
            </Box>

            <ClubManagementInfoCard
              draft={draft}
              isDirty={isDirty}
              canSave={canSave}
              readOnly={!isEditing}
              onDraft={setDraft}
              onConfirm={handleSaveAndCloseEdit}
              onReset={handleCancel}
              pending={pending}
            />
          </Box>

          <Box sx={rolesWrapSx || { minWidth: 0, alignSelf: 'start', height: 'auto', display: 'grid', gap: 0.75 }}>
            <Box sx={{ minWidth: 0 }}>
              <Typography level="title-sm" sx={{ fontWeight: 700 }}>
                צוות המועדון
              </Typography>
              <Typography level="body-xs" sx={{ color: 'text.tertiary', mt: 0.15 }}>
                סיכום, אנשי צוות ושיוך אנשי צוות למועדון
              </Typography>
            </Box>

            <RolesCard
              clubId={baseModel.id}
              roles={rolesPool}
              disabled={pending}
              compact={isMobile}
              slotProps={{
                rootSx: !isMobile ? { minHeight: 360 } : undefined,
              }}
            />
          </Box>
        </Box>
      </Box>
    </Wrap>
  )
}

// clubProfile/mobile/modules/management/ClubManagementModule.js

import React, { useMemo, useState, useEffect, useCallback } from 'react'
import { Box } from '@mui/joy'

import SectionPanelMobile from '../../../../sharedProfile/mobile/SectionPanelMobile.js'
import EmptyState from '../../../../sharedProfile/EmptyState.js'

import { profileSx as sx } from './../../sx/profile.sx'

import {
  buildClubManagementModel,
  buildClubManagementPatch,
  isClubManagementDirty,
} from '../../../sharedLogic/management/index.js'

import ClubManagementInfoCard from './components/ClubManagementInfoCard.js'
import ClubManagementToolbar from './components/ClubManagementToolbar.js'
import ManagementStaffCard from '../../../../../../ui/domains/staff/ManagementStaffCard.js'

import { useUpdateAction } from '../../../../../../ui/domains/entityActions/updateAction.js'

const toStr = (v) => (v == null ? '' : String(v))
const buildClubName = (club) => toStr(club?.clubName || club?.name).trim() || 'מועדון'

export default function ClubManagementModule({ entity, context, onSaved, onClose }) {
  const club = entity || null

  const staffPool = useMemo(() => {
    return Array.isArray(context?.roles) ? context.roles : []
  }, [context?.roles])

  const baseModel = useMemo(() => buildClubManagementModel(club), [club])
  const [draft, setDraft] = useState(baseModel)

  useEffect(() => {
    setDraft(baseModel)
  }, [baseModel])

  const entityName = useMemo(() => buildClubName(club), [club])

  const { runUpdate, pending } = useUpdateAction({
    routerEntityType: 'clubs',
    snackEntityType: 'club',
    id: club?.id,
    entityName,
    requireAnyUpdated: true,
    createIfMissing: false,
  })

  const patch = useMemo(() => {
    return buildClubManagementPatch(baseModel, draft)
  }, [baseModel, draft])

  const isDirty = isClubManagementDirty(baseModel, draft)
  const hasPatch = Object.keys(patch).length > 0
  const canSave = Boolean(club?.id) && isDirty && hasPatch && !pending

  const handleReset = useCallback(() => {
    setDraft(baseModel)
  }, [baseModel])

  const handleSave = useCallback(async () => {
    if (!canSave) return

    await runUpdate(patch, {
      section: 'management',
      source: 'ClubManagementModule',
      clubId: club.id,
    })

    onSaved(patch, { ...(club || {}), ...patch })
    onClose()
  }, [canSave, runUpdate, patch, club, onSaved, onClose])

  if (!club) {
    return (
      <SectionPanelMobile>
        <Box sx={sx.moduleRoot}>
          <EmptyState title="אין מידע למועדון" />
        </Box>
      </SectionPanelMobile>
    )
  }

  return (
    <SectionPanelMobile>
      <Box sx={sx.moduleRoot}>
        <ClubManagementToolbar
          isDirty={isDirty}
          canSave={canSave}
          pending={pending}
          onSave={handleSave}
          onReset={handleReset}
        />
      </Box>

      <ClubManagementInfoCard
        draft={draft}
        isDirty={isDirty}
        canSave={canSave}
        onDraft={setDraft}
        onConfirm={handleSave}
        onReset={handleReset}
        pending={pending}
      />


      <Box sx={{ minWidth: 0, alignSelf: 'start' }}>
        <ManagementStaffCard
          clubId={club.id}
          roles={staffPool}
          disabled={pending}
          compact
        />
      </Box>
    </SectionPanelMobile>
  )
}

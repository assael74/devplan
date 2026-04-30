// clubProfile/mobile/modules/management/ClubManagementModule.js

import React, { useMemo, useState, useEffect, useCallback } from 'react'
import { Box } from '@mui/joy'

import SectionPanelMobile from '../../../../sharedProfile/mobile/SectionPanelMobile.js'
import EmptyState from '../../../../sharedProfile/EmptyState.js'

import { profileSx as sx } from './../../sx/profile.sx'

import {
  buildClubEditInitial,
  buildClubEditPatch,
  isClubEditDirty,
} from '../../../../editLogic/clubs/index.js'

import ClubManagementInfoCard from './components/ClubManagementInfoCard.js'
import ClubManagementToolbar from './components/ClubManagementToolbar.js'
import ManagementStaffCard from '../../../../../../ui/domains/staff/ManagementStaffCard.js'

import { useUpdateAction } from '../../../../../../ui/domains/entityActions/updateAction.js'

const noop = () => {}

const toStr = (v) => (v == null ? '' : String(v))
const buildClubName = (club) => toStr(club?.clubName || club?.name).trim() || 'מועדון'

export default function ClubManagementModule({
  entity,
  context,
  onSaved = noop,
  onClose = noop,
}) {
  const club = entity || null

  const staffPool = useMemo(() => {
    return Array.isArray(context?.roles) ? context.roles : []
  }, [context?.roles])

  const baseModel = useMemo(() => buildClubEditInitial(club), [club])
  const [draft, setDraft] = useState(baseModel)

  useEffect(() => {
    setDraft(baseModel)
  }, [baseModel])

  const entityName = useMemo(() => buildClubName(club), [club])

  const { runUpdate, pending } = useUpdateAction({
    routerEntityType: 'clubs',
    snackEntityType: 'club',
    clubId: baseModel.id,
    entityName,
    requireAnyUpdated: true,
    createIfMissing: true,
  })

  const patch = useMemo(() => {
    return buildClubEditPatch(draft, baseModel)
  }, [draft, baseModel])

  const isDirty = useMemo(() => {
    return isClubEditDirty(draft, baseModel)
  }, [draft, baseModel])

  const hasPatch = Object.keys(patch).length > 0
  const canSave = Boolean(baseModel?.id) && isDirty && hasPatch && !pending

  const handleReset = useCallback(() => {
    setDraft(baseModel)
  }, [baseModel])

  const handleSave = useCallback(async () => {
    if (!canSave) return

    await runUpdate(patch, {
      section: 'management',
      source: 'ClubManagementModule',
      clubId: baseModel.id,
    })

    onSaved(patch, { ...(club || {}), ...patch })
    onClose()
  }, [canSave, runUpdate, patch, baseModel.id, club, onSaved, onClose])

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

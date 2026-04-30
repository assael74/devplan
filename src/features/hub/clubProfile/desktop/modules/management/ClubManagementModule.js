import React, { useMemo, useState, useEffect, useCallback } from 'react'
import { Box } from '@mui/joy'

import SectionPanel from '../../../../sharedProfile/desktop/SectionPanel.js'
import EmptyState from '../../../../sharedProfile/EmptyState.js'

import {
  buildClubEditInitial,
  buildClubEditPatch,
  isClubEditDirty,
} from '../../../../editLogic/clubs/index.js'

import { moduleSx as sx } from './sx/module.sx'

import ClubManagementInfoCard from './components/ClubManagementInfoCard.js'
import ManagementStaffCard from '../../../../../../ui/domains/staff/ManagementStaffCard.js'

import { useUpdateAction } from '../../../../../../ui/domains/entityActions/updateAction.js'

const toStr = (v) => (v == null ? '' : String(v))
const buildClubName = (club) => toStr(club?.clubName || club?.name).trim() || 'מועדון'

export default function ClubManagementModule({ entity, context }) {
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
    id: baseModel?.id,
    entityName,
    requireAnyUpdated: true,
    createIfMissing: false,
  })

  const patch = useMemo(() => {
    return buildClubEditPatch(draft, baseModel)
  }, [draft, baseModel])

  const isDirty = useMemo(() => {
    return isClubEditDirty(draft, baseModel)
  }, [draft, baseModel])

  const hasPatch = Object.keys(patch).length > 0
  const canSave = Boolean(baseModel?.id) && isDirty && hasPatch && !pending

  const confirm = useCallback(async () => {
    if (!canSave) return

    await runUpdate(patch, {
      section: 'management',
      source: 'ClubManagementModule',
      clubId: baseModel.id,
    })
  }, [canSave, runUpdate, patch, baseModel.id])

  const reset = useCallback(() => {
    if (pending) return
    setDraft(baseModel)
  }, [baseModel, pending])

  if (!club) return <EmptyState title="אין מידע למועדון" />

  return (
    <SectionPanel>
      <Box sx={sx.root}>
        <Box sx={sx.topGrid}>
          <ClubManagementInfoCard
            draft={draft}
            isDirty={isDirty}
            canSave={canSave}
            onDraft={setDraft}
            onConfirm={confirm}
            onReset={reset}
            pending={pending}
          />

          <Box sx={{ minWidth: 0, alignSelf: 'start', height: 'auto' }}>
            <ManagementStaffCard
              clubId={baseModel.id}
              roles={staffPool}
              disabled={pending}
              compact={false}
            />
          </Box>
        </Box>
      </Box>
    </SectionPanel>
  )
}

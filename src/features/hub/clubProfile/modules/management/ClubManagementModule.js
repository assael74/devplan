import React, { useMemo, useState, useEffect, useCallback } from 'react'
import { Box, Typography } from '@mui/joy'

import SectionPanel from '../../../sharedProfile/SectionPanel.js'
import EmptyState from '../../../sharedProfile/EmptyState.js'

import { clubManagementModuleSx as sx } from './sx/clubManagement.module.sx.js'
import { buildClubManagementModel, buildClubManagementPatch } from './logic/clubManagement.logic.js'
import { isClubManagementDirty } from './logic/clubManagement.dirty.js'

import ClubManagementInfoCard from './components/ClubManagementInfoCard.js'
import ManagementStaffCard from '../../../../../ui/domains/staff/ManagementStaffCard.js'

import { useUpdateAction } from '../../../../../ui/domains/entityActions/updateAction.js'

const toStr = (v) => (v == null ? '' : String(v))
const buildClubName = (t) => toStr(t?.clubName).trim() || 'מועדון'

export default function ClubManagementModule({ entity, context }) {
  const club = entity || null

  const staffPool = useMemo(() => {
    return Array.isArray(context?.roles) ? context.roles : []
  }, [context])

  const baseModel = useMemo(() => buildClubManagementModel(club), [club])
  const [draft, setDraft] = useState(baseModel)
  useEffect(() => setDraft(baseModel), [baseModel])

  const entityName = useMemo(() => buildClubName(club), [club])

  const { runUpdate, pending } = useUpdateAction({
    routerEntityType: 'clubs',
    snackEntityType: 'club',
    id: club?.id,
    entityName,
    requireAnyUpdated: true,
    createIfMissing: false,
  })

  const onUpdate = useCallback(
    async (patch, meta) => runUpdate(patch, meta),
    [runUpdate]
  )

  const isDirty = useMemo(() => isClubManagementDirty(baseModel, draft), [baseModel, draft])

  const confirm = async () => {
    const patch = buildClubManagementPatch(baseModel, draft)
    if (!Object.keys(patch).length) return
    await onUpdate(patch, { section: 'management', source: 'ClubManagementModule' })
  }

  const reset = () => setDraft(baseModel)

  if (!club) return <EmptyState title="אין מידע למועדון" />

  return (
    <SectionPanel>
      <Box sx={sx.root}>
        <Box sx={sx.topGrid}>
          <ClubManagementInfoCard
            sx={{
              cardSx: sx.card,
              cardHeader: sx.cardHeader,
              actions: sx.actions,
              firstRow: sx.firstRow,
              chipsRow: sx.chipsRow,
              yearWrap: sx.yearWrap,
              secondRow: sx.secondRow,
            }}
            draft={draft}
            isDirty={isDirty}
            onDraft={setDraft}
            onConfirm={confirm}
            onReset={reset}
            pending={pending}
          />

          <Box sx={{ minWidth: 0, alignSelf: 'start', height: 'auto', }}>
            <ManagementStaffCard
              clubId={club.id}
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

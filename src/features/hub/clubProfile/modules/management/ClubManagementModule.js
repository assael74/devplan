// clubProfile/modules/management/ClubManagementModule.js
import React, { useMemo, useState, useEffect, useCallback } from 'react'
import { Box, Typography } from '@mui/joy'

import SectionPanel from '../../../sharedProfile/SectionPanel.js'
import EmptyState from '../../../sharedProfile/EmptyState.js'

import { clubManagementModuleSx as sx } from './clubManagement.module.sx.js'
import { buildClubManagementModel, buildClubManagementPatch } from './clubManagement.logic.js'
import { isClubManagementDirty } from './clubManagement.dirty.js'

import ClubManagementInfoCard from './components/ClubManagementInfoCard.js'
import ManagementStaffCard from '../../../../../ui/domains/staff/ManagementStaffCard.js'

import { useUpdateAction } from '../../../../../ui/domains/entityActions/updateAction.js'

const toStr = (v) => (v == null ? '' : String(v))
const buildClubName = (c) => toStr(c?.clubName || c?.name).trim() || 'מועדון'

export default function ClubManagementModule({ entity, context }) {
  const club = entity || null

  const baseModel = useMemo(() => buildClubManagementModel(club), [club])
  const [draft, setDraft] = useState(baseModel)

  const staffPool = useMemo(() => {
    return Array.isArray(context?.rolesList) ? context.rolesList : []
  }, [context])

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

  const staffRows = useMemo(() => {
    const roles = Array.isArray(club?.roles) ? club.roles : []
    return roles.map((r, idx) => ({
      id: String(r?.id || idx),
      fullName: r.fullName || '—',
      phone: r.phone || '',
      email: r.email || '',
      photo: r.photo || '',
      type: r.type || '',
      teamsId: r.teamsId || [],
      clubsId: r.clubsId || [],
    }))
  }, [club])

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

          <ManagementStaffCard
            clubId={club.id}
            roles={staffPool}
            disabled={pending}
            compact
          />
        </Box>
      </Box>
    </SectionPanel>
  )
}

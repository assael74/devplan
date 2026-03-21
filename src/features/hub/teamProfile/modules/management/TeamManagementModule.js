import React, { useMemo, useState, useEffect, useCallback } from 'react'
import { Box, Typography } from '@mui/joy'

import SectionPanel from '../../../sharedProfile/SectionPanel.js'
import EmptyState from '../../../sharedProfile/EmptyState.js'

import { teamManagementModuleSx as sx } from './teamManagement.module.sx.js'
import { buildTeamManagementModel, buildTeamManagementPatch } from './teamManagement.logic.js'
import { isTeamManagementDirty } from './teamManagement.dirty.js'

import TeamManagementInfoCard from './components/TeamManagementInfoCard.js'
import ManagementStaffCard from '../../../../../ui/domains/staff/ManagementStaffCard.js'

import { useUpdateAction } from '../../../../../ui/domains/entityActions/updateAction.js'

const toStr = (v) => (v == null ? '' : String(v))
const buildTeamName = (t) => toStr(t?.teamName).trim() || 'קבוצה'

export default function TeamManagementModule({ entity, context }) {
  const team = entity || null

  const staffPool = useMemo(() => {
    return Array.isArray(context?.roles) ? context.roles : []
  }, [context])

  const baseModel = useMemo(() => buildTeamManagementModel(team), [team])
  const [draft, setDraft] = useState(baseModel)
  useEffect(() => setDraft(baseModel), [baseModel])

  const entityName = useMemo(() => buildTeamName(team), [team])

  const { runUpdate, pending } = useUpdateAction({
    routerEntityType: 'teams',
    snackEntityType: 'team',
    id: team?.id,
    entityName,
    requireAnyUpdated: true,
    createIfMissing: false,
  })

  const onUpdate = useCallback(
    async (patch, meta) => runUpdate(patch, meta),
    [runUpdate]
  )

  const clubName = useMemo(() => {
    const c = context?.club || team?.club || null
    return String(c?.clubName || c?.name || team?.clubName || '')
  }, [context, team])

  const isDirty = useMemo(() => isTeamManagementDirty(baseModel, draft), [baseModel, draft])

  const confirm = async () => {
    const patch = buildTeamManagementPatch(baseModel, draft)
    if (!Object.keys(patch).length) return
    await onUpdate(patch, { section: 'management', source: 'TeamManagementModule' })
  }

  const reset = () => setDraft(baseModel)

  if (!team) return <EmptyState title="אין מידע לקבוצה" />

  return (
    <SectionPanel>
      <Box sx={sx.root}>
        <Box sx={sx.topGrid}>
          <TeamManagementInfoCard
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
            clubName={clubName}
            isDirty={isDirty}
            onDraft={setDraft}
            onConfirm={confirm}
            onReset={reset}
            pending={pending}
          />

          <ManagementStaffCard
            teamId={team.id}
            roles={staffPool}
            disabled={pending}
            compact={false}
          />
        </Box>
      </Box>
    </SectionPanel>
  )
}

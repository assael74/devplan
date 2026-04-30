// teamProfile/mobile/modules/management/TeamManagementModule.js

import React, { useMemo, useState, useEffect, useCallback } from 'react'
import { Box } from '@mui/joy'

import SectionPanelMobile from '../../../../sharedProfile/mobile/SectionPanelMobile.js'
import EmptyState from '../../../../sharedProfile/EmptyState.js'

import { moduleSx as localSx } from './module.sx.js'
import { profileSx as sx } from './../../sx/profile.sx'

import {
  buildTeamEditInitial,
  buildTeamEditPatch,
  isTeamEditDirty,
} from '../../../../editLogic/teams/index.js'

import TeamManagementInfoCard from './components/TeamManagementInfoCard.js'
import TeamManagementToolbar from './components/TeamManagementToolbar.js'
import ManagementStaffCard from '../../../../../../ui/domains/staff/ManagementStaffCard.js'

import { useTeamHubUpdate } from '../../../../hooks/teams/useTeamHubUpdate.js'

const noop = () => {}

export default function TeamManagementModule({
  entity,
  context,
  onSaved = noop,
  onClose = noop,
}) {
  const team = entity || null

  const staffPool = useMemo(() => {
    return Array.isArray(context?.roles) ? context.roles : []
  }, [context?.roles])

  const baseModel = useMemo(() => buildTeamEditInitial(team), [team])
  const [draft, setDraft] = useState(baseModel)

  useEffect(() => {
    setDraft(baseModel)
  }, [baseModel])

  const { run, pending } = useTeamHubUpdate(team)

  const clubName = String(
    context?.club?.clubName ||
      context?.club?.name ||
      team?.club?.clubName ||
      team?.clubName ||
      ''
  )

  const patch = useMemo(() => {
    return buildTeamEditPatch(draft, baseModel)
  }, [draft, baseModel])

  const isDirty = useMemo(() => {
    return isTeamEditDirty(draft, baseModel)
  }, [draft, baseModel])

  const hasPatch = Object.keys(patch).length > 0
  const canSave = Boolean(baseModel?.id) && isDirty && hasPatch && !pending

  const handleReset = useCallback(() => {
    if (pending) return
    setDraft(baseModel)
  }, [baseModel, pending])

  const handleSave = useCallback(async () => {
    if (!canSave) return

    await run('teamEdit', patch, {
      section: 'teamEdit',
      source: 'TeamManagementModule',
      teamId: baseModel.id,
      createIfMissing: true,
    })

    onSaved(patch, { ...(team || {}), ...patch })
    onClose()
  }, [canSave, run, patch, baseModel.id, team, onSaved, onClose])

  if (!team) {
    return (
      <SectionPanelMobile>
        <Box sx={sx.moduleRoot}>
          <EmptyState title="אין מידע לקבוצה" />
        </Box>
      </SectionPanelMobile>
    )
  }

  return (
    <SectionPanelMobile>
      <Box sx={sx.moduleRoot}>
        <TeamManagementToolbar
          isDirty={isDirty}
          canSave={canSave}
          pending={pending}
          onSave={handleSave}
          onReset={handleReset}
        />
      </Box>

      <Box sx={localSx.root}>
        <Box sx={localSx.topGrid}>
          <TeamManagementInfoCard
            draft={draft}
            clubName={clubName}
            isDirty={isDirty}
            canSave={canSave}
            onDraft={setDraft}
            onConfirm={handleSave}
            onReset={handleReset}
            pending={pending}
          />

          <Box sx={localSx.staffWrap}>
            <ManagementStaffCard
              teamId={baseModel.id}
              roles={staffPool}
              disabled={pending}
              compact
            />
          </Box>
        </Box>
      </Box>
    </SectionPanelMobile>
  )
}

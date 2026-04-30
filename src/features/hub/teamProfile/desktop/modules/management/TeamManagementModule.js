// teamProfile/desktop/modules/management/TeamManagementModule.js

import React, { useMemo, useState, useEffect, useCallback } from 'react'
import { Box } from '@mui/joy'

import SectionPanel from '../../../../sharedProfile/desktop/SectionPanel.js'
import EmptyState from '../../../../sharedProfile/EmptyState.js'

import { moduleSx as sx } from './module.sx.js'

import {
  buildTeamEditInitial,
  buildTeamEditPatch,
  isTeamEditDirty,
} from '../../../../editLogic/teams/index.js'

import TeamManagementToolbar from './components/TeamManagementToolbar.js'
import TeamManagementInfoCard from './components/TeamManagementInfoCard.js'
import TeamManagementTargetsCard from './components/TeamManagementTargetsCard.js'
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

  const clubName = useMemo(() => {
    const c = context?.club || team?.club || null
    return String(c?.clubName || c?.name || team?.clubName || '')
  }, [context?.club, team])

  const patch = useMemo(() => {
    return buildTeamEditPatch(draft, baseModel)
  }, [draft, baseModel])

  const isDirty = useMemo(() => {
    return isTeamEditDirty(draft, baseModel)
  }, [draft, baseModel])

  const canSave = useMemo(() => {
    return Boolean(baseModel?.id) && isDirty && Object.keys(patch).length > 0 && !pending
  }, [baseModel?.id, isDirty, patch, pending])

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

  if (!team) return <EmptyState title="אין מידע לקבוצה" />

  return (
    <SectionPanel>
      <Box sx={sx.stickyToolbar}>
        <TeamManagementToolbar
          isDirty={isDirty}
          canSave={canSave}
          pending={pending}
          onReset={handleReset}
          onSave={handleSave}
        />
      </Box>

      <Box sx={{ ...sx.topGrid, my: 1 }}>
        <Box sx={sx.targetsArea}>
          <TeamManagementTargetsCard
            team={team}
            draft={draft}
            onDraft={setDraft}
            pending={pending}
          />
        </Box>

        <Box sx={sx.infoArea}>
          <TeamManagementInfoCard
            draft={draft}
            clubName={clubName}
            onDraft={setDraft}
            pending={pending}
          />
        </Box>
      </Box>

      <Box sx={sx.staffArea}>
        <ManagementStaffCard
          teamId={baseModel.id}
          roles={staffPool}
          disabled={pending}
          compact={false}
        />
      </Box>
    </SectionPanel>
  )
}

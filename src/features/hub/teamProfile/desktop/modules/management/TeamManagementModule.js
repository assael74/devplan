// teamProfile/modules/management/TeamManagementModule.js

import React, { useMemo, useState, useEffect } from 'react'
import { Box } from '@mui/joy'

import SectionPanel from '../../../../sharedProfile/desktop/SectionPanel.js'
import EmptyState from '../../../../sharedProfile/EmptyState.js'

import { moduleSx as sx } from './module.sx.js'

import {
  buildTeamManagementModel,
  buildTeamManagementPatch,
  isTeamManagementDirty,
} from '../../../sharedLogic/management'

import TeamManagementToolbar from './components/TeamManagementToolbar.js'
import TeamManagementInfoCard from './components/TeamManagementInfoCard.js'
import TeamManagementTargetsCard from './components/TeamManagementTargetsCard.js'
import ManagementStaffCard from '../../../../../../ui/domains/staff/ManagementStaffCard.js'

import { useTeamHubUpdate } from '../../../../hooks/teams/useTeamHubUpdate.js'

export default function TeamManagementModule({ entity, context, onSaved, onClose }) {
  const team = entity || null

  const staffPool = useMemo(() => {
    return Array.isArray(context?.roles) ? context.roles : []
  }, [context])

  const baseModel = useMemo(() => buildTeamManagementModel(team), [team])
  const [draft, setDraft] = useState(baseModel)

  useEffect(() => {
    setDraft(baseModel)
  }, [baseModel])

  const { run, pending } = useTeamHubUpdate(team)

  const clubName = useMemo(() => {
    const c = context?.club || team?.club || null
    return String(c?.clubName || c?.name || team?.clubName || '')
  }, [context, team])

  const isDirty = useMemo(() => {
    return isTeamManagementDirty(baseModel, draft)
  }, [baseModel, draft])

  const patch = useMemo(() => {
    return buildTeamManagementPatch(baseModel, draft)
  }, [baseModel, draft])

  const canSave = useMemo(() => {
    return Boolean(team?.id) && isDirty && Object.keys(patch).length > 0 && !pending
  }, [team?.id, isDirty, patch, pending])

  const handleReset = () => {
    setDraft(baseModel)
  }

  const handleSave = async () => {
    if (!canSave) return

    await run('teamEdit', patch, {
      section: 'teamEdit',
      source: 'TeamManagementModule',
      teamId: team.id,
      createIfMissing: false,
    })

    if (typeof onSaved === 'function') {
      onSaved(patch, { ...(team || {}), ...patch })
    }

    if (typeof onClose === 'function') {
      onClose()
    }
  }

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

      <Box sx={{...sx.topGrid, my: 1 }}>
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
          teamId={team.id}
          roles={staffPool}
          disabled={pending}
          compact={false}
        />
      </Box>
    </SectionPanel>
  )
}

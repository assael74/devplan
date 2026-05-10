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

import ManagementToolbar from './components/ManagementToolbar.js'
import ManagementTabs from './components/ManagementTabs.js'
import ManagementInfo from './components/ManagementInfo.js'
import ManagementTargets from './components/ManagementTargets.js'
import ManagementStaffCard from '../../../../../../ui/domains/staff/ManagementStaffCard.js'

import { useTeamHubUpdate } from '../../../../hooks/teams/useTeamHubUpdate.js'
import { TABS } from './components/ManagementTabs.js'

const noop = () => {}

export default function TeamManagementModule({
  entity,
  context,
  onSaved = noop,
  onClose = noop,
}) {
  const team = entity || null

  const [activeTab, setActiveTab] = useState(TABS[0])

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
      <ManagementTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <Box sx={sx.stickyToolbar}>
        <ManagementToolbar
          activeTab={activeTab}
          isDirty={isDirty}
          canSave={canSave}
          pending={pending}
          onReset={handleReset}
          onSave={handleSave}
        />
      </Box>

      {activeTab.id === 'info' && (
        <ManagementInfo
          draft={draft}
          clubName={clubName}
          onDraft={setDraft}
          pending={pending}
        />
      )}

      {activeTab.id === 'targets' && (
        <ManagementTargets
          team={team}
          draft={draft}
          onDraft={setDraft}
          pending={pending}
        />
      )}

      {activeTab.id === 'staff' && (
        <Box sx={{ mt: 2 }}>
          <ManagementStaffCard
            teamId={baseModel.id}
            roles={staffPool}
            disabled={pending}
            compact={false}
          />
        </Box>
      )}
    </SectionPanel>
  )
}

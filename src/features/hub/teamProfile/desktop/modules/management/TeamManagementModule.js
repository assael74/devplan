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

import ManagementStaffCard from '../../../../../../ui/domains/staff/ManagementStaffCard.js'

import {
  ManagementInfo,
  ManagementTabs,
  ManagementTargets,
  ManagementTargetsPrintButton,
  ManagementToolbar,
  TABS,
} from '../../../sharedUi/management/index.js'

import { useTeamHubUpdate } from '../../../../hooks/teams/useTeamHubUpdate.js'

const noop = () => {}

export default function TeamManagementModule({
  entity,
  context,
  onSaved = noop,
  onClose = noop,
  isMobile = false,
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
    return (
      Boolean(baseModel?.id) &&
      isDirty &&
      Object.keys(patch).length > 0 &&
      !pending
    )
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
        isMobile={isMobile}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <Box sx={sx.stickyToolbar}>
        <ManagementToolbar
          isMobile={isMobile}
          activeTab={activeTab}
          isDirty={isDirty}
          canSave={canSave}
          pending={pending}
          onReset={handleReset}
          onSave={handleSave}
          extraActions={
            activeTab.id === 'targets' ? (
              <ManagementTargetsPrintButton
                team={team}
                draft={draft}
                disabled={pending}
                iconOnly={isMobile}
              />
            ) : null
          }
        />
      </Box>

      {activeTab.id === 'info' && (
        <ManagementInfo
          draft={draft}
          isMobile={isMobile}
          clubName={clubName}
          onDraft={setDraft}
          pending={pending}
        />
      )}

      {activeTab.id === 'targets' && (
        <ManagementTargets
          team={team}
          draft={draft}
          isMobile={isMobile}
          onDraft={setDraft}
          pending={pending}
          isMobile={isMobile}
          showPrint={false}
        />
      )}

      {activeTab.id === 'staff' && (
        <Box sx={{ mt: 2 }}>
          <ManagementStaffCard
            isMobile={isMobile}
            teamId={baseModel.id}
            roles={staffPool}
            disabled={pending}
            compact={isMobile}
          />
        </Box>
      )}
    </SectionPanel>
  )
}

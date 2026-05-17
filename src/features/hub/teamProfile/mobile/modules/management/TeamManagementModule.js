// teamProfile/mobile/modules/management/TeamManagementModule.js

import React, { useMemo, useState, useEffect, useCallback } from 'react'
import { Box } from '@mui/joy'

import SectionPanelMobile from '../../../../sharedProfile/mobile/SectionPanelMobile.js'
import EmptyState from '../../../../sharedProfile/EmptyState.js'

import { profileSx as sx } from './../../sx/profile.sx'

import {
  buildTeamEditInitial,
  buildTeamEditPatch,
  isTeamEditDirty,
} from '../../../../editLogic/teams/index.js'

import {
  ManagementInfo,
  ManagementTabs,
  ManagementTargets,
  ManagementTargetsPrintButton,
  ManagementToolbar,
  TABS,
} from '../../../sharedUi/management/index.js'

import ManagementStaffCard from '../../../../../../ui/domains/staff/ManagementStaffCard.js'

import { useTeamHubUpdate } from '../../../../hooks/teams/useTeamHubUpdate.js'

const noop = () => {}

export default function TeamManagementModule({
  entity,
  context,
  onSaved = noop,
  onClose = noop,
  isMobile = true,
}) {
  const team = entity || null

  const [activeTab, setActiveTab] = useState(TABS[0])

  const staffPool = useMemo(() => {
    return Array.isArray(context?.roles) ? context.roles : []
  }, [context?.roles])

  const baseModel = useMemo(() => {
    return buildTeamEditInitial(team)
  }, [team])

  const [draft, setDraft] = useState(baseModel)

  useEffect(() => {
    setDraft(baseModel)
  }, [baseModel])

  const { run, pending } = useTeamHubUpdate(team)

  const clubName = useMemo(() => {
    return String(
      context?.club?.clubName ||
        context?.club?.name ||
        team?.club?.clubName ||
        team?.clubName ||
        ''
    )
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
      source: 'TeamManagementModuleMobile',
      teamId: baseModel.id,
      createIfMissing: true,
    })

    onSaved(patch, {
      ...(team || {}),
      ...patch,
    })

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
      <ManagementTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isMobile={isMobile}
      />

      <Box sx={sx.moduleRoot}>
        <ManagementToolbar
          activeTab={activeTab}
          isDirty={isDirty}
          canSave={canSave}
          pending={pending}
          onReset={handleReset}
          onSave={handleSave}
          isMobile={isMobile}
          extraActions={
            activeTab.id === 'targets' ? (
              <ManagementTargetsPrintButton
                team={team}
                draft={draft}
                disabled={pending}
                iconOnly
              />
            ) : null
          }
        />
      </Box>

      {activeTab.id === 'info' && (
        <ManagementInfo
          draft={draft}
          clubName={clubName}
          onDraft={setDraft}
          pending={pending}
          isMobile={isMobile}
        />
      )}

      {activeTab.id === 'targets' && (
        <ManagementTargets
          team={team}
          draft={draft}
          onDraft={setDraft}
          pending={pending}
          isMobile={isMobile}
          showPrint={false}
        />
      )}

      {activeTab.id === 'staff' && (
        <ManagementStaffCard
          teamId={baseModel.id}
          roles={staffPool}
          disabled={pending}
          isMobile={isMobile}
          compact
        />
      )}
    </SectionPanelMobile>
  )
}

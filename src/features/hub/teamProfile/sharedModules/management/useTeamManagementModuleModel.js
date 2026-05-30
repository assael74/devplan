// teamProfile/sharedModules/management/useTeamManagementModuleModel.js

import { useCallback, useEffect, useMemo, useState } from 'react'

import {
  buildTeamEditInitial,
  buildTeamEditPatch,
  isTeamEditDirty,
} from '../../../editLogic/teams/index.js'

import { useTeamHubUpdate } from '../../../hooks/teams/useTeamHubUpdate.js'

import { TABS } from '../../sharedUi/management/index.js'

const noop = () => {}

export default function useTeamManagementModuleModel({
  entity,
  context,
  onSaved = noop,
  onClose = noop,
  saveSource = 'TeamManagementModule',
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
    const club = context?.club || team?.club || null

    return String(
      club?.clubName ||
        club?.name ||
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
      source: saveSource,
      teamId: baseModel.id,
      createIfMissing: true,
    })

    onSaved(patch, {
      ...(team || {}),
      ...patch,
    })

    onClose()
  }, [canSave, run, patch, saveSource, baseModel.id, team, onSaved, onClose])

  return {
    team,
    activeTab,
    staffPool,
    baseModel,
    draft,
    clubName,
    patch,
    isDirty,
    canSave,
    pending,

    setActiveTab,
    setDraft,

    handleReset,
    handleSave,
  }
}

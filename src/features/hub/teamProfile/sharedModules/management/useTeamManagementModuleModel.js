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
  const [isEditingInfo, setIsEditingInfo] = useState(false)
  const [saveAttempted, setSaveAttempted] = useState(false)

  const rolesPool = useMemo(() => {
    return Array.isArray(context?.roles) ? context.roles : []
  }, [context?.roles])

  const baseModel = useMemo(() => {
    return buildTeamEditInitial(team)
  }, [team])

  const [draft, setDraftState] = useState(baseModel)

  const setDraft = useCallback((nextDraft) => {
    setDraftState(nextDraft)
    setSaveAttempted(false)
  }, [])

  useEffect(() => {
    setDraftState(baseModel)
    setIsEditingInfo(false)
    setSaveAttempted(false)
  }, [baseModel])

  useEffect(() => {
    if (activeTab.id !== 'info') {
      setIsEditingInfo(false)
      setSaveAttempted(false)
    }
  }, [activeTab.id])

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

  const hasRequiredInfo = useMemo(() => {
    return Boolean(String(draft?.teamName || '').trim())
  }, [draft?.teamName])

  const canSave = useMemo(() => {
    return (
      Boolean(baseModel?.id) &&
      hasRequiredInfo &&
      isDirty &&
      Object.keys(patch).length > 0 &&
      !pending
    )
  }, [baseModel?.id, hasRequiredInfo, isDirty, patch, pending])

  const handleReset = useCallback(() => {
    if (pending) return
    setDraftState(baseModel)
    setIsEditingInfo(false)
    setSaveAttempted(false)
  }, [baseModel, pending])

  const handleSave = useCallback(async () => {
    setSaveAttempted(true)
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
    setIsEditingInfo(false)
    setSaveAttempted(false)
  }, [canSave, run, patch, saveSource, baseModel.id, team, onSaved, onClose])

  return {
    team,
    activeTab,
    isEditingInfo,
    saveAttempted,
    rolesPool,
    baseModel,
    draft,
    clubName,
    patch,
    isDirty,
    canSave,
    pending,

    setActiveTab,
    setIsEditingInfo,
    setDraft,

    handleReset,
    handleSave,
  }
}

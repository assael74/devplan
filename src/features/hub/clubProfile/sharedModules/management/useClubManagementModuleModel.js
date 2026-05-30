// clubProfile/sharedModules/management/useClubManagementModuleModel.js

import { useCallback, useEffect, useMemo, useState } from 'react'

import {
  buildClubEditInitial,
  buildClubEditPatch,
  isClubEditDirty,
} from '../../../editLogic/clubs/index.js'

import { useUpdateAction } from '../../../../../ui/domains/entityActions/updateAction.js'

const noop = () => {}

const toStr = value => {
  return value == null ? '' : String(value)
}

const buildClubName = club => {
  return toStr(club?.clubName || club?.name).trim() || 'מועדון'
}

export default function useClubManagementModuleModel({
  entity,
  context,
  onSaved = noop,
  onClose = noop,
  createIfMissing = false,
}) {
  const club = entity || null

  const staffPool = useMemo(() => {
    return Array.isArray(context?.roles) ? context.roles : []
  }, [context?.roles])

  const baseModel = useMemo(() => {
    return buildClubEditInitial(club)
  }, [club])

  const [draft, setDraft] = useState(baseModel)

  useEffect(() => {
    setDraft(baseModel)
  }, [baseModel])

  const entityName = useMemo(() => {
    return buildClubName(club)
  }, [club])

  const { runUpdate, pending } = useUpdateAction({
    routerEntityType: 'clubs',
    snackEntityType: 'club',
    id: baseModel?.id,
    clubId: baseModel?.id,
    entityName,
    requireAnyUpdated: true,
    createIfMissing,
  })

  const patch = useMemo(() => {
    return buildClubEditPatch(draft, baseModel)
  }, [draft, baseModel])

  const isDirty = useMemo(() => {
    return isClubEditDirty(draft, baseModel)
  }, [draft, baseModel])

  const hasPatch = Object.keys(patch).length > 0
  const canSave = Boolean(baseModel?.id) && isDirty && hasPatch && !pending

  const handleReset = useCallback(() => {
    if (pending) return
    setDraft(baseModel)
  }, [baseModel, pending])

  const handleSave = useCallback(async () => {
    if (!canSave) return

    await runUpdate(patch, {
      section: 'management',
      source: 'ClubManagementModule',
      clubId: baseModel.id,
    })

    onSaved(patch, { ...(club || {}), ...patch })
    onClose()
  }, [canSave, runUpdate, patch, baseModel.id, club, onSaved, onClose])

  return {
    club,
    staffPool,
    baseModel,
    draft,
    patch,
    isDirty,
    canSave,
    pending,

    setDraft,
    handleReset,
    handleSave,
  }
}

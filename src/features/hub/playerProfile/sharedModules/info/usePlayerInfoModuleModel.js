// playerProfile/sharedModules/info/usePlayerInfoModuleModel.js

import { useCallback, useEffect, useMemo, useState } from 'react'

import { usePlayerHubUpdate } from '../../../hooks/players/usePlayerHubUpdate.js'

import {
  buildPlayerEditInitial,
  buildPlayerEditPatch,
  buildPlayerName,
  isPlayerEditDirty,
} from '../../../editLogic/players/index.js'

export default function usePlayerInfoModuleModel({
  entity,
  source = 'PlayerInfoModule',
}) {
  const player = entity || null

  const initial = useMemo(() => {
    return buildPlayerEditInitial(player)
  }, [player])

  const [draft, setDraft] = useState(initial)

  useEffect(() => {
    setDraft(initial)
  }, [initial])

  const entityName = useMemo(() => {
    return buildPlayerName(player || {})
  }, [player])

  const { run, pending } = usePlayerHubUpdate(player)

  const patch = useMemo(() => {
    return buildPlayerEditPatch(draft, initial)
  }, [draft, initial])

  const isDirty = useMemo(() => {
    return isPlayerEditDirty(draft, initial)
  }, [draft, initial])

  const hasPatch = Object.keys(patch).length > 0
  const canSave = Boolean(initial?.id) && isDirty && hasPatch && !pending

  const handleReset = useCallback(() => {
    if (pending) return
    setDraft(initial)
  }, [initial, pending])

  const handleSave = useCallback(async () => {
    if (!canSave) return

    await run(patch, {
      section: 'info',
      source,
      playerId: initial.id,
      entityName,
      createIfMissing: true,
    })
  }, [canSave, run, patch, source, initial.id, entityName])

  return {
    player,
    initial,
    draft,
    patch,
    entityName,

    pending,
    isDirty,
    canSave,

    setDraft,
    handleReset,
    handleSave,
  }
}

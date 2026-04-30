// preview/previewDomainCard/domains/player/info/logic/usePlayerInfoDomainForm.js

import { useCallback, useEffect, useMemo, useState } from 'react'
import { usePlayerHubUpdate } from '../../../../../../../../hooks/players/usePlayerHubUpdate.js'

import {
  buildPlayerEditInitial,
  buildPlayerEditPatch,
  buildPlayerName,
  isPlayerEditDirty,
} from '../../../../../../../../editLogic/players/index.js'

import { isPlaceholderPhone } from './playerInfo.domain.logic.js'

const noop = () => {}

export function usePlayerInfoDomainForm({ entity, onClose = noop }) {
  const player = entity || {}

  const initial = useMemo(() => buildPlayerEditInitial(player), [player])
  const [form, setForm] = useState(initial)

  useEffect(() => {
    setForm(initial)
  }, [initial])

  const entityName = useMemo(() => buildPlayerName(player), [player])
  const { run, pending } = usePlayerHubUpdate(player)

  const dirty = useMemo(() => {
    return isPlayerEditDirty(form, initial)
  }, [form, initial])

  const phoneOk = !isPlaceholderPhone(form.phone)

  const setField = useCallback((key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }, [])

  const onReset = useCallback(() => {
    setForm(initial)
  }, [initial])

  const onCloseAndReset = useCallback(() => {
    onReset()
    onClose()
  }, [onClose, onReset])

  const onSave = useCallback(async () => {
    if (!dirty || pending) return

    const patch = buildPlayerEditPatch(form, initial)
    if (!Object.keys(patch).length) return

    await run(patch, {
      section: 'infoDomain',
      playerId: initial.id,
      entityName,
      createIfMissing: true,
    })

    onClose()
  }, [dirty, pending, form, initial, run, entityName, onClose])

  return {
    player,
    form,
    pending,
    dirty,
    phoneOk,
    setField,
    onSave,
    onReset,
    onCloseAndReset,
  }
}

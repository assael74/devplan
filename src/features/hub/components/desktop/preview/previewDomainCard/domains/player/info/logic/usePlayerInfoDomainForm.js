// preview/previewDomainCard/domains/player/info/logic/usePlayerInfoDomainForm.js

import { useCallback, useEffect, useMemo, useState } from 'react'
import { usePlayerHubUpdate } from '../../../../../../../../hooks/players/usePlayerHubUpdate.js'

import {
  buildComparableForm,
  buildInitialForm,
  buildPlayerName,
  isPlaceholderPhone,
  pickPatch,
} from './playerInfo.domain.logic.js'

export function usePlayerInfoDomainForm({ entity, onClose }) {
  const player = entity || {}

  const initial = useMemo(() => buildInitialForm(player), [player])
  const [form, setForm] = useState(initial)

  useEffect(() => {
    setForm(initial)
  }, [initial])

  const entityName = useMemo(() => buildPlayerName(player), [player])

  const { run, pending } = usePlayerHubUpdate(player)

  const dirty = useMemo(() => {
    const next = buildComparableForm(form)
    const init = buildComparableForm(initial)
    return Object.keys(pickPatch(next, init)).length > 0
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
    onClose?.()
  }, [onClose, onReset])

  const onSave = useCallback(async () => {
    if (!dirty || pending) return

    const next = buildComparableForm(form)
    const init = buildComparableForm(initial)
    const patch = pickPatch(next, init)

    if (!Object.keys(patch).length) return

    await run(patch, {
      section: 'infoDomain',
      playerId: player?.id,
      entityName,
      createIfMissing: true,
    })

    onClose?.()
  }, [dirty, pending, form, initial, run, player, entityName, onClose])

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

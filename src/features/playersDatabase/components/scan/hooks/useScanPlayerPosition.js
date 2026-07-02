// src/features/playersDatabase/components/scan/hooks/useScanPlayerPosition.js

import { useEffect, useMemo, useState } from 'react'
import { updatePlayerSeasonPosition } from '../../../services/pdbPlayers.firestore.js'
import { markLeagueBoardCacheDirty } from '../../leagues/board/hook/leagueBoardCache.js'
import { getPlayerPositionInfo, getPositionOptions } from '../logic/player.logic.js'
import { clean } from '../logic/utils.js'

export function useScanPlayerPosition(player) {
  const position = useMemo(() => getPlayerPositionInfo(player), [player])
  const [selectedLayer, setSelectedLayer] = useState(position.layerKey || '')
  const [selectedPosition, setSelectedPosition] = useState(position.primaryPosition || '')
  const [savedLayer, setSavedLayer] = useState(position.layerKey || '')
  const [savedPosition, setSavedPosition] = useState(position.primaryPosition || '')
  const [positionSaved, setPositionSaved] = useState(!position.missingDocumentLayer)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setSelectedLayer(position.layerKey || '')
    setSelectedPosition(position.primaryPosition || '')
    setSavedLayer(position.layerKey || '')
    setSavedPosition(position.primaryPosition || '')
    setPositionSaved(!position.missingDocumentLayer)
    setError('')
  }, [player?.id, player?.searchDocId, position.layerKey, position.primaryPosition, position.missingDocumentLayer])

  const positionOptions = useMemo(() => getPositionOptions(selectedLayer), [selectedLayer])
  const hasDraft = clean(selectedLayer) !== clean(savedLayer) || clean(selectedPosition) !== clean(savedPosition)
  const showStatus = !positionSaved || hasDraft

  const changeLayer = value => {
    const nextLayer = clean(value)
    const positionIsValid = getPositionOptions(nextLayer).some(option => option.code === selectedPosition)
    setSelectedLayer(nextLayer)
    if (!positionIsValid) setSelectedPosition('')
  }

  const savePosition = async () => {
    if (!hasDraft || saving) return
    const patch = { positionLayer: clean(selectedLayer), primaryPosition: clean(selectedPosition), positions: clean(selectedPosition) ? [clean(selectedPosition)] : [] }
    setSaving(true)
    setError('')

    try {
      await updatePlayerSeasonPosition(player, patch)
      markLeagueBoardCacheDirty()
      setSavedLayer(patch.positionLayer)
      setSavedPosition(patch.primaryPosition)
      setPositionSaved(Boolean(patch.positionLayer))
    } catch (err) {
      setError(err?.message || 'שמירת עמדה נכשלה')
    } finally {
      setSaving(false)
    }
  }

  return { position, selectedLayer, selectedPosition, positionOptions, hasDraft, showStatus, saving, error, setSelectedPosition, changeLayer, savePosition }
}

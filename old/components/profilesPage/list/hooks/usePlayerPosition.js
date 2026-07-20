// features/playersDatabase/components/profilesPage/list/hooks/usePlayerPosition.js

import { useEffect, useMemo, useState } from 'react'

import { updatePlayerSeasonPosition } from '../../../../services/pdbPlayers.firestore.js'
import { markLeagueBoardCacheDirty } from '../../../summary/hooks/leagueBoardCache.js'
import { clean } from '../../logic/utils.js'
import {
  getPlayerPositionInfo,
  getPositionLayerOptions,
  getPositionOptions,
} from '../logic/player.logic.js'

function getInitialShirtNumber(player) {
  return clean(
    player?.numShirt ||
      player?.shirtNumber ||
      player?.playerNumber ||
      player?.number ||
      player?.jerseyNumber
  )
}

export function usePlayerPosition(player, options = {}) {
  const position = useMemo(() => getPlayerPositionInfo(player), [player])
  const initialShirtNumber = getInitialShirtNumber(player)

  const [selectedLayer, setSelectedLayer] = useState(position.layerKey || '')
  const [selectedPosition, setSelectedPosition] = useState(position.primaryPosition || '')
  const [selectedShirtNumber, setSelectedShirtNumber] = useState(initialShirtNumber)
  const [savedLayer, setSavedLayer] = useState(position.layerKey || '')
  const [savedPosition, setSavedPosition] = useState(position.primaryPosition || '')
  const [savedShirtNumber, setSavedShirtNumber] = useState(initialShirtNumber)
  const [positionSaved, setPositionSaved] = useState(!position.missingDocumentLayer)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const nextShirtNumber = getInitialShirtNumber(player)

    setSelectedLayer(position.layerKey || '')
    setSelectedPosition(position.primaryPosition || '')
    setSelectedShirtNumber(nextShirtNumber)
    setSavedLayer(position.layerKey || '')
    setSavedPosition(position.primaryPosition || '')
    setSavedShirtNumber(nextShirtNumber)
    setPositionSaved(!position.missingDocumentLayer)
    setError('')
  }, [
    player?.id,
    player?.searchDocId,
    player?.numShirt,
    player?.shirtNumber,
    player?.playerNumber,
    player?.number,
    player?.jerseyNumber,
    position.layerKey,
    position.primaryPosition,
    position.missingDocumentLayer,
  ])

  const layerOptions = useMemo(() => getPositionLayerOptions(), [])
  const positionOptions = useMemo(() => getPositionOptions(selectedLayer), [selectedLayer])

  const hasDraft =
    clean(selectedLayer) !== clean(savedLayer) ||
    clean(selectedPosition) !== clean(savedPosition) ||
    clean(selectedShirtNumber) !== clean(savedShirtNumber)

  const showStatus = !positionSaved || hasDraft

  const changeLayer = value => {
    const nextLayer = clean(value)
    const currentPosition = clean(selectedPosition)
    const nextPositionIsValid = getPositionOptions(nextLayer).some(
      option => option.code === currentPosition
    )

    setSelectedLayer(nextLayer)
    if (!nextPositionIsValid) setSelectedPosition('')
  }

  const clearLayer = () => {
    setSelectedLayer('')
    setSelectedPosition('')
  }

  const changePosition = value => {
    setSelectedPosition(clean(value))
  }

  const clearPosition = () => {
    setSelectedPosition('')
  }

  const changeShirtNumber = value => {
    setSelectedShirtNumber(clean(value))
  }

  const resetPosition = () => {
    setSelectedLayer(savedLayer)
    setSelectedPosition(savedPosition)
    setSelectedShirtNumber(savedShirtNumber)
  }

  const savePosition = async () => {
    if (!hasDraft || saving) return

    const positionLayer = clean(selectedLayer)
    const primaryPosition = clean(selectedPosition)
    const shirtNumber = clean(selectedShirtNumber)

    const patch = {
      positionLayer,
      primaryPosition,
      positions: primaryPosition ? [primaryPosition] : [],
      numShirt: shirtNumber,
      shirtNumber,
    }

    setSaving(true)
    setError('')

    try {
      await updatePlayerSeasonPosition(player, patch)
      markLeagueBoardCacheDirty()
      setSavedLayer(patch.positionLayer)
      setSavedPosition(patch.primaryPosition)
      setSavedShirtNumber(patch.numShirt)
      setPositionSaved(Boolean(patch.positionLayer || patch.primaryPosition || patch.numShirt))
      await options.onSaved?.(player, patch)
    } catch (err) {
      setError(err?.message || 'שמירת עמדה נכשלה')
    } finally {
      setSaving(false)
    }
  }

  return {
    position,
    selectedLayer,
    selectedPosition,
    selectedShirtNumber,
    layerOptions,
    positionOptions,
    hasDraft,
    showStatus,
    saving,
    error,
    changeLayer,
    clearLayer,
    changePosition,
    clearPosition,
    changeShirtNumber,
    resetPosition,
    savePosition,
  }
}

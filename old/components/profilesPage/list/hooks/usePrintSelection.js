// features/playersDatabase/components/profilesPage/list/hooks/usePrintSelection.js

import { useEffect, useMemo, useState } from 'react'

import { clean } from '../../logic/utils.js'

const getRowKey = player => clean(player?.searchDocId || player?.id)

const buildSelectionMap = (rows, selected) =>
  rows.reduce((result, player) => {
    result[getRowKey(player)] = selected
    return result
  }, {})

export function usePrintSelection(rowId, rows = []) {
  const [selectionMode, setSelectionMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState({})

  useEffect(() => {
    setSelectionMode(false)
    setSelectedIds({})
  }, [rowId])

  useEffect(() => {
    if (!selectionMode) return

    setSelectedIds(current =>
      rows.reduce((result, player) => {
        const key = getRowKey(player)
        result[key] = current[key] === undefined ? true : current[key]
        return result
      }, {})
    )
  }, [rows, selectionMode])

  const selectedRows = useMemo(
    () => rows.filter(player => selectedIds[getRowKey(player)]),
    [rows, selectedIds]
  )

  const selectAll = () => {
    setSelectedIds(buildSelectionMap(rows, true))
  }

  const clearSelection = () => {
    setSelectionMode(false)
    setSelectedIds({})
  }

  const toggleSelection = player => {
    const key = getRowKey(player)
    setSelectedIds(current => ({ ...current, [key]: !current[key] }))
  }

  const startSelection = () => {
    setSelectionMode(true)
    setSelectedIds(buildSelectionMap(rows, true))
  }

  const cancelSelection = () => {
    setSelectionMode(false)
    setSelectedIds({})
  }

  return {
    selectionMode,
    selectedIds,
    selectedRows,
    getRowKey,
    selectAll,
    clearSelection,
    toggleSelection,
    startSelection,
    cancelSelection,
  }
}

// src/features/playersDatabase/components/scan/hooks/useScanPrintSelection.js

import { useEffect, useMemo, useState } from 'react'
import { clean } from '../logic/utils.js'

const getRowKey = player => clean(player?.searchDocId || player?.id)

export function useScanPrintSelection(rowId, rows = []) {
  const [selectionMode, setSelectionMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState({})

  useEffect(() => {
    setSelectionMode(false)
    setSelectedIds({})
  }, [rowId])

  useEffect(() => {
    if (!selectionMode) return
    setSelectedIds(current => rows.reduce((acc, player) => {
      const key = getRowKey(player)
      acc[key] = current[key] ?? true
      return acc
    }, {}))
  }, [rows, selectionMode])

  const selectedRows = useMemo(() => rows.filter(player => selectedIds[getRowKey(player)]), [rows, selectedIds])
  const selectAll = () => setSelectedIds(rows.reduce((acc, player) => { acc[getRowKey(player)] = true; return acc }, {}))
  const clearSelection = () => setSelectedIds(rows.reduce((acc, player) => { acc[getRowKey(player)] = false; return acc }, {}))
  const toggleSelection = player => setSelectedIds(current => ({ ...current, [getRowKey(player)]: !current[getRowKey(player)] }))
  const startSelection = () => {
    setSelectionMode(true)
    selectAll()
  }
  const cancelSelection = () => {
    setSelectionMode(false)
    setSelectedIds({})
  }

  return { selectionMode, selectedIds, selectedRows, getRowKey, selectAll, clearSelection, toggleSelection, startSelection, cancelSelection }
}

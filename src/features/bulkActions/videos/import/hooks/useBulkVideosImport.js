//  src/features/bulkActions/videos/import/hooks/useBulkVideosImport.js

import { useMemo, useState } from 'react'

import { importVideosBulk } from '../../../application/bulkActions.actions.js'
import { VIDEO_PRIMARY_CATEGORIES } from '../../../../../shared/video/videoCategories.constants.js'

import { parseVideosImportRows } from '../logic/parseVideosImportRows.js'
import { normalizeVideoImportRow } from '../logic/normalizeVideoImportRow.js'
import { buildVideosImportDraft } from '../logic/buildVideosImportDraft.js'

const sortByOrder = (a, b) => Number(a?.order || 0) - Number(b?.order || 0)

function mergeRowPatch(row, patch = {}) {
  return {
    ...row,
    ...patch,
    name: patch.name ?? row.name,
    primaryCategory: patch.primaryCategory ?? row.primaryCategory ?? '',
  }
}

export function useBulkVideosImport({
  onImportVideos,
} = {}) {
  const [pasteValue, setPasteValue] = useState('')
  const [rowPatches, setRowPatches] = useState({})
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)

  const categories = useMemo(() => {
    return VIDEO_PRIMARY_CATEGORIES.slice().sort(sortByOrder)
  }, [])

  const parsedRows = useMemo(() => {
    return parseVideosImportRows(pasteValue)
  }, [pasteValue])

  const rows = useMemo(() => {
    return parsedRows
      .map(row => mergeRowPatch(row, rowPatches[row.rowId]))
      .map(normalizeVideoImportRow)
      .map(row => ({
        ...row,
        primaryCategory: rowPatches[row.rowId]?.primaryCategory || row.primaryCategory || '',
      }))
  }, [parsedRows, rowPatches])

  const validRows = useMemo(() => {
    return rows.filter(row => row.isValid)
  }, [rows])

  const invalidRows = useMemo(() => {
    return rows.filter(row => !row.isValid)
  }, [rows])

  const rowsMissingCategory = useMemo(() => {
    return rows.filter(row => row.isValid && !row.primaryCategory)
  }, [rows])

  const hasRows = rows.length > 0
  const hasInvalidRows = invalidRows.length > 0
  const hasMissingCategories = rowsMissingCategory.length > 0

  const canImport =
    hasRows &&
    validRows.length > 0 &&
    !hasInvalidRows &&
    !hasMissingCategories &&
    !pending

  const draft = useMemo(() => {
    return buildVideosImportDraft({ rows })
  }, [rows])

  const updateRowPatch = (rowId, patch) => {
    setRowPatches(prev => ({
      ...prev,
      [rowId]: {
        ...(prev[rowId] || {}),
        ...patch,
      },
    }))
  }

  const setRowName = (rowId, name) => {
    updateRowPatch(rowId, { name })
  }

  const setRowCategory = (rowId, primaryCategory) => {
    updateRowPatch(rowId, { primaryCategory: primaryCategory || '' })
  }

  const handlePasteValueChange = value => {
    setPasteValue(value)
    setRowPatches({})
    setError('')
    setResult(null)
  }

  const reset = () => {
    setPasteValue('')
    setRowPatches({})
    setPending(false)
    setError('')
    setResult(null)
  }

  const runImport = async () => {
    if (!canImport) return null

    setPending(true)
    setError('')
    setResult(null)

    try {
      const res = onImportVideos
        ? await onImportVideos({ draft })
        : await importVideosBulk({ draft })

      setResult(res || {
        total: draft.videos.length,
        items: draft.videos,
      })

      return res
    } catch (err) {
      const message = err?.message || 'ייבוא הומספר קטעי וידאו נכשל'
      setError(message)
      return null
    } finally {
      setPending(false)
    }
  }

  return {
    pasteValue,
    setPasteValue: handlePasteValueChange,

    categories,
    rows,
    validRows,
    invalidRows,
    rowsMissingCategory,

    hasRows,
    hasInvalidRows,
    hasMissingCategories,
    canImport,

    pending,
    error,
    result,
    draft,

    setRowName,
    setRowCategory,

    reset,
    runImport,
  }
}

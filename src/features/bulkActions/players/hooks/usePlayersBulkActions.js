// src/features/bulkActions/players/hooks/usePlayersBulkActions.js

import { useCallback, useMemo, useState } from 'react'

import { createActions } from '../../../../ui/forms/create/createActions.js'
import { deleteActions } from '../../../../ui/domains/entityLifecycle/delete/deleteActions.js'
import { PLAYERS_DELETE_SCOPE } from '../delete/configs/playersDelete.config.js'

function cleanError(error) {
  return String(error?.message || error || 'אירעה שגיאה לא צפויה')
}

export default function usePlayersBulkActions({
  team,
  players = [],
  notify,
  onImportSuccess,
  onDeleteSuccess,
}) {
  const [importOpen, setImportOpen] = useState(false)
  const [importSaving, setImportSaving] = useState(false)
  const [importError, setImportError] = useState('')

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const [deleteScope, setDeleteScope] = useState(PLAYERS_DELETE_SCOPE.SELECTED)
  const [selectedPlayerIds, setSelectedPlayerIds] = useState([])

  const selectedIdsSet = useMemo(() => new Set(selectedPlayerIds), [selectedPlayerIds])
  const selectedCount = selectedPlayerIds.length
  const hasSelection = selectedCount > 0

  const openImport = useCallback(() => {
    setImportError('')
    setImportOpen(true)
  }, [])

  const closeImport = useCallback(() => {
    if (importSaving) return
    setImportOpen(false)
    setImportError('')
  }, [importSaving])

  const handleImportPlayers = useCallback(async ({ payload }) => {
    if (importSaving) return

    setImportSaving(true)
    setImportError('')

    try {
      const result = await createActions.players({ draft: payload })

      setImportOpen(false)

      notify?.({
        status: 'success',
        action: 'create',
        entityType: 'player',
        message: `${result?.total || 0} שחקנים יובאו בהצלחה`,
      })

      await onImportSuccess?.(result)
    } catch (error) {
      const message = cleanError(error)
      setImportError(message)

      notify?.({
        status: 'error',
        action: 'create',
        entityType: 'player',
        message,
      })
    } finally {
      setImportSaving(false)
    }
  }, [importSaving, notify, onImportSuccess])

  const togglePlayer = useCallback(playerId => {
    if (!playerId) return

    setSelectedPlayerIds(current => {
      if (current.includes(playerId)) return current.filter(id => id !== playerId)
      return [...current, playerId]
    })
  }, [])

  const selectPlayers = useCallback(ids => {
    setSelectedPlayerIds(Array.from(new Set((ids || []).filter(Boolean))))
  }, [])

  const clearSelection = useCallback(() => {
    setSelectedPlayerIds([])
  }, [])

  const selectAll = useCallback(() => {
    const ids = players
      .map(player => player?.id || player?.playerId || player?.player?.id)
      .filter(Boolean)

    setSelectedPlayerIds(Array.from(new Set(ids)))
  }, [players])

  const openDeleteSelected = useCallback(() => {
    if (!selectedPlayerIds.length) return

    setDeleteScope(PLAYERS_DELETE_SCOPE.SELECTED)
    setDeleteError('')
    setDeleteOpen(true)
  }, [selectedPlayerIds])

  const openDeleteAll = useCallback(() => {
    setDeleteScope(PLAYERS_DELETE_SCOPE.ALL_TEAM_PLAYERS)
    setDeleteError('')
    setDeleteOpen(true)
  }, [])

  const closeDelete = useCallback(() => {
    if (deleteLoading) return
    setDeleteOpen(false)
    setDeleteError('')
  }, [deleteLoading])

  const handleConfirmDelete = useCallback(async plan => {
    if (deleteLoading) return

    setDeleteLoading(true)
    setDeleteError('')

    try {
      const result = await deleteActions.playersBulk({ ids: plan.playerIds })

      setDeleteOpen(false)
      setSelectedPlayerIds([])

      const imagesFailed = result?.images?.failed || 0
      const imageMessage = imagesFailed ? ` ${imagesFailed} תמונות לא נמחקו מהאחסון.` : ''

      notify?.({
        status: imagesFailed ? 'warning' : 'success',
        action: 'delete',
        entityType: 'player',
        message: `${plan.playerIds.length} שחקנים נמחקו בהצלחה.${imageMessage}`,
      })

      await onDeleteSuccess?.({ plan, result })
    } catch (error) {
      const message = cleanError(error)
      setDeleteError(message)

      notify?.({
        status: 'error',
        action: 'delete',
        entityType: 'player',
        message,
      })
    } finally {
      setDeleteLoading(false)
    }
  }, [deleteLoading, notify, onDeleteSuccess])

  return {
    importDrawerProps: {
      open: importOpen,
      onClose: closeImport,
      team,
      saving: importSaving,
      error: importError,
      onPreviewReady: handleImportPlayers,
    },

    deleteModalProps: {
      open: deleteOpen,
      onClose: closeDelete,
      team,
      players,
      selectedPlayerIds,
      initialScope: deleteScope,
      loading: deleteLoading,
      error: deleteError,
      onConfirmDelete: handleConfirmDelete,
    },

    selection: {
      selectedPlayerIds,
      selectedIdsSet,
      selectedCount,
      hasSelection,
      togglePlayer,
      selectPlayers,
      selectAll,
      clearSelection,
    },

    actions: {
      openImport,
      openDeleteSelected,
      openDeleteAll,
    },

    state: {
      importSaving,
      deleteLoading,
    },
  }
}

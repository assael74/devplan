// src/features/hub/teamProfile/sharedModules/games/model/useTeamGamesDeleteActions.js

import { useMemo, useState } from 'react'

import { GAMES_DELETE_SCOPE } from '../../../../../bulkActions/games/delete/index.js'
import { deleteEntity, unwrapActionResult } from '../../../../application/index.js'
import { useSnackbar } from '../../../../../../ui/core/feedback/snackbar/SnackbarProvider.js'

const safeArray = value => (Array.isArray(value) ? value : [])

export function useTeamGamesDeleteActions({
  liveTeam,
  games = [],
  selectedGameIds = [],
  onDeleteGamesBulk,
}) {
  const { notify } = useSnackbar()

  const [gamesDeleteOpen, setGamesDeleteOpen] = useState(false)
  const [gamesDeleteScope, setGamesDeleteScope] = useState(
    GAMES_DELETE_SCOPE.SELECTED
  )
  const [gamesDeleteSaving, setGamesDeleteSaving] = useState(false)
  const [gamesDeleteError, setGamesDeleteError] = useState('')

  const selectedCount = safeArray(selectedGameIds).length

  const canDeleteSelected = selectedCount > 0
  const canDeleteAll = safeArray(games).length > 0

  const handleOpenSelectedDelete = () => {
    if (!canDeleteSelected) return

    setGamesDeleteError('')
    setGamesDeleteScope(GAMES_DELETE_SCOPE.SELECTED)
    setGamesDeleteOpen(true)
  }

  const handleOpenAllTeamGamesDelete = () => {
    if (!canDeleteAll) return

    setGamesDeleteError('')
    setGamesDeleteScope(GAMES_DELETE_SCOPE.ALL_TEAM_GAMES)
    setGamesDeleteOpen(true)
  }

  const handleCloseGamesDelete = () => {
    if (gamesDeleteSaving) return

    setGamesDeleteOpen(false)
    setGamesDeleteError('')
  }

  const handleConfirmGamesDelete = async plan => {
    if (!plan?.isValid || gamesDeleteSaving) return

    const ids = Array.from(new Set((plan?.gameIds || []).filter(Boolean)))

    if (!ids.length) {
      const message = 'לא נמצאו משחקים למחיקה'

      setGamesDeleteError(message)

      notify({
        status: 'error',
        action: 'delete',
        entityType: 'game',
        message,
      })

      return
    }

    setGamesDeleteSaving(true)
    setGamesDeleteError('')

    try {
      if (typeof onDeleteGamesBulk === 'function') {
        await onDeleteGamesBulk(plan)
      } else {
        unwrapActionResult(await deleteEntity({
          entityType: 'gamesBulk',
          ids,
        }))
      }

      notify({
        status: 'success',
        action: 'delete',
        entityType: 'game',
        message: `${ids.length} משחקים נמחקו בהצלחה`,
      })

      setGamesDeleteOpen(false)
    } catch (error) {
      const message = error?.message || 'מחיקת המשחקים נכשלה'

      console.error('[GAMES_BULK_DELETE:error]', error)
      setGamesDeleteError(message)

      notify({
        status: 'error',
        action: 'delete',
        entityType: 'game',
        message: 'מחיקת המשחקים נכשלה',
        details: message,
      })
    } finally {
      setGamesDeleteSaving(false)
    }
  }

  const gamesDeleteState = useMemo(() => {
    return {
      gamesDeleteOpen,
      gamesDeleteScope,
      gamesDeleteSaving,
      gamesDeleteError,
      selectedGameIds: safeArray(selectedGameIds),
      selectedGamesCount: selectedCount,
    }
  }, [
    gamesDeleteOpen,
    gamesDeleteScope,
    gamesDeleteSaving,
    gamesDeleteError,
    selectedGameIds,
    selectedCount,
  ])

  return {
    ...gamesDeleteState,

    handleOpenSelectedDelete,
    handleOpenAllTeamGamesDelete,
    handleCloseGamesDelete,
    handleConfirmGamesDelete,
  }
}

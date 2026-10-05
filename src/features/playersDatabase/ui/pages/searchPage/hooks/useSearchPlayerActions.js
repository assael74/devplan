// src/features/playersDatabase/ui/pages/searchPage/hooks/useSearchPlayerActions.js

import * as React from 'react'

import { updatePlayerNotes } from '../../../../services/write/player/edits/updatePlayerRootManual.js'
import { updatePlayerRole } from '../../../../services/write/player/edits/updatePlayerRootManual.js'

const buildRowKey = row => [
  row?.playerId,
  row?.season?.seasonId || row?.seasonKey,
  row?.team?.teamId || row?.teamName,
].map(value => String(value || '').trim()).join('::')

export default function useSearchPlayerActions({
  setLoadedRows,
}) {
  const [pendingNoteKeys, setPendingNoteKeys] = React.useState(() => new Set())
  const [roleRow, setRoleRow] = React.useState(null)
  const [roleDraft, setRoleDraft] = React.useState({
    positionLayer: '',
    primaryPosition: '',
  })
  const [roleBusy, setRoleBusy] = React.useState(false)

  const getRowKey = React.useCallback(row => buildRowKey(row), [])

  const saveNotes = React.useCallback(async (row, notes) => {
    const noteKey = getRowKey(row)
    if (!noteKey || pendingNoteKeys.has(noteKey)) return null

    const previousNotes = String(row?.notes || '')
    const nextNotes = String(notes || '').trim()

    setPendingNoteKeys(current => {
      const next = new Set(current)
      next.add(noteKey)
      return next
    })
    setLoadedRows(current => current.map(item => (
      getRowKey(item) === noteKey
        ? {
          ...item,
          notes: nextNotes,
        }
        : item
    )))

    try {
      const result = await updatePlayerNotes({
        playerId: row?.playerId,
        notes: nextNotes,
      })

      if (result?.completed !== true) {
        throw new Error('ההערה לא נשמרה במסמך השחקן')
      }

      return result
    } catch (error) {
      setLoadedRows(current => current.map(item => (
        getRowKey(item) === noteKey
          ? {
            ...item,
            notes: previousNotes,
          }
          : item
      )))
      throw error
    } finally {
      setPendingNoteKeys(current => {
        const next = new Set(current)
        next.delete(noteKey)
        return next
      })
    }
  }, [getRowKey, pendingNoteKeys, setLoadedRows])

  const openRoleEditor = React.useCallback(row => {
    if (!row) return

    setRoleRow(row)
    setRoleDraft({
      positionLayer: row.positionLayer || row.position?.layer || '',
      primaryPosition: row.primaryPosition || row.position?.primary || '',
    })
  }, [])

  const closeRoleEditor = React.useCallback(() => {
    if (roleBusy) return

    setRoleRow(null)
    setRoleDraft({
      positionLayer: '',
      primaryPosition: '',
    })
  }, [roleBusy])

  const confirmRoleEditor = React.useCallback(async () => {
    if (!roleRow || roleBusy) return null

    const rowKey = getRowKey(roleRow)
    const previousPositionLayer = roleRow.positionLayer || roleRow.position?.layer || ''
    const previousPrimaryPosition = roleRow.primaryPosition || roleRow.position?.primary || ''

    setRoleBusy(true)
    setLoadedRows(current => current.map(item => (
      getRowKey(item) === rowKey
        ? {
          ...item,
          positionLayer: roleDraft.positionLayer,
          primaryPosition: roleDraft.primaryPosition,
          position: {
            ...(item.position || {}),
            layer: roleDraft.positionLayer,
            primary: roleDraft.primaryPosition,
          },
        }
        : item
    )))

    try {
      const result = await updatePlayerRole({
        playerId: roleRow.playerId,
        positionLayer: roleDraft.positionLayer,
        primaryPosition: roleDraft.primaryPosition,
      })

      setRoleRow(null)
      setRoleDraft({
        positionLayer: '',
        primaryPosition: '',
      })
      return result
    } catch (error) {
      setLoadedRows(current => current.map(item => (
        getRowKey(item) === rowKey
          ? {
            ...item,
            positionLayer: previousPositionLayer,
            primaryPosition: previousPrimaryPosition,
            position: {
              ...(item.position || {}),
              layer: previousPositionLayer,
              primary: previousPrimaryPosition,
            },
          }
          : item
      )))
      throw error
    } finally {
      setRoleBusy(false)
    }
  }, [getRowKey, roleBusy, roleDraft, roleRow, setLoadedRows])

  const roleChanged = Boolean(
    roleRow && (
      roleDraft.positionLayer !== (roleRow.positionLayer || roleRow.position?.layer || '') ||
      roleDraft.primaryPosition !== (roleRow.primaryPosition || roleRow.position?.primary || '')
    )
  )

  return {
    getRowKey,
    pendingNoteKeys,
    saveNotes,
    roleEditor: {
      row: roleRow,
      draft: roleDraft,
      busy: roleBusy,
      changed: roleChanged,
      setDraft: setRoleDraft,
      open: openRoleEditor,
      close: closeRoleEditor,
      confirm: confirmRoleEditor,
    },
  }
}

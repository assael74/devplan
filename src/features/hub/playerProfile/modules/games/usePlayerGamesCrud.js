// teamProfile/modules/games/useTeamGamesCrud.js
import { useCallback, useState } from 'react'

const safe = (v) => (v == null ? '' : String(v))

export function usePlayerGamesCrud(team, onEntityChange) {
  const [editOpen, setEditOpen] = useState(false)
  const [editMode, setEditMode] = useState('create')
  const [editRow, setEditRow] = useState(null)

  const openCreate = useCallback(() => {
    setEditMode('create')
    setEditRow(null)
    setEditOpen(true)
  }, [])

  const openEdit = useCallback((row) => {
    setEditMode('edit')
    setEditRow(row || null)
    setEditOpen(true)
  }, [])

  const closeEdit = useCallback(() => setEditOpen(false), [])

  const commitTeam = useCallback(
    (nextTeam) => {
      if (typeof onEntityChange === 'function') return onEntityChange(nextTeam)
      console.warn('[TeamGamesModule] missing onEntityChange(entity) prop')
    },
    [onEntityChange]
  )

  const onUpsert = useCallback(
    (nextGamePack) => {
      const base = Array.isArray(team?.teamGames) ? team.teamGames : []
      const nextId = safe(nextGamePack?.gameId || nextGamePack?.game?.id || nextGamePack?.id).trim()
      if (!nextId) return

      const next = []
      let replaced = false

      for (let i = 0; i < base.length; i++) {
        const r = base[i]
        const rid = safe(r?.gameId || r?.game?.id || r?.id).trim()
        if (rid && rid === nextId) {
          next.push(nextGamePack)
          replaced = true
        } else {
          next.push(r)
        }
      }

      if (!replaced) next.unshift(nextGamePack)

      commitTeam({ ...(team || {}), teamGames: next })
      closeEdit()
    },
    [team, commitTeam, closeEdit]
  )

  const onDelete = useCallback(
    (gameId) => {
      const id = safe(gameId).trim()
      if (!id) return

      const base = Array.isArray(team?.teamGames) ? team.teamGames : []
      const next = base.filter((r) => safe(r?.gameId || r?.game?.id || r?.id).trim() !== id)

      commitTeam({ ...(team || {}), teamGames: next })
      closeEdit()
    },
    [team, commitTeam, closeEdit]
  )

  return {
    editOpen,
    editMode,
    editRow,
    openCreate,
    openEdit,
    closeEdit,
    onUpsert,
    onDelete,
  }
}

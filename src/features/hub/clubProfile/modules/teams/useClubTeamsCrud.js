// clubProfile/modules/teams/useClubTeamsCrud.js
import { useCallback, useMemo, useState } from 'react'

const s = (v) => (v == null ? '' : String(v))
const norm = (v) => s(v).trim()

const pickId = (r) => norm(r?.teamId || r?.team?.id || r?.id)

export function useClubTeamsCrud(club, onEntityChange) {
  const [editOpen, setEditOpen] = useState(false)
  const [editMode, setEditMode] = useState('create')
  const [editRow, setEditRow] = useState(null)

  const base = useMemo(() => (Array.isArray(club?.teams) ? club.teams : []), [club])

  const commitClub = useCallback(
    (nextClub) => {
      if (typeof onEntityChange === 'function') return onEntityChange(nextClub)
      console.warn('[useClubTeamsCrud] missing onEntityChange(entity)')
    },
    [onEntityChange]
  )

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

  const upsert = useCallback(
    (nextPack) => {
      const nextId = pickId(nextPack)
      if (!nextId) return

      const next = []
      let replaced = false

      for (let i = 0; i < base.length; i++) {
        const r = base[i]
        const rid = pickId(r)
        if (rid && rid === nextId) {
          next.push({ ...r, ...nextPack, teamId: nextId })
          replaced = true
        } else {
          next.push(r)
        }
      }

      if (!replaced) next.unshift({ ...nextPack, teamId: nextId })

      commitClub({ ...(club || {}), teams: next })
      closeEdit()
    },
    [base, club, commitClub, closeEdit]
  )

  const remove = useCallback(
    (teamId) => {
      const id = norm(teamId)
      if (!id) return
      const next = base.filter((r) => pickId(r) !== id)
      commitClub({ ...(club || {}), teams: next })
      closeEdit()
    },
    [base, club, commitClub, closeEdit]
  )

  const toggleActive = useCallback(
    (row) => {
      const r = row?.raw || row || {}
      const id = pickId(r) || row?.id
      if (!id) return

      const curActive = !!(r?.active ?? r?.team?.active ?? true)
      upsert({ ...r, teamId: id, active: !curActive })
    },
    [upsert]
  )

  return {
    editOpen,
    editMode,
    editRow,
    openCreate,
    openEdit,
    closeEdit,
    upsert,
    remove,
    toggleActive,
  }
}

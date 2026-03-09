// teamProfile/modules/players/useTeamPlayersCrud.js
import { useCallback, useMemo, useState } from 'react'

const safe = (v) => (v == null ? '' : String(v))
const norm = (v) => safe(v).trim()

const pickRowId = (row) => {
  const r = row?.raw || row || {}
  return norm(row?.playerId || r?.playerId || r?.player?.id || row?.id || r?.id)
}

const ensurePack = (pack) => {
  const p = pack || {}
  const r = p?.raw || p
  const id = norm(p?.playerId || r?.playerId || r?.player?.id || p?.id || r?.id)
  if (!id) return null
  return { ...r, ...p, playerId: id }
}

export function useTeamPlayersCrud(team, onEntityChange) {
  // ---- modals state
  const [editOpen, setEditOpen] = useState(false)
  const [editMode, setEditMode] = useState('create')
  const [editRow, setEditRow] = useState(null)

  const [posOpen, setPosOpen] = useState(false)
  const [posRow, setPosRow] = useState(null)

  // ---- base list
  const base = useMemo(() => (Array.isArray(team?.players) ? team.players : []), [team?.players])

  const commitTeam = useCallback(
    (nextPlayers) => {
      const next = Array.isArray(nextPlayers) ? nextPlayers : []
      const nextTeam = { ...(team || {}), players: next }
      if (typeof onEntityChange === 'function') onEntityChange(nextTeam)
      else console.warn('[useTeamPlayersCrud] missing onEntityChange(entity)')
    },
    [team, onEntityChange]
  )

  // ---- modal controls
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

  const openPositions = useCallback((row) => {
    setPosRow(row || null)
    setPosOpen(true)
  }, [])

  const closePositions = useCallback(() => setPosOpen(false), [])

  // ---- ops
  const upsert = useCallback(
    (nextPack) => {
      const pack = ensurePack(nextPack)
      if (!pack) return

      const nextId = norm(pack.playerId)
      const next = []
      let replaced = false

      for (let i = 0; i < base.length; i++) {
        const r = base[i]
        const rid = pickRowId(r)
        if (rid && rid === nextId) {
          next.push(pack)
          replaced = true
        } else {
          next.push(r)
        }
      }

      if (!replaced) next.unshift(pack)

      commitTeam(next)
      closeEdit()
      closePositions()
    },
    [base, commitTeam, closeEdit, closePositions]
  )

  const remove = useCallback(
    (playerId) => {
      const id = norm(playerId)
      if (!id) return
      const next = base.filter((r) => pickRowId(r) !== id)
      commitTeam(next)
      closeEdit()
      closePositions()
    },
    [base, commitTeam, closeEdit, closePositions]
  )

  const toggleActive = useCallback(
    (row) => {
      const r = row?.raw || row || {}
      const id = pickRowId(row)
      if (!id) return

      const curActive = !!(r?.active ?? r?.player?.active ?? true)
      upsert({ ...r, playerId: id, active: !curActive })
    },
    [upsert]
  )

  return {
    // ui state
    editOpen,
    editMode,
    editRow,
    openCreate,
    openEdit,
    closeEdit,

    posOpen,
    posRow,
    openPositions,
    closePositions,

    // ops
    upsert,
    remove,
    toggleActive,
  }
}

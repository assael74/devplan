// teamProfile/modules/players/logic/useTeamPlayersCrud.js

import { useCallback, useMemo, useState } from 'react'
import { resolveTeamPlayers } from './teamPlayers.logic.js'
import { filterTeamPlayersRows } from './teamPlayers.filters.js'

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

  return {
    ...r,
    ...p,
    playerId: id,
  }
}

export function useTeamPlayersCrud(team, onEntityChange) {
  const [pending] = useState(false)

  const [editOpen, setEditOpen] = useState(false)
  const [editRow, setEditRow] = useState(null)

  const [posOpen, setPosOpen] = useState(false)
  const [posRow, setPosRow] = useState(null)

  const [createOpen, setCreateOpen] = useState(false)

  const [filters, setFilters] = useState({
    search: '',
    onlyActive: false,
    onlyKey: false,
    onlyProject: false,
  })

  const base = useMemo(() => (Array.isArray(team?.players) ? team.players : []), [team?.players])
  const { rows } = useMemo(() => resolveTeamPlayers(team), [team])

  const filteredRows = useMemo(() => {
    return filterTeamPlayersRows(rows, filters)
  }, [rows, filters])

  const commitTeam = useCallback(
    (nextPlayers) => {
      const next = Array.isArray(nextPlayers) ? nextPlayers : []
      const nextTeam = {
        ...(team || {}),
        players: next,
      }

      if (typeof onEntityChange === 'function') {
        onEntityChange(nextTeam)
        return
      }

      console.warn('[useTeamPlayersCrud] missing onEntityChange(entity)')
    },
    [team, onEntityChange]
  )

  const openEdit = useCallback((row) => {
    setEditRow(row || null)
    setEditOpen(true)
  }, [])

  const closeEdit = useCallback(() => {
    setEditOpen(false)
    setEditRow(null)
  }, [])

  const openPositions = useCallback((row) => {
    setPosRow(row || null)
    setPosOpen(true)
  }, [])

  const closePositions = useCallback(() => {
    setPosOpen(false)
    setPosRow(null)
  }, [])

  const openCreate = useCallback(() => setCreateOpen(true), [])
  const closeCreate = useCallback(() => setCreateOpen(false), [])

  const upsert = useCallback(
    (nextPack) => {
      const pack = ensurePack(nextPack)
      if (!pack) return

      const nextId = norm(pack.playerId)
      const next = []
      let replaced = false

      for (let i = 0; i < base.length; i += 1) {
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
      closeCreate()
    },
    [base, commitTeam, closeEdit, closePositions, closeCreate]
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

      upsert({
        ...r,
        playerId: id,
        active: !curActive,
      })
    },
    [upsert]
  )

  const setSearch = useCallback((value) => {
    setFilters((prev) => ({
      ...prev,
      search: value || '',
    }))
  }, [])

  const toggleOnlyActive = useCallback(() => {
    setFilters((prev) => ({
      ...prev,
      onlyActive: !prev.onlyActive,
    }))
  }, [])

  const toggleOnlyKey = useCallback(() => {
    setFilters((prev) => ({
      ...prev,
      onlyKey: !prev.onlyKey,
    }))
  }, [])

  const toggleOnlyProject = useCallback(() => {
    setFilters((prev) => ({
      ...prev,
      onlyProject: !prev.onlyProject,
    }))
  }, [])

  const resetFilters = useCallback(() => {
    setFilters({
      search: '',
      onlyActive: false,
      onlyKey: false,
      onlyProject: false,
    })
  }, [])

  return {
    pending,

    rows,
    filteredRows,
    filters,

    editOpen,
    editRow,
    openEdit,
    closeEdit,

    posOpen,
    posRow,
    openPositions,
    closePositions,

    createOpen,
    openCreate,
    closeCreate,

    upsert,
    remove,
    toggleActive,

    setSearch,
    toggleOnlyActive,
    toggleOnlyKey,
    toggleOnlyProject,
    resetFilters,
  }
}

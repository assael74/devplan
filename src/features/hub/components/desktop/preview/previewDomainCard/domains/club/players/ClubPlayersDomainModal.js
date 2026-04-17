// preview/previewDomainCard/domains/club/players/ClubPlayersDomainModal.js

import React, { useMemo, useState } from 'react'
import { Box } from '@mui/joy'

import ClubPlayersKpi from './components/ClubPlayersKpi'
import ClubPlayersFilters from './components/ClubPlayersFilters'
import ClubPlayersTable from './components/ClubPlayersTable'
import EditDrawer from './components/drawer/EditDrawer.js'

import { resolveClubPlayers } from './logic/clubPlayers.domain.logic'

const safe = (v) => (v == null ? '' : String(v))
const norm = (v) => safe(v).trim().toLowerCase()

export default function ClubPlayersDomainModal({ entity, context }) {
  const liveClub = useMemo(() => {
    const clubs = Array.isArray(context?.clubs) ? context.clubs : []
    return clubs.find((c) => c?.id === entity?.id) || entity || null
  }, [context?.clubs, entity])

  const [q, setQ] = useState('')
  const [minutesBelow, setMinutesBelow] = React.useState(100)
  const [onlyKey, setOnlyKey] = useState(false)
  const [editingPlayer, setEditingPlayer] = useState(null)
  const [openCreatePlayer, setOpenCreatePlayer] = useState(false)

  const { rows: baseRows, summary: baseSummary } = useMemo(() => {
    return resolveClubPlayers(liveClub)
  }, [liveClub])

  const rows = useMemo(() => {
    const searchValue = norm(q)
    const minutesLimit =
      minutesBelow === '' || minutesBelow == null || Number.isNaN(Number(minutesBelow))
        ? null
        : Number(minutesBelow)

    return baseRows.filter((row) => {
      if (searchValue) {
        const haystack = norm(
          row?.searchText ||
            [
              row?.fullName,
              row?.teamName,
              row?.generalPositionLabel,
              row?.birthLabel,
              row?.squadRoleMeta?.label,
              row?.typeMeta?.labelH,
              row?.projectChipMeta?.labelH,
            ]
              .filter(Boolean)
              .join(' ')
        )

        if (!haystack.includes(searchValue)) return false
      }

      if (onlyKey && row?.isKey !== true) return false

      if (minutesLimit != null) {
        const playTimeRate = Number(row?.playerFullStats?.playTimeRate)
        const safeRate = Number.isFinite(playTimeRate) ? playTimeRate : 0
        if (safeRate > minutesLimit) return false
      }

      return true
    })
  }, [baseRows, q, onlyKey, minutesBelow])

  const summary = useMemo(() => {
    const positionMap = new Map()

    rows.forEach((row) => {
      const key = row?.generalPositionKey || 'none'
      const label = row?.generalPositionLabel || 'ללא עמדה'

      if (!positionMap.has(key)) {
        positionMap.set(key, {
          id: key,
          label,
          count: 0,
        })
      }

      positionMap.get(key).count += 1
    })

    return {
      ...baseSummary,
      total: rows.length,
      active: rows.filter((x) => x.active).length,
      nonActive: rows.filter((x) => !x.active).length,
      key: rows.filter((x) => x.isKey).length,
      project: rows.filter((x) => x.projectChipMeta?.id === 'project').length,
      candidate: rows.filter((x) => x.projectChipMeta?.id === 'candidateFlow').length,
      positionBuckets: Array.from(positionMap.values()).sort((a, b) => b.count - a.count),
      minutesBelowThreshold: minutesBelow,
      filteredTotal: rows.length,
      sourceTotal: baseRows.length,
    }
  }, [rows, baseRows.length, baseSummary, minutesBelow])

  if (!entity) return null

  const handleCreateClose = () => {
    setOpenCreatePlayer(false)
  }

  const handleCreateOpen = () => {
    setOpenCreatePlayer(true)
  }

  const handleCreateSaved = () => {
    setOpenCreatePlayer(false)
  }

  return (
    <Box sx={{ minWidth: 0, display: 'grid', gap: 1.25 }}>
      <Box
        sx={{
          position: 'sticky',
          top: -15,
          zIndex: 5,
          borderRadius: 12,
          bgcolor: 'background.body',
        }}
      >
        <ClubPlayersKpi entity={entity} summary={summary} />

        <ClubPlayersFilters
          q={q}
          onlyKey={onlyKey}
          minutesBelow={minutesBelow}
          summary={summary}
          onChangeQ={setQ}
          onChangeOnlyKey={setOnlyKey}
          onChangeMinutesBelow={setMinutesBelow}
          onCreatePlayer={handleCreateOpen}
          openCreatePlayer={openCreatePlayer}
        />
      </Box>

      <ClubPlayersTable
        rows={rows}
        onEditPlayer={(row) => setEditingPlayer(row?.player || null)}
      />

      <EditDrawer
        open={!!editingPlayer}
        player={editingPlayer}
        onClose={() => setEditingPlayer(null)}
        onSaved={() => {}}
      />
    </Box>
  )
}

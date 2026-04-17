// hub/components/lists/players/PlayersListPane.js

import React, { useMemo, useState, useCallback, useEffect } from 'react'
import { Box, Input, Chip, Typography, Tooltip } from '@mui/joy'
import { iconUi } from '../../../../../ui/core/icons/iconUi'

import PlayersList from './PlayersList'

import { filterPlayers, buildActiveFilterChips, existsInList } from './logic/PlayersListPane.logic'
import { listSx as sx } from '../list.sx.js'

export default function PlayersListPane({
  players,
  isMobile,
  selectedId,
  onSelect,
  onOpenActions,
  onOpenRoute,
}) {
  const [q, setQ] = useState('')
  const [keyOnly, setKeyOnly] = useState(false)
  const [projectOnly, setProjectOnly] = useState(false)
  const [activeOnly, setActiveOnly] = useState(true)

  const filteredPlayers = useMemo(
    () => filterPlayers(players, { q, projectOnly, keyOnly, activeOnly }),
    [players, q, projectOnly, keyOnly, activeOnly]
  )

  useEffect(() => {
    if (!selectedId) return
    if (!existsInList(filteredPlayers, selectedId)) onSelect(null)
  }, [filteredPlayers, selectedId, onSelect])

  const activeFiltersChips = useMemo(
    () => buildActiveFilterChips({ q, projectOnly, keyOnly, activeOnly }),
    [q, projectOnly, keyOnly, activeOnly]
  )

  const hasActiveFilters = activeFiltersChips.length > 0

  const clearOne = useCallback((key) => {
    if (key === 'q') setQ('')
    if (key === 'projectOnly') setProjectOnly(false)
    if (key === 'keyOnly') setKeyOnly(false)
    if (key === 'activeOnly') setActiveOnly(true)
  }, [])

  const clearAll = useCallback(() => {
    setQ('')
    setProjectOnly(false)
    setKeyOnly(false)
    setActiveOnly(true)
  }, [])

  return (
    <Box sx={sx.root}>
      <Box sx={sx.bar}>
        <Box sx={{ display: 'flex', gap: 0.75, alignItems: 'center' }}>
          <Input
            size="sm"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="חיפוש (שם / שנתון / קבוצה / מועדון)"
            sx={{ flex: 1, minWidth: 0 }}
          />

          <Tooltip title="שחקני פרויקט" variant="outlined" placement="top" color="success" arrow>
            <Chip
              size="sm"
              variant={projectOnly ? 'solid' : 'soft'}
              color={projectOnly ? 'success' : 'neutral'}
              onClick={() => setProjectOnly((v) => !v)}
              sx={{ cursor: 'pointer' }}
              startDecorator={iconUi({ id: 'project', sx: { fontSize: 12 } })}
            />
          </Tooltip>

          <Tooltip title="שחקני מפתח" variant="outlined" placement="top" color="success" arrow>
            <Chip
              size="sm"
              variant={keyOnly ? 'solid' : 'soft'}
              color={keyOnly ? 'warning' : 'neutral'}
              onClick={() => setKeyOnly((v) => !v)}
              sx={{ cursor: 'pointer' }}
              startDecorator={iconUi({ id: 'keyPlayer', sx: { fontSize: 12 } })}
            />
          </Tooltip>

          <Tooltip title={activeOnly ? 'שחקנים פעילים בלבד' : 'כולל לא פעילים'} variant="outlined" placement="top" color="success" arrow>
            <Chip
              size="sm"
              variant={activeOnly ? 'solid' : 'soft'}
              color={activeOnly ? 'success' : 'neutral'}
              onClick={() => setActiveOnly((v) => !v)}
              sx={{ cursor: 'pointer' }}
              startDecorator={iconUi({ id: 'active', sx: { fontSize: 12 } })}
            />
          </Tooltip>

          <Tooltip title="איפוס פילטרים" variant="outlined" arrow>
            <Chip
              size="sm"
              variant="soft"
              onClick={clearAll}
              disabled={!hasActiveFilters}
              sx={sx.clearChip(hasActiveFilters)}
              startDecorator={iconUi({ id: 'close', sx: { fontSize: 12 } })}
            />
          </Tooltip>
        </Box>

        <Box sx={sx.countRow}>
          <Typography level="body-xs" sx={{ opacity: 0.7, flexShrink: 0 }}>
            מציג: {filteredPlayers.length} / {(players || []).length}
          </Typography>

          {!!activeFiltersChips.length && (
            <Box sx={sx.chipsWrap}>
              {activeFiltersChips.map((c) => (
                <Chip
                  key={c.key}
                  size="sm"
                  variant="soft"
                  onClick={() => clearOne(c.key)}
                  sx={{ cursor: 'pointer' }}
                >
                  {c.label} ✕
                </Chip>
              ))}
            </Box>
          )}
        </Box>
      </Box>

      <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto' }} className='dpScrollThin'>
        <PlayersList
          isMobile={isMobile}
          players={filteredPlayers}
          onSelect={onSelect}
          selectedId={selectedId}
          onOpenRoute={onOpenRoute}
          onOpenActions={onOpenActions}
        />
      </Box>
    </Box>
  )
}

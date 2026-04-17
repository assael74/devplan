// src/features/hub/components/lists/privates/PrivatesListPane.js

import React, { useMemo, useState, useCallback, useEffect } from 'react'
import { Box, Input, Chip, Typography, Tooltip } from '@mui/joy'
import { iconUi } from '../../../../../ui/core/icons/iconUi'

import PrivatesList from './PrivatesList.js'

import { filterPlayers, buildActiveFilterChips, existsInList } from './logic/privatesListPane.logic.js'
import { listSx as sx } from '../list.sx.js'

export default function PrivatesListPane({
  players,
  isMobile,
  selectedId,
  onSelect,
  onOpenRoute,
  onOpenActions
 }) {
  const [q, setQ] = useState('')
  const [activeOnly, setActiveOnly] = useState(true)

  const filteredPlayers = useMemo(
    () => filterPlayers(players, { q, activeOnly }),
    [players, q, activeOnly]
  )

  useEffect(() => {
    if (!selectedId) return
    if (!existsInList(filteredPlayers, selectedId)) onSelect(null)
  }, [filteredPlayers, selectedId, onSelect])

  const activeFiltersChips = useMemo(
    () => buildActiveFilterChips({ q, activeOnly }),
    [q, activeOnly]
  )

  const hasActiveFilters = activeFiltersChips.length > 0

  const clearOne = useCallback((key) => {
    if (key === 'q') setQ('')
    if (key === 'activeOnly') setActiveOnly(true)
  }, [])

  const clearAll = useCallback(() => {
    setQ('')
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
            placeholder="חיפוש (שם / שנתון / מסגרת)"
            sx={{ flex: 1, minWidth: 0 }}
          />

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

      <Box sx={sx.scroll} className="dpScrollThin">
        <PrivatesList
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

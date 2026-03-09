// hub/components/lists/team/TeamsListPane.js
import React, { useMemo, useState, useCallback, useEffect } from 'react'
import { Box, Input, Chip, Typography, Tooltip } from '@mui/joy'
import { iconUi } from '../../../../../ui/core/icons/iconUi'

import TeamsList from './TeamsList'
import { teamsListPaneSx as sx } from './sx/TeamsListPane.sx'
import { filterTeams, buildActiveFilterChips, existsInList } from './logic/TeamsListPane.logic'

export default function TeamsListPane({ teams, selectedId, onSelect, onOpenActions }) {
  const [q, setQ] = useState('')
  const [projectOnly, setProjectOnly] = useState(false)
  const [activeOnly, setActiveOnly] = useState(true)

  const filteredTeams = useMemo(
    () => filterTeams(teams, { q, projectOnly, activeOnly }),
    [teams, q, projectOnly, activeOnly]
  )

  useEffect(() => {
    if (!selectedId) return
    if (!existsInList(filteredTeams, selectedId)) onSelect(null)
  }, [filteredTeams, selectedId, onSelect])

  const activeFiltersChips = useMemo(
    () => buildActiveFilterChips({ q, projectOnly, activeOnly }),
    [q, projectOnly, activeOnly]
  )

  const hasActiveFilters = activeFiltersChips.length > 0

  const clearOne = useCallback((key) => {
    if (key === 'q') setQ('')
    if (key === 'projectOnly') setProjectOnly(false)
    if (key === 'activeOnly') setActiveOnly(true)
  }, [])

  const clearAll = useCallback(() => {
    setQ('')
    setProjectOnly(false)
    setActiveOnly(true)
  }, [])

  return (
    <Box sx={sx.root}>
      <Box sx={sx.bar}>
        <Box sx={sx.barRow}>
          <Input
            size="sm"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="חיפוש (שם / שנתון / ת״ז / IFA)"
            sx={{ flex: 1, minWidth: 0 }}
          />

          <Tooltip title="קבוצות פרוייקט" variant="outlined" placement="top" color="success" arrow>
            <Chip
              size="sm"
              variant={projectOnly ? 'solid' : 'soft'}
              color={projectOnly ? 'success' : 'neutral'}
              onClick={() => setProjectOnly((v) => !v)}
              sx={{ cursor: 'pointer' }}
              startDecorator={iconUi({ id: 'project', sx: { fontSize: 12 } })}
            />
          </Tooltip>

          <Tooltip title={activeOnly ? 'קבוצות פעילות' : 'כולם'} variant="outlined" placement="top" color="success" arrow>
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
            מציג: {filteredTeams.length} / {(teams || []).length}
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

      <Box sx={sx.scroll} className='dpScrollThin'>
        <TeamsList
          teams={filteredTeams}
          onSelect={onSelect}
          selectedId={selectedId}
          onOpenActions={onOpenActions}
        />
      </Box>
    </Box>
  )
}

// clubProfile/desktop/modules/teams/components/toolbar/ClubTeamsToolbar.js

import React from 'react'
import { Box, Input, Chip } from '@mui/joy'

import { iconUi } from '../../../../../../../../ui/core/icons/iconUi.js'
import { toolbarSx as sx } from '../../sx/toolbar.sx.js'

import ClubTeamsBottomBar from './ClubTeamsBottomBar.js'

export default function ClubTeamsToolbar({
  summary,
  filters,
  filteredCount = 0,
  sortBy = 'name',
  sortDirection = 'asc',
  onToggleOnlyActive,
  onToggleOnlyProject,
  onChangeFilters,
  onResetFilters,
  onChangeSortBy,
  onChangeSortDirection,
}) {
  const totalTeams = summary?.teamsTotal ?? 0

  const hasActiveFilters =
    !!filters?.search ||
    !!filters?.onlyActive ||
    !!filters?.onlyProject

  return (
    <Box sx={sx.toolbar}>
      <Box sx={sx.toolbarRow}>
        <Input
          value={filters?.search || ''}
          onChange={(e) => onChangeFilters({ search: e.target.value })}
          startDecorator={iconUi({ id: 'search' })}
          placeholder="חיפוש קבוצה לפי שם / שנתון / ליגה"
          size="sm"
          sx={sx.searchInput}
        />

        <Chip
          size="sm"
          variant={filters?.onlyProject ? 'solid' : 'soft'}
          color={filters?.onlyProject ? 'success' : 'neutral'}
          startDecorator={iconUi({ id: 'project' })}
          onClick={onToggleOnlyProject}
          sx={{ cursor: 'pointer', fontWeight: 700, flexShrink: 0 }}
        >
          פרויקט ({summary?.projectTeamsTotal ?? 0})
        </Chip>

        <Chip
          size="sm"
          variant={filters?.onlyActive ? 'solid' : 'soft'}
          color={filters?.onlyActive ? 'success' : 'neutral'}
          startDecorator={iconUi({ id: 'active' })}
          onClick={onToggleOnlyActive}
          sx={{ cursor: 'pointer', fontWeight: 700, flexShrink: 0 }}
        >
          פעילה ({summary?.activeTeamsTotal ?? 0})
        </Chip>

        <Box sx={{ flex: 1 }} />

        <Chip
          size="sm"
          variant="soft"
          color="danger"
          disabled={!hasActiveFilters}
          onClick={onResetFilters}
          startDecorator={iconUi({ id: 'reset' })}
          sx={sx.resetBut}
        >
          איפוס
        </Chip>
      </Box>

      <ClubTeamsBottomBar
        summary={summary}
        totalTeams={totalTeams}
        filteredTeams={filteredCount}
        sortBy={sortBy}
        sortDirection={sortDirection}
        onChangeSortBy={onChangeSortBy}
        onChangeSortDirection={onChangeSortDirection}
      />
    </Box>
  )
}

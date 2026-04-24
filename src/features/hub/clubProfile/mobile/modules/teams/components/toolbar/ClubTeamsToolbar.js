// clubProfile/mobile/modules/teams/components/toolbar/ClubTeamsToolbar.js

import React, { useMemo, useState } from 'react'
import { Box, Button, Chip } from '@mui/joy'

import {
  FiltersTrigger,
  MobileFiltersDrawerShell,
} from '../../../../../../../../ui/patterns/filters/index.js'
import { SortDrawerMobile } from '../../../../../../../../ui/patterns/sort/index.js'

import { iconUi } from '../../../../../../../../ui/core/icons/iconUi.js'

import ToolbarFilterChip from './ToolbarFilterChip.js'
import { toolbarSx as sx } from '../../sx/toolbar.sx.js'

import {
  CLUB_TEAMS_SORT_OPTIONS,
  getClubTeamsSortLabel,
  getClubTeamsSortDirectionIcon,
} from '../../../../../sharedLogic/teams/index.js'

const safeArray = (value) => (Array.isArray(value) ? value : [])

export default function ClubTeamsToolbar({
  summary,
  filters,
  totalCount = 0,
  filteredCount = 0,
  sortBy = 'name',
  sortDirection = 'asc',
  onChangeSearch,
  onToggleOnlyActive,
  onToggleOnlyProject,
  onChangeSortBy,
  onChangeSortDirection,
  onResetFilters,
}) {
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [sortOpen, setSortOpen] = useState(false)

  const hasActiveFilters =
    !!filters?.search ||
    !!filters?.onlyActive ||
    !!filters?.onlyProject

  const indicators = useMemo(() => {
    const next = []

    if (filters?.search) {
      next.push({
        id: 'search',
        label: `חיפוש: ${filters.search}`,
        idIcon: 'search',
        color: 'neutral',
        clearAction: 'search',
      })
    }

    if (filters?.onlyActive) {
      next.push({
        id: 'onlyActive',
        label: 'קבוצות פעילות בלבד',
        idIcon: 'active',
        color: 'success',
        clearAction: 'onlyActive',
      })
    }

    if (filters?.onlyProject) {
      next.push({
        id: 'onlyProject',
        label: 'קבוצות פרויקט בלבד',
        idIcon: 'project',
        color: 'warning',
        clearAction: 'onlyProject',
      })
    }

    return next
  }, [filters])

  const handleClearIndicator = (item) => {
    if (item?.clearAction === 'search') onChangeSearch('')
    if (item?.clearAction === 'onlyActive') onToggleOnlyActive()
    if (item?.clearAction === 'onlyProject') onToggleOnlyProject()
  }

  return (
    <>
      <Box sx={sx.toolbar}>
        <Box sx={sx.toolbarRow}>
          <FiltersTrigger
            hasActive={hasActiveFilters}
            onClick={() => setFiltersOpen(true)}
            label="פילטרים"
          />

          <Chip
            size="sm"
            variant="soft"
            color="primary"
            startDecorator={iconUi({ id: 'teams' })}
            sx={{ border: '1px solid', borderColor: 'divider' }}
          >
            {filteredCount} / {totalCount} קבוצות
          </Chip>

          {!!summary?.activeTeamsTotal && (
            <Chip
              size="sm"
              variant="soft"
              color="success"
              startDecorator={iconUi({ id: 'active' })}
              sx={{ border: '1px solid', borderColor: 'divider' }}
            >
              {summary.activeTeamsTotal} פעילות
            </Chip>
          )}

          {!!summary?.projectTeamsTotal && (
            <Chip
              size="sm"
              variant="soft"
              color="warning"
              startDecorator={iconUi({ id: 'project' })}
              sx={{ border: '1px solid', borderColor: 'divider' }}
            >
              {summary.projectTeamsTotal} פרויקט
            </Chip>
          )}

          <Box sx={{ flex: 1 }} />

          <Button
            size="sm"
            variant="soft"
            color="neutral"
            onClick={() => setSortOpen(true)}
            endDecorator={iconUi({
              id: getClubTeamsSortDirectionIcon(sortDirection),
              sx: { fontSize: 15, color: '#1ED760' },
            })}
            sx={sx.sortBut}
          >
            {getClubTeamsSortLabel(sortBy)}
          </Button>
        </Box>

        {!!safeArray(indicators).length && (
          <Box sx={sx.toolbarRow}>
            {indicators.map((item) => (
              <ToolbarFilterChip
                key={item.id}
                item={item}
                onClear={handleClearIndicator}
              />
            ))}
          </Box>
        )}
      </Box>

      <MobileFiltersDrawerShell
        open={filtersOpen}
        entity="club"
        onClose={() => setFiltersOpen(false)}
        title="פילטרים לקבוצות"
        subtitle="סינון קבוצות המועדון"
        resultsText={`${filteredCount} מתוך ${totalCount} קבוצות`}
        onReset={onResetFilters}
        resetDisabled={!hasActiveFilters}
      >
        <Box sx={sx.grid2}>
          <Button
            size="sm"
            variant={filters?.onlyActive ? 'solid' : 'soft'}
            color={filters?.onlyActive ? 'success' : 'neutral'}
            onClick={onToggleOnlyActive}
            startDecorator={iconUi({ id: 'active' })}
            sx={sx.filterChip}
          >
            פעילות בלבד ({summary?.activeTeamsTotal ?? 0})
          </Button>

          <Button
            size="sm"
            variant={filters?.onlyProject ? 'solid' : 'soft'}
            color={filters?.onlyProject ? 'warning' : 'neutral'}
            onClick={onToggleOnlyProject}
            startDecorator={iconUi({ id: 'project' })}
            sx={sx.filterChip}
          >
            פרויקט בלבד ({summary?.projectTeamsTotal ?? 0})
          </Button>
        </Box>
      </MobileFiltersDrawerShell>

      <SortDrawerMobile
        open={sortOpen}
        onClose={() => setSortOpen(false)}
        title="מיון קבוצות"
        sortBy={sortBy}
        sortDirection={sortDirection}
        sortOptions={CLUB_TEAMS_SORT_OPTIONS}
        onChangeSortBy={onChangeSortBy}
        onChangeSortDirection={onChangeSortDirection}
      />
    </>
  )
}

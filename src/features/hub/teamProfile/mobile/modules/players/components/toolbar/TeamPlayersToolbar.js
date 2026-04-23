// teamProfile/mobile/modules/players/components/TeamPlayersToolbar.js

import React, { useMemo, useState } from 'react'
import { Box, Chip, IconButton, Button } from '@mui/joy'

import {
  FiltersTrigger,
  MobileFiltersDrawerShell,
} from '../../../../../../../../ui/patterns/filters/index.js'
import { SortDrawerMobile } from '../../../../../../../../ui/patterns/sort/index.js'

import { iconUi } from '../../../../../../../../ui/core/icons/iconUi.js'

import PlayersFiltersContent from './PlayersFiltersContent.js'
import ToolbarFilterChip from './ToolbarFilterChip.js'

import { toolbarSx as sx } from '../../sx/toolbar.sx.js'

const safeArray = (value) => (Array.isArray(value) ? value : [])

const TEAM_PLAYERS_SORT_OPTIONS = [
  { id: 'level', label: 'פוטנציאל', idIcon: 'insights', defaultDirection: 'desc' },
  { id: 'age', label: 'גיל', idIcon: 'calendar', defaultDirection: 'asc' },
  { id: 'name', label: 'שם', idIcon: 'players', defaultDirection: 'asc' },
  { id: 'timeRate', label: 'דקות משחק', idIcon: 'playTimeRate', defaultDirection: 'desc' },
  { id: 'goals', label: 'שערים', idIcon: 'goal', defaultDirection: 'desc' },
  { id: 'assists', label: 'בישולים', idIcon: 'assists', defaultDirection: 'desc' },
  { id: 'squadRole', label: 'מעמד', idIcon: 'star', defaultDirection: 'desc' },
  { id: 'projectStatus', label: 'סטטוס פרויקט', idIcon: 'project', defaultDirection: 'asc' },
]

const getSortLabel = (sortBy) => {
  if (sortBy === 'name') return 'שם'
  if (sortBy === 'age') return 'גיל'
  if (sortBy === 'level') return 'פוטנציאל'
  if (sortBy === 'timeRate') return 'דקות'
  if (sortBy === 'goals') return 'שערים'
  if (sortBy === 'assists') return 'בישולים'
  if (sortBy === 'squadRole') return 'מעמד'
  if (sortBy === 'projectStatus') return 'פרויקט'
  return 'פוטנציאל'
}

const getSortDirectionIcon = (sortDirection) => {
  return sortDirection === 'asc' ? 'sortUp' : 'sortDown'
}

export default function TeamPlayersToolbar({
  summary,
  filters,
  totalCount = 0,
  filteredCount = 0,
  sortBy = 'level',
  sortDirection = 'desc',
  onChangeSearch,
  onToggleOnlyActive,
  onChangeSquadRole,
  onChangeProjectStatus,
  onChangePositionLayer,
  onChangeSortBy,
  onChangeSortDirection,
  onResetFilters,
}) {
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [sortOpen, setSortOpen] = useState(false)

  const hasActiveFilters =
    !!filters?.search ||
    !!filters?.onlyActive ||
    !!filters?.squadRole ||
    !!filters?.projectStatus ||
    !!filters?.positionLayer

  const indicators = useMemo(() => {
    const positionBuckets = Array.isArray(summary?.positionBuckets) ? summary.positionBuckets : []
    const squadRoleBuckets = Array.isArray(summary?.squadRoleBuckets) ? summary.squadRoleBuckets : []
    const projectStatusBuckets = Array.isArray(summary?.projectStatusBuckets) ? summary.projectStatusBuckets : []

    const positionItem = positionBuckets.find((item) => item?.id === filters?.positionLayer)
    const squadRoleItem = squadRoleBuckets.find((item) => item?.id === filters?.squadRole)
    const projectStatusItem = projectStatusBuckets.find((item) => item?.id === filters?.projectStatus)

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
        label: 'פעילים בלבד',
        idIcon: 'done',
        color: 'success',
        clearAction: 'onlyActive',
      })
    }

    if (squadRoleItem) {
      next.push({
        id: 'squadRole',
        label: squadRoleItem.label,
        idIcon: squadRoleItem.idIcon || 'star',
        color: 'warning',
        clearAction: 'squadRole',
      })
    }

    if (projectStatusItem) {
      next.push({
        id: 'projectStatus',
        label: projectStatusItem.label,
        idIcon: projectStatusItem.idIcon || 'project',
        color: 'danger',
        clearAction: 'projectStatus',
      })
    }

    if (positionItem) {
      next.push({
        id: 'positionLayer',
        label: positionItem.label,
        idIcon: positionItem.id !== 'none' ? positionItem.id : 'layers',
        color: 'primary',
        clearAction: 'positionLayer',
      })
    }

    return next
  }, [summary, filters])

  const handleClearIndicator = (item) => {
    if (!item?.clearAction) return

    if (item.clearAction === 'search') {
      onChangeSearch('')
      return
    }

    if (item.clearAction === 'onlyActive') {
      onToggleOnlyActive()
      return
    }

    if (item.clearAction === 'squadRole') {
      onChangeSquadRole('')
      return
    }

    if (item.clearAction === 'projectStatus') {
      onChangeProjectStatus('')
      return
    }

    if (item.clearAction === 'positionLayer') {
      onChangePositionLayer('')
    }
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

          {!!summary?.active && (
            <Chip
              size="sm"
              variant="soft"
              color="success"
              startDecorator={iconUi({ id: 'active' })}
              sx={{ border: '1px solid', borderColor: 'divider' }}
            >
              {summary.active} פעילים
            </Chip>
          )}

          <Box sx={{ flex: 1 }} />

          <Button
            size="sm"
            variant="soft"
            color="neutral"
            onClick={() => setSortOpen(true)}
            endDecorator={iconUi({id: getSortDirectionIcon(sortDirection), sx: { fontSize: 15, color: '#1ED760' }, })}
            sx={sx.sortBut}
          >
            {getSortLabel(sortBy)}
          </Button>
        </Box>

        <Box sx={sx.toolbarRow}>
          <Chip
            size="sm"
            variant="soft"
            color="primary"
            startDecorator={iconUi({ id: 'players' })}
            sx={{ border: '1px solid', borderColor: 'divider' }}
          >
            {filteredCount} / {totalCount} שחקנים
          </Chip>

          {!!safeArray(indicators).length &&
            indicators.map((item) => (
              <ToolbarFilterChip
                key={item.id}
                item={item}
                onClear={handleClearIndicator}
              />
            ))}
        </Box>
      </Box>

      <MobileFiltersDrawerShell
        open={filtersOpen}
        entity="team"
        onClose={() => setFiltersOpen(false)}
        title="פילטרים לשחקנים"
        subtitle="סינון רשימת שחקני הקבוצה"
        resultsText={`${filteredCount} מתוך ${totalCount} שחקנים`}
        onReset={onResetFilters}
        resetDisabled={!hasActiveFilters}
      >
        <PlayersFiltersContent
          summary={summary}
          filters={filters}
          onChangeSearch={onChangeSearch}
          onToggleOnlyActive={onToggleOnlyActive}
          onChangeSquadRole={onChangeSquadRole}
          onChangeProjectStatus={onChangeProjectStatus}
          onChangePositionLayer={onChangePositionLayer}
        />
      </MobileFiltersDrawerShell>

      <SortDrawerMobile
        open={sortOpen}
        onClose={() => setSortOpen(false)}
        title="מיון שחקנים"
        sortBy={sortBy}
        sortDirection={sortDirection}
        sortOptions={TEAM_PLAYERS_SORT_OPTIONS}
        onChangeSortBy={onChangeSortBy}
        onChangeSortDirection={onChangeSortDirection}
      />
    </>
  )
}

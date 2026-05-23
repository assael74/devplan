// teamProfile/mobile/modules/players/components/toolbar/TeamPlayersToolbar.js

import React, { useMemo, useState } from 'react'
import { Box, Chip, Button } from '@mui/joy'

import {
  FiltersTrigger,
  MobileFiltersDrawerShell,
} from '../../../../../../../../ui/patterns/filters/index.js'

import { SortDrawerMobile } from '../../../../../../../../ui/patterns/sort/index.js'
import { iconUi } from '../../../../../../../../ui/core/icons/iconUi.js'

import {
  TEAM_PLAYERS_SORT_OPTIONS,
  getTeamPlayersSortLabel,
  getTeamPlayersSortDirectionIcon,
} from '../../../../../sharedLogic/players/index.js'

import PlayersFiltersContent from './PlayersFiltersContent.js'
import ToolbarFilterChip from './ToolbarFilterChip.js'

import { toolbarSx as sx } from '../../sx/toolbar.sx.js'

const safeArray = value => (Array.isArray(value) ? value : [])

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
  onChangePositionCode,
  onChangeGeneralPositionKey,
  onChangePerformanceProfile,
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
    !!filters?.positionCode ||
    !!filters?.generalPositionKey ||
    !!filters?.performanceProfile

  const indicators = useMemo(() => {
    const positionBuckets = safeArray(summary?.positionCodeBuckets)
    const generalPositionBuckets = safeArray(summary?.generalPositionBuckets)
    const squadRoleBuckets = safeArray(summary?.squadRoleBuckets)
    const projectStatusBuckets = safeArray(summary?.projectStatusBuckets)
    const performanceProfileBuckets = safeArray(summary?.performanceProfileBuckets)

    const positionItem = positionBuckets.find(item => item?.id === filters?.positionCode)
    const generalPositionItem = generalPositionBuckets.find(
      item => item?.id === filters?.generalPositionKey
    )
    const squadRoleItem = squadRoleBuckets.find(item => item?.id === filters?.squadRole)
    const projectStatusItem = projectStatusBuckets.find(item => item?.id === filters?.projectStatus)
    const performanceProfileItem = performanceProfileBuckets.find(
      item => item?.id === filters?.performanceProfile
    )

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

    if (performanceProfileItem) {
      next.push({
        id: 'performanceProfile',
        label: performanceProfileItem.label,
        idIcon: performanceProfileItem.idIcon || 'insights',
        color: performanceProfileItem.color || 'primary',
        clearAction: 'performanceProfile',
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
        id: 'positionCode',
        label: positionItem.label,
        idIcon: positionItem.idIcon || 'position',
        color: 'primary',
        clearAction: 'positionCode',
      })
    }

    if (generalPositionItem) {
      next.push({
        id: 'generalPositionKey',
        label: generalPositionItem.label,
        idIcon: generalPositionItem.idIcon || 'layers',
        color: 'primary',
        clearAction: 'generalPositionKey',
      })
    }

    return next
  }, [summary, filters])

  const handleClearIndicator = item => {
    if (!item?.clearAction) return

    if (item.clearAction === 'search') return onChangeSearch('')
    if (item.clearAction === 'onlyActive') return onToggleOnlyActive()
    if (item.clearAction === 'squadRole') return onChangeSquadRole('')
    if (item.clearAction === 'projectStatus') return onChangeProjectStatus('')
    if (item.clearAction === 'positionCode') return onChangePositionCode('')
    if (item.clearAction === 'generalPositionKey') return onChangeGeneralPositionKey('')
    if (item.clearAction === 'performanceProfile') return onChangePerformanceProfile('')
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
            endDecorator={iconUi({
              id: getTeamPlayersSortDirectionIcon(sortDirection),
              sx: { fontSize: 15, color: '#1ED760' },
            })}
            sx={sx.sortBut}
          >
            {getTeamPlayersSortLabel(sortBy)}
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
            indicators.map(item => (
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
          onChangePositionCode={onChangePositionCode}
          onChangeGeneralPositionKey={onChangeGeneralPositionKey}
          onChangePerformanceProfile={onChangePerformanceProfile}
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

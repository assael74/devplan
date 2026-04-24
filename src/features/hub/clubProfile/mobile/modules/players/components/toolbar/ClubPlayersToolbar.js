// clubProfile/mobile/modules/players/components/toolbar/ClubPlayersToolbar.js

import React, { useMemo, useState } from 'react'
import { Box, Button, Chip } from '@mui/joy'

import {
  FiltersTrigger,
  MobileFiltersDrawerShell,
} from '../../../../../../../../ui/patterns/filters/index.js'
import { SortDrawerMobile } from '../../../../../../../../ui/patterns/sort/index.js'

import { iconUi } from '../../../../../../../../ui/core/icons/iconUi.js'

import PlayersFiltersContent from './PlayersFiltersContent.js'
import ToolbarFilterChip from './ToolbarFilterChip.js'

import { toolbarSx as sx } from '../../sx/toolbar.sx.js'

import {
  CLUB_PLAYERS_SORT_OPTIONS,
  getClubPlayersSortLabel,
  getClubPlayersSortDirectionIcon,
} from '../../../../../sharedLogic/players/index.js'

const safeArray = (value) => (Array.isArray(value) ? value : [])

export default function ClubPlayersToolbar({
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
  onChangeTeamId,
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
    !!filters?.teamId

  const indicators = useMemo(() => {
    const teamBuckets = Array.isArray(summary?.teamBuckets) ? summary.teamBuckets : []
    const squadRoleBuckets = Array.isArray(summary?.squadRoleBuckets) ? summary.squadRoleBuckets : []
    const projectStatusBuckets = Array.isArray(summary?.projectStatusBuckets) ? summary.projectStatusBuckets : []
    const positionCodeBuckets = Array.isArray(summary?.positionCodeBuckets) ? summary.positionCodeBuckets : []
    const generalPositionBuckets = Array.isArray(summary?.generalPositionBuckets) ? summary.generalPositionBuckets : []

    const teamItem = teamBuckets.find((item) => item?.id === filters?.teamId)
    const squadRoleItem = squadRoleBuckets.find((item) => item?.id === filters?.squadRole)
    const projectStatusItem = projectStatusBuckets.find((item) => item?.id === filters?.projectStatus)
    const positionCodeItem = positionCodeBuckets.find((item) => item?.id === filters?.positionCode)
    const generalPositionItem = generalPositionBuckets.find((item) => item?.id === filters?.generalPositionKey)

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
        idIcon: 'active',
        color: 'success',
        clearAction: 'onlyActive',
      })
    }

    if (teamItem) {
      next.push({
        id: 'teamId',
        label: teamItem.label,
        idIcon: 'teams',
        color: 'primary',
        clearAction: 'teamId',
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

    if (positionCodeItem) {
      next.push({
        id: 'positionCode',
        label: positionCodeItem.label,
        idIcon: positionCodeItem.idIcon || 'position',
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

  const handleClearIndicator = (item) => {
    if (item?.clearAction === 'search') onChangeSearch('')
    if (item?.clearAction === 'onlyActive') onToggleOnlyActive()
    if (item?.clearAction === 'teamId') onChangeTeamId('')
    if (item?.clearAction === 'squadRole') onChangeSquadRole('')
    if (item?.clearAction === 'projectStatus') onChangeProjectStatus('')
    if (item?.clearAction === 'positionCode') onChangePositionCode('')
    if (item?.clearAction === 'generalPositionKey') onChangeGeneralPositionKey('')
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

          {!!summary?.project && (
            <Chip
              size="sm"
              variant="soft"
              color="warning"
              startDecorator={iconUi({ id: 'project' })}
              sx={{ border: '1px solid', borderColor: 'divider' }}
            >
              {summary.project} פרויקט
            </Chip>
          )}

          <Box sx={{ flex: 1 }} />

          <Button
            size="sm"
            variant="soft"
            color="neutral"
            onClick={() => setSortOpen(true)}
            endDecorator={iconUi({
              id: getClubPlayersSortDirectionIcon(sortDirection),
              sx: { fontSize: 15, color: '#1ED760' },
            })}
            sx={sx.sortBut}
          >
            {getClubPlayersSortLabel(sortBy)}
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
        entity="club"
        onClose={() => setFiltersOpen(false)}
        title="פילטרים לשחקנים"
        subtitle="סינון שחקני המועדון"
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
          onChangeTeamId={onChangeTeamId}
        />
      </MobileFiltersDrawerShell>

      <SortDrawerMobile
        open={sortOpen}
        onClose={() => setSortOpen(false)}
        title="מיון שחקנים"
        sortBy={sortBy}
        sortDirection={sortDirection}
        sortOptions={CLUB_PLAYERS_SORT_OPTIONS}
        onChangeSortBy={onChangeSortBy}
        onChangeSortDirection={onChangeSortDirection}
      />
    </>
  )
}

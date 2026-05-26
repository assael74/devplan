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

const safeArray = value => {
  return Array.isArray(value) ? value : []
}

const getBucketItem = ({ buckets, value }) => {
  return safeArray(buckets).find(item => {
    return (item.value ?? item.id) === value
  })
}

const getEfficiencyIndicator = ({ filters, summary }) => {
  const item = getBucketItem({
    buckets: summary?.efficiencyBuckets,
    value: filters?.efficiency,
  })

  if (!filters?.efficiency) return null

  return {
    id: 'efficiency',
    label: item?.selectedLabel || item?.label || 'מדד יעילות',
    idIcon: item?.idIcon || 'scoringRating',
    color: item?.color || 'neutral',
    clearAction: 'efficiency',
  }
}

const getImpactIndicator = ({ filters, summary }) => {
  const item = getBucketItem({
    buckets: summary?.impactBuckets,
    value: filters?.impact,
  })

  if (!filters?.impact) return null

  return {
    id: 'impact',
    label: item?.selectedLabel || item?.label || 'מדד השפעה',
    idIcon: item?.idIcon || 'scoringImpact',
    color: item?.color || 'neutral',
    clearAction: 'impact',
  }
}

const getProfileInsightIndicator = ({ filters, summary }) => {
  const item = getBucketItem({
    buckets: summary?.profileInsightBuckets,
    value: filters?.profileInsight,
  })

  if (!filters?.profileInsight) return null

  return {
    id: 'profileInsight',
    label: item?.selectedLabel || item?.label || 'פרופיל תובנות',
    idIcon: item?.idIcon || 'insights',
    color: item?.color || 'neutral',
    clearAction: 'profileInsight',
  }
}

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
  onChangeEfficiencyFilter,
  onChangeImpactFilter,
  onChangeProfileInsightFilter,
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
    !!filters?.efficiency ||
    !!filters?.impact ||
    !!filters?.profileInsight ||
    !!filters?.teamId

  const indicators = useMemo(() => {
    const teamBuckets = safeArray(summary?.teamBuckets)
    const squadRoleBuckets = safeArray(summary?.squadRoleBuckets)
    const projectStatusBuckets = safeArray(summary?.projectStatusBuckets)
    const positionCodeBuckets = safeArray(summary?.positionCodeBuckets)
    const generalPositionBuckets = safeArray(summary?.generalPositionBuckets)

    const teamItem = teamBuckets.find(item => item?.id === filters?.teamId)
    const squadRoleItem = squadRoleBuckets.find(item => item?.id === filters?.squadRole)
    const projectStatusItem = projectStatusBuckets.find(item => item?.id === filters?.projectStatus)
    const positionCodeItem = positionCodeBuckets.find(item => item?.id === filters?.positionCode)
    const generalPositionItem = generalPositionBuckets.find(item => item?.id === filters?.generalPositionKey)

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

    const efficiencyIndicator = getEfficiencyIndicator({
      filters,
      summary,
    })

    if (efficiencyIndicator) {
      next.push(efficiencyIndicator)
    }

    const impactIndicator = getImpactIndicator({
      filters,
      summary,
    })

    if (impactIndicator) {
      next.push(impactIndicator)
    }

    const profileInsightIndicator = getProfileInsightIndicator({
      filters,
      summary,
    })

    if (profileInsightIndicator) {
      next.push(profileInsightIndicator)
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

  const handleClearIndicator = item => {
    if (item?.clearAction === 'search') onChangeSearch('')
    if (item?.clearAction === 'onlyActive') onToggleOnlyActive()
    if (item?.clearAction === 'teamId') onChangeTeamId('')
    if (item?.clearAction === 'squadRole') onChangeSquadRole('')
    if (item?.clearAction === 'projectStatus') onChangeProjectStatus('')
    if (item?.clearAction === 'positionCode') onChangePositionCode('')
    if (item?.clearAction === 'generalPositionKey') onChangeGeneralPositionKey('')
    if (item?.clearAction === 'efficiency') onChangeEfficiencyFilter('')
    if (item?.clearAction === 'impact') onChangeImpactFilter('')
    if (item?.clearAction === 'profileInsight') onChangeProfileInsightFilter('')
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
        entity="club"
        size="lg"
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
          onChangeEfficiencyFilter={onChangeEfficiencyFilter}
          onChangeImpactFilter={onChangeImpactFilter}
          onChangeProfileInsightFilter={onChangeProfileInsightFilter}
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

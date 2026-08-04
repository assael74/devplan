import React from 'react'
import {
  Box,
  Chip,
  Input,
  ListItemDecorator,
  Option,
  Select,
  Typography,
} from '@mui/joy'

import { iconUi } from '../../../../../../../../ui/core/icons/iconUi.js'
import { toolbarSx as sx } from '../../sx/toolbar.sx.js'

import ClubPlayersBottomBar from './ClubPlayersBottomBar.js'

const EFFICIENCY_FILTER_OPTIONS = [
  { id: '', value: '', label: 'כל מדדי היעילות', selectedLabel: 'כל המדדים', idIcon: 'scoringRating', color: 'neutral' },
  { id: 'above6', value: 'above6', label: 'יעילות חיובית', selectedLabel: 'חיובית', idIcon: 'scoringRating', color: 'success' },
  { id: 'below6', value: 'below6', label: 'יעילות שלילית', selectedLabel: 'שלילית', idIcon: 'scoringRating', color: 'warning' },
]

const IMPACT_FILTER_OPTIONS = [
  { id: '', value: '', label: 'כל מדדי ההשפעה', selectedLabel: 'כל המדדים', idIcon: 'scoringImpact', color: 'neutral' },
  { id: 'positive', value: 'positive', label: 'השפעה חיובית', selectedLabel: 'חיובית', idIcon: 'scoringImpact', color: 'success' },
  { id: 'negative', value: 'negative', label: 'השפעה שלילית', selectedLabel: 'שלילית', idIcon: 'scoringImpact', color: 'danger' },
]

const PROFILE_INSIGHT_FILTER_OPTIONS = [
  { id: '', value: '', label: 'כל פרופילי התובנות', selectedLabel: 'כל הפרופילים', idIcon: 'insights', color: 'neutral' },
]

const selectWidth = {
  search: 300,
  teamId: 190,
  squadRole: 180,
  projectStatus: 180,
  positionCode: 180,
  impact: 180,
  efficiency: 180,
  generalPositionKey: 180,
  profileInsight: 190,
}

const toSafeText = value => {
  return value == null ? '' : String(value)
}

const getOptionValue = item => {
  if (!item) return ''
  return toSafeText(item.value ?? item.id)
}

const getBuckets = ({ source, fallback }) => {
  return Array.isArray(source) && source.length ? source : fallback
}

const renderSelectValue = (selected, items, fallbackLabel, fallbackIcon) => {
  const value = selected?.value || ''

  const item = items.find(option => {
    return getOptionValue(option) === value
  })
  const color = item?.color || 'neutral'

  if (!item) {
    return (
      <>
        <ListItemDecorator sx={{ mr: 0.75, pt: 0.3 }}>
          {iconUi({ id: fallbackIcon })}
        </ListItemDecorator>

        <Typography level="body-sm">
          {fallbackLabel}
        </Typography>
      </>
    )
  }

  const label = item.selectedLabel || item.label
  const showCount = item.count != null

  return (
    <>
      <ListItemDecorator sx={{ mr: 0.75, pt: 0.3 }}>
        {iconUi({ id: item.idIcon || fallbackIcon })}
      </ListItemDecorator>

      <Typography level="body-sm" color={color}>
        {label}
        {showCount ? ` (${item.count || 0})` : ''}
      </Typography>
    </>
  )
}

function BucketOption({ item, fallbackIcon }) {
  const color = item?.color || 'neutral'
  return (
    <Option key={item.id || item.value || 'all'} value={getOptionValue(item)} color={color}>
      <ListItemDecorator>
        {iconUi({ id: item.idIcon || fallbackIcon })}
      </ListItemDecorator>

      {item.label}
      {item.count != null ? ` (${item.count || 0})` : ''}
    </Option>
  )
}

function FilterSelect({
  value,
  onChange,
  placeholder,
  width,
  items,
  fallbackIcon,
  children,
}) {
  return (
    <Select
      size="sm"
      value={value || ''}
      onChange={(_, nextValue) => onChange(nextValue || '')}
      placeholder={placeholder}
      sx={sx.select(width)}
      renderValue={(selected) =>
        renderSelectValue(
          selected,
          items,
          placeholder,
          fallbackIcon
        )
      }
    >
      {children || (
        <>
          <Option value="">{placeholder}</Option>
          {items.map(item => (
            <BucketOption key={item.id || item.value} item={item} fallbackIcon={fallbackIcon} />
          ))}
        </>
      )}
    </Select>
  )
}

export default function ClubPlayersToolbar({
  summary,
  filters,
  filteredCount = 0,
  totalCount = 0,
  sortBy = 'level',
  sortDirection = 'desc',
  onChangeSearch,
  onToggleOnlyActive,
  onChangeSquadRole,
  onChangeProjectStatus,
  onChangePositionCode,
  onChangeEfficiencyFilter,
  onChangeImpactFilter,
  onChangeProfileInsightFilter,
  onChangeGeneralPositionKey,
  onChangeTeamId,
  onChangeSortBy,
  onChangeSortDirection,
  onResetFilters,
}) {
  const teamBuckets = Array.isArray(summary?.teamBuckets) ? summary.teamBuckets : []
  const squadRoleBuckets = Array.isArray(summary?.squadRoleBuckets) ? summary.squadRoleBuckets : []
  const projectStatusBuckets = Array.isArray(summary?.projectStatusBuckets) ? summary.projectStatusBuckets : []
  const positionCodeBuckets = Array.isArray(summary?.positionCodeBuckets) ? summary.positionCodeBuckets : []
  const generalPositionBuckets = Array.isArray(summary?.generalPositionBuckets) ? summary.generalPositionBuckets : []

  const efficiencyBuckets = getBuckets({
    source: summary?.efficiencyBuckets,
    fallback: EFFICIENCY_FILTER_OPTIONS,
  })

  const impactBuckets = getBuckets({
    source: summary?.impactBuckets,
    fallback: IMPACT_FILTER_OPTIONS,
  })

  const profileInsightBuckets = getBuckets({
    source: summary?.profileInsightBuckets,
    fallback: PROFILE_INSIGHT_FILTER_OPTIONS,
  })

  const totalPlayers = summary?.total

  const hasActiveFilters =
    !!filters?.search ||
    !!filters?.onlyActive ||
    !!filters?.teamId ||
    !!filters?.squadRole ||
    !!filters?.projectStatus ||
    !!filters?.positionCode ||
    !!filters?.impact ||
    !!filters?.efficiency ||
    !!filters?.profileInsight ||
    !!filters?.generalPositionKey

  const hasSortChanged = sortBy !== 'level' || sortDirection !== 'desc'
  const canReset = hasActiveFilters || hasSortChanged

  return (
    <Box sx={sx.toolbar}>
      <Box sx={sx.primaryRow}>
        <Input
          value={filters?.search || ''}
          onChange={(e) => onChangeSearch(e.target.value)}
          startDecorator={iconUi({ id: 'search' })}
          placeholder="חיפוש שחקן לפי שם, שנתון או עמדה"
          size="sm"
          sx={sx.searchInput(selectWidth.search)}
        />

        <FilterSelect
          value={filters?.teamId || ''}
          onChange={onChangeTeamId}
          placeholder="כל הקבוצות"
          width={selectWidth.teamId}
          items={teamBuckets}
          fallbackIcon="teams"
        />

        <FilterSelect
          value={filters?.positionCode || ''}
          onChange={onChangePositionCode}
          placeholder="כל העמדות"
          width={selectWidth.positionCode}
          items={positionCodeBuckets}
          fallbackIcon="position"
        />

        <FilterSelect
          value={filters?.squadRole || ''}
          onChange={onChangeSquadRole}
          placeholder="כל המעמדות"
          width={selectWidth.squadRole}
          items={squadRoleBuckets}
          fallbackIcon="star"
        />

        <Chip
          size="sm"
          variant={filters?.onlyActive ? 'solid' : 'soft'}
          color={filters?.onlyActive ? 'success' : 'neutral'}
          onClick={onToggleOnlyActive}
          startDecorator={iconUi({ id: 'active' })}
          sx={sx.filterChip}
        >
          פעילים
        </Chip>

        <Box sx={{ flex: 1, minWidth: 8 }} />

        <Chip
          size="sm"
          variant="soft"
          color="neutral"
          disabled={!canReset}
          onClick={onResetFilters}
          sx={sx.resetBut}
          startDecorator={iconUi({ id: 'reset' })}
        >
          איפוס
        </Chip>
      </Box>

      <Box sx={sx.advancedBlock}>
        <Typography level="body-xs" sx={sx.advancedLabel}>
          פילטרים מתקדמים
        </Typography>

        <Box sx={sx.advancedRow}>
          <FilterSelect
            value={filters?.generalPositionKey || ''}
            onChange={onChangeGeneralPositionKey}
            placeholder="כל קבוצות העמדה"
            width={selectWidth.generalPositionKey}
            items={generalPositionBuckets}
            fallbackIcon="layers"
          />

          <FilterSelect
            value={filters?.efficiency || ''}
            onChange={onChangeEfficiencyFilter}
            placeholder="כל מדדי היעילות"
            width={selectWidth.efficiency}
            items={efficiencyBuckets}
            fallbackIcon="scoringRating"
          />

          <FilterSelect
            value={filters?.impact || ''}
            onChange={onChangeImpactFilter}
            placeholder="כל מדדי ההשפעה"
            width={selectWidth.impact}
            items={impactBuckets}
            fallbackIcon="scoringImpact"
          />

          <FilterSelect
            value={filters?.profileInsight || ''}
            onChange={onChangeProfileInsightFilter}
            placeholder="כל פרופילי התובנות"
            width={selectWidth.profileInsight}
            items={profileInsightBuckets}
            fallbackIcon="insights"
          />

          <FilterSelect
            value={filters?.projectStatus || ''}
            onChange={onChangeProjectStatus}
            placeholder="כל סטטוסי הפרויקט"
            width={selectWidth.projectStatus}
            items={projectStatusBuckets}
            fallbackIcon="project"
          />
        </Box>
      </Box>

      <ClubPlayersBottomBar
        summary={summary}
        totalPlayers={totalPlayers}
        filteredPlayers={filteredCount}
        sortBy={sortBy}
        sortDirection={sortDirection}
        onChangeSortBy={onChangeSortBy}
        onChangeSortDirection={onChangeSortDirection}
      />
    </Box>
  )
}

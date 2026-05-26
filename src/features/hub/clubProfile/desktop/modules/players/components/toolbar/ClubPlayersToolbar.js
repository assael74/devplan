import React from 'react'
import {
  Box,
  Input,
  Option,
  Select,
  Chip,
  ListItemDecorator,
  Typography,
} from '@mui/joy'

import { iconUi } from '../../../../../../../../ui/core/icons/iconUi.js'
import { toolbarSx as sx } from '../../sx/toolbar.sx.js'

import ClubPlayersBottomBar from './ClubPlayersBottomBar.js'

const EFFICIENCY_FILTER_OPTIONS = [
  {
    id: '',
    value: '',
    label: 'כל מדדי היעילות',
    selectedLabel: 'כל המדדים',
    idIcon: 'scoringRating',
    color: 'neutral',
  },
  {
    id: 'above6',
    value: 'above6',
    label: 'יעילות חיובית',
    selectedLabel: 'חיובית',
    idIcon: 'scoringRating',
    color: 'success',
  },
  {
    id: 'below6',
    value: 'below6',
    label: 'יעילות שלילית',
    selectedLabel: 'שלילית',
    idIcon: 'scoringRating',
    color: 'warning',
  },
]

const IMPACT_FILTER_OPTIONS = [
  {
    id: '',
    value: '',
    label: 'כל מדדי ההשפעה',
    selectedLabel: 'כל המדדים',
    idIcon: 'scoringImpact',
    color: 'neutral',
  },
  {
    id: 'positive',
    value: 'positive',
    label: 'השפעה חיובית',
    selectedLabel: 'חיובית',
    idIcon: 'scoringImpact',
    color: 'success',
  },
  {
    id: 'negative',
    value: 'negative',
    label: 'השפעה שלילית',
    selectedLabel: 'שלילית',
    idIcon: 'scoringImpact',
    color: 'danger',
  },
]

const PROFILE_INSIGHT_FILTER_OPTIONS = [
  {
    id: '',
    value: '',
    label: 'כל פרופילי התובנות',
    selectedLabel: 'כל הפרופילים',
    idIcon: 'insights',
    color: 'neutral',
  },
]

const selectWidth = {
  search: 300,
  squadRole: 220,
  projectStatus: 200,
  positionCode: 200,
  impact: 200,
  efficiency: 200,
  generalPositionKey: 200,
  profileInsight: 200,
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
        {iconUi({ id: item.idIcon || fallbackIcon, })}
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
  onChangeSortBy,
  onChangeSortDirection,
  onResetFilters,
}) {
  const squadRoleBuckets = Array.isArray(summary?.squadRoleBuckets)
    ? summary.squadRoleBuckets
    : []

  const projectStatusBuckets = Array.isArray(summary?.projectStatusBuckets)
    ? summary.projectStatusBuckets
    : []

  const positionCodeBuckets = Array.isArray(summary?.positionCodeBuckets)
    ? summary.positionCodeBuckets
    : []

  const generalPositionBuckets = Array.isArray(summary?.generalPositionBuckets)
    ? summary.generalPositionBuckets
    : []

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
      <Box sx={sx.toolbarRow}>
        <Input
          value={filters?.search || ''}
          onChange={(e) => onChangeSearch(e.target.value)}
          startDecorator={iconUi({ id: 'search' })}
          placeholder="חיפוש שחקן לפי שם / שנתון / עמדה"
          size="sm"
          sx={{
            width: selectWidth.search,
            maxWidth: '100%',
            flexShrink: 0,
          }}
        />

        <Select
          size="sm"
          value={filters?.squadRole || ''}
          onChange={(_, value) => onChangeSquadRole(value || '')}
          placeholder="כל המעמדות"
          sx={sx.select(selectWidth.squadRole)}
          renderValue={(selected) =>
            renderSelectValue(
              selected,
              squadRoleBuckets,
              'כל המעמדות',
              'star'
            )
          }
        >
          <Option value="">כל המעמדות</Option>

          {squadRoleBuckets.map(item => (
            <BucketOption key={item.id} item={item} fallbackIcon="star" />
          ))}
        </Select>

        <Select
          size="sm"
          value={filters?.positionCode || ''}
          onChange={(_, value) => onChangePositionCode(value || '')}
          placeholder="כל העמדות"
          sx={sx.select(selectWidth.positionCode)}
          renderValue={(selected) =>
            renderSelectValue(
              selected,
              positionCodeBuckets,
              'כל העמדות',
              'position'
            )
          }
        >
          <Option value="">כל העמדות</Option>

          {positionCodeBuckets.map(item => (
            <BucketOption key={item.id} item={item} fallbackIcon="position" />
          ))}
        </Select>

        <Select
          size="sm"
          value={filters?.generalPositionKey || ''}
          onChange={(_, value) => onChangeGeneralPositionKey(value || '')}
          placeholder="כל העמדות הכלליות"
          sx={sx.select(selectWidth.generalPositionKey)}
          renderValue={(selected) =>
            renderSelectValue(
              selected,
              generalPositionBuckets,
              'כל העמדות הכלליות',
              'layers'
            )
          }
        >
          <Option value="">כל העמדות הכלליות</Option>

          {generalPositionBuckets.map(item => (
            <BucketOption key={item.id} item={item} fallbackIcon="layers" />
          ))}
        </Select>

        <Chip
          size="sm"
          variant={filters?.onlyActive ? 'solid' : 'soft'}
          color={filters?.onlyActive ? 'success' : 'neutral'}
          onClick={onToggleOnlyActive}
          startDecorator={iconUi({ id: 'active' })}
          sx={{
            cursor: 'pointer',
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          פעילים ({summary?.active ?? 0})
        </Chip>

        <Box sx={{ flex: 1 }} />

        <Chip
          size="md"
          variant="soft"
          color="danger"
          disabled={!canReset}
          onClick={onResetFilters}
          sx={sx.resetBut}
          startDecorator={iconUi({
            id: 'reset',
            sx: { color: !canReset ? '#f52516' : '' },
          })}
        >
          איפוס
        </Chip>
      </Box>

      <Box sx={sx.toolbarRow}>
        <Select
          size="sm"
          value={filters?.efficiency || ''}
          onChange={(_, value) => onChangeEfficiencyFilter(value || '')}
          placeholder="כל מדדי היעילות"
          sx={sx.select(selectWidth.efficiency)}
          renderValue={(selected) =>
            renderSelectValue(
              selected,
              efficiencyBuckets,
              'כל מדדי היעילות',
              'scoringRating'
            )
          }
        >
          {efficiencyBuckets.map(item => (
            <BucketOption
              key={item.id || item.value || 'all'}
              item={item}
              fallbackIcon="scoringRating"
            />
          ))}
        </Select>

        <Select
          size="sm"
          value={filters?.impact || ''}
          onChange={(_, value) => onChangeImpactFilter(value || '')}
          placeholder="כל מדדי ההשפעה"
          sx={sx.select(selectWidth.impact)}
          renderValue={(selected) =>
            renderSelectValue(
              selected,
              impactBuckets,
              'כל מדדי ההשפעה',
              'scoringImpact'
            )
          }
        >
          {impactBuckets.map(item => (
            <BucketOption
              key={item.id || item.value || 'all'}
              item={item}
              fallbackIcon="scoringImpact"
            />
          ))}
        </Select>

        <Select
          size="sm"
          value={filters?.profileInsight || ''}
          onChange={(_, value) => onChangeProfileInsightFilter(value || '')}
          placeholder="כל פרופילי התובנות"
          sx={sx.select(selectWidth.profileInsight)}
          renderValue={(selected) =>
            renderSelectValue(
              selected,
              profileInsightBuckets,
              'כל פרופילי התובנות',
              'insights'
            )
          }
        >
          <Option value="">כל פרופילי התובנות</Option>

          {profileInsightBuckets.map(item => (
            <BucketOption
              key={item.id || item.value}
              item={item}
              fallbackIcon="insights"
            />
          ))}
        </Select>

        <Select
          size="sm"
          value={filters?.projectStatus || ''}
          onChange={(_, value) => onChangeProjectStatus(value || '')}
          placeholder="כל סטטוסי הפרויקט"
          sx={sx.select(selectWidth.projectStatus)}
          renderValue={(selected) =>
            renderSelectValue(
              selected,
              projectStatusBuckets,
              'כל סטטוסי הפרויקט',
              'project'
            )
          }
        >
          <Option value="">כל סטטוסי הפרויקט</Option>

          {projectStatusBuckets.map(item => (
            <BucketOption key={item.id} item={item} fallbackIcon="project" />
          ))}
        </Select>
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

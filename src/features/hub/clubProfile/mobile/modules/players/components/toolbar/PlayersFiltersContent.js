import React from 'react'
import {
  Box,
  Chip,
  FormControl,
  FormLabel,
  Input,
  ListItemDecorator,
  Option,
  Select,
  Typography,
} from '@mui/joy'

import { iconUi } from '../../../../../../../../ui/core/icons/iconUi.js'
import { getEntityColors } from '../../../../../../../../ui/core/theme/Colors.js'

import { toolbarSx as sx } from '../../sx/toolbar.sx.js'
import SelectValue from './SelectValue.js'

const c = getEntityColors('players')

const EFFICIENCY_FILTER_OPTIONS = [
  {
    value: '',
    label: 'כל מדדי היעילות',
    selectedLabel: 'כל המדדים',
    icon: 'scoringRating',
    color: 'neutral',
  },
  {
    value: 'above6',
    label: 'יעילות חיובית',
    selectedLabel: 'מדד חיובי',
    icon: 'scoringRating',
    color: 'success',
  },
  {
    value: 'below6',
    label: 'יעילות שלילית',
    selectedLabel: 'מדד שלילי',
    icon: 'scoringRating',
    color: 'warning',
  },
]

const IMPACT_FILTER_OPTIONS = [
  {
    value: '',
    label: 'כל מדדי ההשפעה',
    selectedLabel: 'כל המדדים',
    icon: 'scoringImpact',
    color: 'neutral',
  },
  {
    value: 'positive',
    label: 'השפעה חיובית',
    selectedLabel: 'מדד חיובי',
    icon: 'scoringImpact',
    color: 'success',
  },
  {
    value: 'negative',
    label: 'השפעה שלילית',
    selectedLabel: 'מדד שלילי',
    icon: 'scoringImpact',
    color: 'danger',
  },
]

const PROFILE_INSIGHT_FILTER_OPTIONS = [
  {
    value: '',
    label: 'כל פרופילי התובנות',
    selectedLabel: 'כל הפרופילים',
    icon: 'insights',
    color: 'neutral',
  },
]

const safeBuckets = ({ source, fallback }) => {
  return Array.isArray(source) && source.length ? source : fallback
}

const getOptionValue = item => {
  return item?.value ?? item?.id ?? ''
}

const getOptionIcon = item => {
  return item?.icon || item?.idIcon || 'noneType'
}

const findSelected = ({ buckets, value }) => {
  return buckets.find(item => {
    return getOptionValue(item) === (value || '')
  })
}

function FilterOption({ item, fallbackIcon = 'noneType' }) {
  return (
    <Option key={getOptionValue(item) || 'all'} value={getOptionValue(item)}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
        <ListItemDecorator>
          {iconUi({
            id: getOptionIcon(item) || fallbackIcon,
            sx: { color: item?.color },
          })}
        </ListItemDecorator>

        <Typography level="body-sm" noWrap sx={{ minWidth: 0, flex: 1 }}>
          {item.label}
        </Typography>

        {item.count != null ? (
          <Chip size="sm" variant="soft" color={item.color || 'neutral'}>
            {item.count || 0}
          </Chip>
        ) : null}
      </Box>
    </Option>
  )
}

export default function PlayersFiltersContent({
  summary,
  filters,
  onChangeTeamId,
  onChangeSearch,
  onToggleOnlyActive,
  onChangeSquadRole,
  onChangeProjectStatus,
  onChangePositionCode,
  onChangeGeneralPositionKey,
  onChangeEfficiencyFilter,
  onChangeImpactFilter,
  onChangeProfileInsightFilter,
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

  const teamBuckets = Array.isArray(summary?.teamBuckets)
    ? summary.teamBuckets
    : []

  const efficiencyBuckets = safeBuckets({
    source: summary?.efficiencyBuckets,
    fallback: EFFICIENCY_FILTER_OPTIONS,
  })

  const impactBuckets = safeBuckets({
    source: summary?.impactBuckets,
    fallback: IMPACT_FILTER_OPTIONS,
  })

  const profileInsightBuckets = safeBuckets({
    source: summary?.profileInsightBuckets,
    fallback: PROFILE_INSIGHT_FILTER_OPTIONS,
  })

  const selectedTeam = teamBuckets.find(item => item?.id === filters?.teamId)
  const selectedSquadRole = squadRoleBuckets.find(item => item?.id === filters?.squadRole)
  const selectedProjectStatus = projectStatusBuckets.find(item => item?.id === filters?.projectStatus)
  const selectedPositionCode = positionCodeBuckets.find(item => item?.id === filters?.positionCode)

  const selectedGeneralPosition = generalPositionBuckets.find(item => {
    return item?.id === filters?.generalPositionKey
  })

  const selectedEfficiency = findSelected({
    buckets: efficiencyBuckets,
    value: filters?.efficiency,
  })

  const selectedImpact = findSelected({
    buckets: impactBuckets,
    value: filters?.impact,
  })

  const selectedProfileInsight = findSelected({
    buckets: profileInsightBuckets,
    value: filters?.profileInsight,
  })

  return (
    <Box sx={{ display: 'grid', gap: 1, p: 0 }}>
      <Box sx={{ minWidth: 0, px: 2 }}>
        <FormControl>
          <FormLabel>חיפוש</FormLabel>
          <Input
            value={filters?.search || ''}
            onChange={(e) => onChangeSearch(e.target.value)}
            startDecorator={iconUi({ id: 'search' })}
            placeholder="חיפוש לפי שם / שנתון / עמדה"
            size="sm"
            sx={{ width: '100%', minWidth: 0 }}
          />
        </FormControl>
      </Box>

      <Box sx={sx.grid2}>
        <Box sx={{ minWidth: 0 }}>
          <FormControl>
            <FormLabel>מעמד</FormLabel>
            <Select
              size="sm"
              value={filters?.squadRole || ''}
              onChange={(_, value) => onChangeSquadRole(value || '')}
              sx={{ minWidth: 0, width: '100%', bgcolor: 'background.surface' }}
              slotProps={{ listbox: { sx: { '--ListItemDecorator-size': '28px' } } }}
              renderValue={() => (
                <SelectValue
                  label={selectedSquadRole?.label || 'כל המעמדות'}
                  icon={selectedSquadRole?.idIcon || 'star'}
                  count={selectedSquadRole?.count ?? summary?.total ?? 0}
                />
              )}
            >
              <Option value="">
                <SelectValue
                  label="כל המעמדות"
                  icon="star"
                  count={summary?.total ?? 0}
                />
              </Option>

              {squadRoleBuckets.map(item => (
                <FilterOption key={item.id} item={item} fallbackIcon="star" />
              ))}
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ minWidth: 0 }}>
          <FormControl>
            <FormLabel>סטטוס פרויקט</FormLabel>
            <Select
              size="sm"
              value={filters?.projectStatus || ''}
              onChange={(_, value) => onChangeProjectStatus(value || '')}
              sx={{ minWidth: 0, width: '100%', bgcolor: 'background.surface' }}
              slotProps={{ listbox: { sx: { '--ListItemDecorator-size': '28px' } } }}
              renderValue={() => (
                <SelectValue
                  label={selectedProjectStatus?.label || 'כל הסטטוסים'}
                  icon={selectedProjectStatus?.idIcon || 'project'}
                  count={selectedProjectStatus?.count ?? summary?.total ?? 0}
                />
              )}
            >
              <Option value="">
                <SelectValue
                  label="כל הסטטוסים"
                  icon="project"
                  count={summary?.total ?? 0}
                />
              </Option>

              {projectStatusBuckets.map(item => (
                <FilterOption key={item.id} item={item} fallbackIcon="project" />
              ))}
            </Select>
          </FormControl>
        </Box>
      </Box>

      <Box sx={sx.grid2}>
        <Box sx={{ minWidth: 0 }}>
          <FormControl>
            <FormLabel>עמדה</FormLabel>
            <Select
              size="sm"
              value={filters?.positionCode || ''}
              onChange={(_, value) => onChangePositionCode(value || '')}
              sx={{ minWidth: 0, width: '100%', bgcolor: 'background.surface' }}
              slotProps={{ listbox: { sx: { '--ListItemDecorator-size': '28px' } } }}
              renderValue={() => (
                <SelectValue
                  label={selectedPositionCode?.label || 'כל העמדות'}
                  icon={selectedPositionCode?.idIcon || 'position'}
                  count={selectedPositionCode?.count ?? summary?.total ?? 0}
                />
              )}
            >
              <Option value="">
                <SelectValue
                  label="כל העמדות"
                  icon="position"
                  count={summary?.total ?? 0}
                />
              </Option>

              {positionCodeBuckets.map(item => (
                <FilterOption key={item.id} item={item} fallbackIcon="position" />
              ))}
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ minWidth: 0 }}>
          <FormControl>
            <FormLabel>עמדה כללית</FormLabel>
            <Select
              size="sm"
              value={filters?.generalPositionKey || ''}
              onChange={(_, value) => onChangeGeneralPositionKey(value || '')}
              sx={{ minWidth: 0, width: '100%', bgcolor: 'background.surface' }}
              slotProps={{ listbox: { sx: { '--ListItemDecorator-size': '28px' } } }}
              renderValue={() => (
                <SelectValue
                  label={selectedGeneralPosition?.label || 'כל העמדות הכלליות'}
                  icon={selectedGeneralPosition?.idIcon || 'layers'}
                  count={selectedGeneralPosition?.count ?? summary?.total ?? 0}
                />
              )}
            >
              <Option value="">
                <SelectValue
                  label="כל העמדות הכלליות"
                  icon="layers"
                  count={summary?.total ?? 0}
                />
              </Option>

              {generalPositionBuckets.map(item => (
                <FilterOption key={item.id} item={item} fallbackIcon="layers" />
              ))}
            </Select>
          </FormControl>
        </Box>
      </Box>

      <Box sx={sx.grid2}>
        <Box sx={{ minWidth: 0 }}>
          <FormControl>
            <FormLabel>מדד יעילות</FormLabel>
            <Select
              size="sm"
              value={filters?.efficiency || ''}
              onChange={(_, value) => onChangeEfficiencyFilter(value || '')}
              sx={{ minWidth: 0, width: '100%', bgcolor: 'background.surface' }}
              slotProps={{ listbox: { sx: { '--ListItemDecorator-size': '28px' } } }}
              renderValue={() => (
                <SelectValue
                  label={selectedEfficiency?.selectedLabel || selectedEfficiency?.label || 'כל מדדי היעילות'}
                  icon={getOptionIcon(selectedEfficiency) || 'scoringRating'}
                  count={selectedEfficiency?.count ?? summary?.total ?? 0}
                  color={selectedEfficiency?.color || 'neutral'}
                />
              )}
            >
              {efficiencyBuckets.map(item => (
                <FilterOption
                  key={item.value || item.id || 'all'}
                  item={item}
                  fallbackIcon="scoringRating"
                />
              ))}
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ minWidth: 0 }}>
          <FormControl>
            <FormLabel>מדד השפעה</FormLabel>
            <Select
              size="sm"
              value={filters?.impact || ''}
              onChange={(_, value) => onChangeImpactFilter(value || '')}
              sx={{ minWidth: 0, width: '100%', bgcolor: 'background.surface' }}
              slotProps={{ listbox: { sx: { '--ListItemDecorator-size': '28px' } } }}
              renderValue={() => (
                <SelectValue
                  label={selectedImpact?.selectedLabel || selectedImpact?.label || 'כל מדדי ההשפעה'}
                  icon={getOptionIcon(selectedImpact) || 'scoringImpact'}
                  count={selectedImpact?.count ?? summary?.total ?? 0}
                  color={selectedImpact?.color || 'neutral'}
                />
              )}
            >
              {impactBuckets.map(item => (
                <FilterOption
                  key={item.value || item.id || 'all'}
                  item={item}
                  fallbackIcon="scoringImpact"
                />
              ))}
            </Select>
          </FormControl>
        </Box>
      </Box>

      <Box sx={sx.grid1half}>
        <Box sx={{ minWidth: 0 }}>
          <FormControl>
            <FormLabel>פרופיל תובנות</FormLabel>
            <Select
              size="sm"
              value={filters?.profileInsight || ''}
              onChange={(_, value) => onChangeProfileInsightFilter(value || '')}
              sx={{ minWidth: 0, width: '100%', bgcolor: 'background.surface' }}
              renderValue={() => (
                <SelectValue
                  label={selectedProfileInsight?.selectedLabel || selectedProfileInsight?.label || 'כל פרופילי התובנות'}
                  icon={getOptionIcon(selectedProfileInsight) || 'insights'}
                  count={selectedProfileInsight?.count ?? summary?.total ?? 0}
                  color={selectedProfileInsight?.color || 'neutral'}
                />
              )}
            >
              <Option value="">
                <SelectValue
                  label="כל פרופילי התובנות"
                  icon="insights"
                  count={summary?.total ?? 0}
                />
              </Option>

              {profileInsightBuckets.map(item => (
                <FilterOption
                  key={item.value || item.id}
                  item={item}
                  fallbackIcon="insights"
                />
              ))}
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ minWidth: 0, pt: 0.7 }}>
          <FormControl>
            <FormLabel>פעילות</FormLabel>
            <Chip
              size="md"
              variant={filters?.onlyActive ? 'solid' : 'outlined'}
              color={filters?.onlyActive ? 'success' : 'neutral'}
              onClick={onToggleOnlyActive}
              sx={{
                ...sx.filterChip,
                ...(filters?.onlyActive
                  ? {}
                  : {
                      bgcolor: c.bg,
                      color: c.text,
                    }),
              }}
              startDecorator={iconUi({ id: 'done' })}
            >
              פעילים בלבד ({summary?.active ?? 0})
            </Chip>
          </FormControl>
        </Box>
      </Box>

      <Box sx={{ minWidth: 0, px: 2 }}>
        <FormControl>
          <FormLabel>קבוצה</FormLabel>
          <Select
            size="sm"
            value={filters?.teamId || ''}
            onChange={(_, value) => onChangeTeamId(value || '')}
            sx={{ minWidth: 0, width: '100%', bgcolor: 'background.surface' }}
            slotProps={{ listbox: { sx: { '--ListItemDecorator-size': '28px' } } }}
            renderValue={() => (
              <SelectValue
                label={selectedTeam?.label || 'כל הקבוצות'}
                icon={selectedTeam?.idIcon || 'teams'}
                count={selectedTeam?.count ?? summary?.total ?? 0}
              />
            )}
          >
            <Option value="">
              <SelectValue
                label="כל הקבוצות"
                icon="teams"
                count={summary?.total ?? 0}
              />
            </Option>

            {teamBuckets.map(item => (
              <FilterOption key={item.id} item={item} fallbackIcon="teams" />
            ))}
          </Select>
        </FormControl>
      </Box>

      <Box sx={{ pt: 1, px: 2 }}>
        <Typography level="body-xs" sx={{ color: 'text.tertiary' }}>
          כל שינוי מוחל מיידית על רשימת שחקני הקבוצה
        </Typography>
      </Box>
    </Box>
  )
}

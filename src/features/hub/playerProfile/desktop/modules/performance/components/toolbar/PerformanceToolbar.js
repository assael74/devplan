// playerProfile/desktop/modules/performance/components/toolbar/PerformanceToolbar.js

import React from 'react'
import { Box, Option, Select, Typography, Button } from '@mui/joy'

import { iconUi } from '../../../../../../../../ui/core/icons/iconUi.js'
import { toolbarSx as sx } from '../../sx/toolbar.sx.js'

import SelectValue from './SelectValue.js'
import FilterChip from './FilterChip.js'

function getOptionLabel(options, value, fallback) {
  const arr = Array.isArray(options) ? options : []
  const item = arr.find((x) => String(x?.value) === String(value))
  return item?.label || fallback
}

function getOptionIcon(options, value, fallback) {
  const arr = Array.isArray(options) ? options : []
  const item = arr.find((x) => String(x?.value) === String(value))
  return item?.idIcon || fallback
}

export default function PerformanceToolbar({
  domain,
  summary,
  filters,
  indicators = [],
  options = {},
  onChangeFilters,
  onResetFilters,
  onClearFilter,
}) {
  const statsParmTypeOptions = Array.isArray(options?.statsParmType) ? options.statsParmType : []
  const gameTypeOptions = Array.isArray(options?.type) ? options.type : []
  const hasActiveFilters = (summary?.activeFiltersCount || 0) > 0

  const selectedStatsType = getOptionLabel(statsParmTypeOptions, filters?.statsParmType, 'כולם')
  const selectedGameType = getOptionLabel(gameTypeOptions, filters?.type, 'כל הסוגים')

  return (
    <Box sx={sx.toolbar}>
      <Box sx={sx.toolbarTop}>
        <Typography level="title-sm" startDecorator={iconUi({ id: 'stats' })}>
          סינון ביצוע
        </Typography>

        <Box sx={{ flex: 1 }} />

        <Typography level="body-xs" sx={{ color: 'text.secondary' }}>
          {summary?.gamesCount || 0} משחקים · {summary?.paramsCount || 0} פרמטרים
        </Typography>
      </Box>

      <Box sx={sx.toolbarBottom}>
        <Select
          size="sm"
          value={filters?.statsParmType || 'all'}
          onChange={(_, value) => onChangeFilters({ statsParmType: value || 'all' })}
          sx={{ minWidth: 190 }}
          slotProps={{ listbox: { sx: sx.listboxSx } }}
          renderValue={() => (
            <SelectValue
              label={selectedStatsType}
              icon={getOptionIcon(statsParmTypeOptions, filters?.statsParmType, 'statsParm')}
              count={statsParmTypeOptions.length}
              fixedWidth={{ minWidth: 190 }}
            />
          )}
        >
          {statsParmTypeOptions.map((item) => (
            <Option key={item.value} value={item.value}>
              <SelectValue
                label={item.label}
                icon={item.idIcon || 'statsParm'}
                count={0}
              />
            </Option>
          ))}
        </Select>

        <Select
          size="sm"
          value={filters?.type || 'all'}
          onChange={(_, value) => onChangeFilters({ type: value || 'all' })}
          sx={{ minWidth: 190 }}
          slotProps={{ listbox: { sx: sx.listboxSx } }}
          renderValue={() => (
            <SelectValue
              label={selectedGameType}
              icon={getOptionIcon(gameTypeOptions, filters?.type, 'league')}
              count={gameTypeOptions.length}
              fixedWidth={{ minWidth: 190 }}
            />
          )}
        >
          {gameTypeOptions.map((item) => (
            <Option key={item.value} value={item.value}>
              <SelectValue
                label={item.label}
                icon={item.idIcon || 'league'}
                count={0}
              />
            </Option>
          ))}
        </Select>

        <Button
          size="sm"
          variant="outlined"
          color="neutral"
          disabled={!hasActiveFilters}
          startDecorator={iconUi({ id: 'reset' })}
          onClick={onResetFilters}
        >
          איפוס
        </Button>
      </Box>

      {!!indicators.length && (
        <Box sx={sx.toolbarChipsRow}>
          {indicators.map((item) => (
            <FilterChip
              key={item.id || item.key}
              item={item}
              onClear={(chip) => onClearFilter(chip?.key || chip?.id)}
            />
          ))}
        </Box>
      )}
    </Box>
  )
}

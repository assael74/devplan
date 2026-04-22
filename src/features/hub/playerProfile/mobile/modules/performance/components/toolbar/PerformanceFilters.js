// playerProfile/mobile/modules/performance/components/toolbar/PerformanceFilters.js

import React from 'react'
import {
  Box,
  Option,
  Select,
  Typography,
  FormControl,
  FormLabel,
} from '@mui/joy'

import { toolbarSx as sx } from '../../sx/toolbar.sx.js'
import SelectValue from './SelectValue.js'

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

export default function PerformanceFilters({
  summary,
  filters,
  options = {},
  onChangeFilters,
}) {
  const statsParmTypeOptions = Array.isArray(options?.statsParmType) ? options.statsParmType : []
  const gameTypeOptions = Array.isArray(options?.type) ? options.type : []

  const selectedStatsType = getOptionLabel(statsParmTypeOptions, filters?.statsParmType, 'כולם')
  const selectedGameType = getOptionLabel(gameTypeOptions, filters?.type, 'כל הסוגים')

  return (
    <Box sx={{ display: 'grid', gap: 1.1 }}>
      <Box sx={sx.grid1}>
        <Box sx={{ minWidth: 0 }}>
          <FormControl>
            <FormLabel>סוג פרמטרים</FormLabel>

            <Select
              size="sm"
              value={filters?.statsParmType || 'all'}
              onChange={(_, value) => onChangeFilters({ statsParmType: value || 'all' })}
              sx={{ minWidth: 0, width: '100%' }}
              slotProps={{ listbox: { sx: sx.listboxSx } }}
              renderValue={() => (
                <SelectValue
                  label={selectedStatsType}
                  icon={getOptionIcon(statsParmTypeOptions, filters?.statsParmType, 'statsParm')}
                  count={statsParmTypeOptions.length}
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
          </FormControl>
        </Box>
      </Box>

      <Box sx={sx.grid1}>
        <Box sx={{ minWidth: 0 }}>
          <FormControl>
            <FormLabel>סוג משחק</FormLabel>

            <Select
              size="sm"
              value={filters?.type || 'all'}
              onChange={(_, value) => onChangeFilters({ type: value || 'all' })}
              sx={{ minWidth: 0, width: '100%' }}
              slotProps={{ listbox: { sx: sx.listboxSx } }}
              renderValue={() => (
                <SelectValue
                  label={selectedGameType}
                  icon={getOptionIcon(gameTypeOptions, filters?.type, 'league')}
                  count={gameTypeOptions.length}
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
          </FormControl>
        </Box>
      </Box>

      <Box sx={{ pt: 0.5 }}>
        <Typography level="body-xs" sx={{ color: 'text.tertiary' }}>
          {summary?.gamesCount || 0} משחקים · {summary?.paramsCount || 0} פרמטרים
        </Typography>
      </Box>
    </Box>
  )
}

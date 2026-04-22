// playerProfile/mobile/modules/performance/components/toolbar/PerformanceToolbar.js

import React, { useState } from 'react'
import { Box, Typography, Chip, IconButton } from '@mui/joy'

import { iconUi } from '../../../../../../../../ui/core/icons/iconUi.js'
import { toolbarSx as sx } from '../../sx/toolbar.sx.js'

import {
  FiltersTrigger,
  MobileFiltersDrawerShell,
} from '../../../../../../../../ui/patterns/filters/index.js'

import FilterChip from './FilterChip.js'
import PerformanceFilters from './PerformanceFilters.js'

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
  const [filtersOpen, setFiltersOpen] = useState(false)
  const hasActiveFilters = (summary?.activeFiltersCount || 0) > 0

  return (
    <>
      <Box sx={sx.toolbar}>
        <Box sx={sx.actionsRow}>
          <FiltersTrigger
            hasActive={hasActiveFilters}
            onClick={() => setFiltersOpen(true)}
            label="פילטרים"
          />

          <Box sx={{ flex: 1 }} />

          <IconButton
            size="sm"
            variant="solid"
            sx={sx.createBtn}
          >
            {iconUi({ id: 'insights' })}
          </IconButton>
        </Box>

        <Box sx={sx.toolbarBottom}>
          <Box sx={sx.summaryRow}>
            <Typography level="body-xs" sx={{ color: 'text.secondary' }}>
              {summary?.gamesCount || 0} משחקים · {summary?.paramsCount || 0} פרמטרים
            </Typography>
          </Box>
        </Box>

        {!!indicators.length && (
          <Box sx={sx.indicatorsRow}>
            {indicators.map((item) => (
              <FilterChip
                key={item.id || item.key}
                item={item}
                onClear={(chip) => onClearFilter?.(chip?.key || chip?.id)}
              />
            ))}
          </Box>
        )}
      </Box>

      <MobileFiltersDrawerShell
        open={filtersOpen}
        entity="player"
        onClose={() => setFiltersOpen(false)}
        title="פילטרים לביצוע"
        subtitle="סינון סטטיסטיקה וביצועי שחקן"
        resultsText={`${summary?.gamesCount || 0} משחקים · ${summary?.paramsCount || 0} פרמטרים`}
        onReset={onResetFilters}
        resetDisabled={!hasActiveFilters}
      >
        <PerformanceFilters
          summary={summary}
          filters={filters}
          indicators={indicators}
          options={options}
          onChangeFilters={onChangeFilters}
          onResetFilters={onResetFilters}
        />
      </MobileFiltersDrawerShell>
    </>
  )
}

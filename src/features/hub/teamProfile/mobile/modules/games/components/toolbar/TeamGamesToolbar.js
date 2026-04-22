// teamProfile/mobile/modules/games/components/toolbar/TeamGamesToolbar.js

import React, { useMemo, useState } from 'react'
import { Box, Chip, IconButton } from '@mui/joy'

import { iconUi } from '../../../../../../../../ui/core/icons/iconUi.js'
import {
  FiltersTrigger,
  MobileFiltersDrawerShell,
} from '../../../../../../../../ui/patterns/filters/index.js'

import { toolbarSx as sx } from '../../sx/toolbar.sx.js'

import ToolbarFilterChip from './ToolbarFilterChip.js'
import GamesFiltersContent from './GamesFiltersContent.js'

import {
  buildToolbarState,
  clearToolbarIndicator,
  safeArray,
} from '../../../../../sharedLogic'

export default function TeamGamesToolbar({
  summary,
  filters,
  indicators = [],
  options = {},
  onOpenInsights,
  onChangeFilters,
  onResetFilters,
}) {
  const [filtersOpen, setFiltersOpen] = useState(false)

  const {
    totalGames,
    filteredGames,
    hasActiveFilters,
  } = useMemo(() => {
    return buildToolbarState({ summary, filters, options })
  }, [summary, filters, options])

  const handleClearIndicator = (item) => {
    clearToolbarIndicator(item, onChangeFilters)
  }

  return (
    <>
      <Box sx={sx.toolbar}>
        <Box sx={{ display: 'grid', gap: 0.75 }}>
          <Box sx={sx.actionsRow}>
            <FiltersTrigger
              hasActive={hasActiveFilters}
              onClick={() => setFiltersOpen(true)}
              label="פילטרים"
            />

            <Chip
              size="sm"
              variant="soft"
              color="primary"
              startDecorator={iconUi({ id: 'game' })}
            >
              {filteredGames} / {totalGames} משחקים
            </Chip>

            {!!summary?.playedGames && (
              <Chip
                size="sm"
                variant="soft"
                color="success"
                startDecorator={iconUi({ id: 'done' })}
              >
                {summary.playedGames} שוחקו
              </Chip>
            )}

            {!!summary?.upcomingGames && (
              <Chip
                size="sm"
                variant="soft"
                color="warning"
                startDecorator={iconUi({ id: 'calendar' })}
              >
                {summary.upcomingGames} עתידיים
              </Chip>
            )}

            <Box sx={{ flex: 1 }} />

            <IconButton
              size="sm"
              variant="solid"
              onClick={onOpenInsights}
              sx={sx.createBtn}
            >
              {iconUi({ id: 'insights' })}
            </IconButton>
          </Box>
        </Box>

        {!!safeArray(indicators).length && (
          <Box sx={sx.indicatorsRow}>
            {safeArray(indicators).map((item) => (
              <ToolbarFilterChip
                key={item.id || item.type}
                item={item}
                onClear={handleClearIndicator}
              />
            ))}
          </Box>
        )}
      </Box>

      <MobileFiltersDrawerShell
        open={filtersOpen}
        entity="team"
        onClose={() => setFiltersOpen(false)}
        title="פילטרים למשחקים"
        subtitle="סינון רשימת משחקי הקבוצה במובייל"
        resultsText={`${filteredGames} מתוך ${totalGames} משחקים`}
        onReset={onResetFilters}
        resetDisabled={!hasActiveFilters}
      >
        <GamesFiltersContent
          summary={summary}
          filters={filters}
          options={options}
          onChangeFilters={onChangeFilters}
        />
      </MobileFiltersDrawerShell>
    </>
  )
}

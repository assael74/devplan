// teamProfile/mobile/modules/games/components/toolbar/TeamGamesToolbar.js

import React, { useMemo, useState } from 'react'
import { Box, Chip, IconButton, Button} from '@mui/joy'

import { iconUi } from '../../../../../../../../ui/core/icons/iconUi.js'
import {
  FiltersTrigger,
  MobileFiltersDrawerShell,
} from '../../../../../../../../ui/patterns/filters/index.js'

import { SortDrawerMobile } from '../../../../../../../../ui/patterns/sort/index.js'

import { toolbarSx as sx } from '../../sx/toolbar.sx.js'

import ToolbarFilterChip from './ToolbarFilterChip.js'
import GamesFiltersContent from './GamesFiltersContent.js'

import {
  buildToolbarState,
  clearToolbarIndicator,
  safeArray,
} from '../../../../../sharedLogic'

import {
  TEAM_GAMES_SORT_OPTIONS,
  getTeamGamesSortLabel,
  getTeamGamesSortDirectionIcon,
} from '../../../../../sharedLogic/games'

export default function TeamGamesToolbar({
  summary,
  filters,
  sortBy = 'date',
  sortDirection = 'desc',
  indicators = [],
  options = {},
  onOpenInsights,
  onChangeFilters,
  onResetFilters,
  onChangeSortBy,
  onChangeSortDirection,
}) {
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [sortOpen, setSortOpen] = useState(false)

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
        <Box sx={sx.toolbarRow}>
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

          <Box sx={{ flex: 1 }} />

          <Button
            size="sm"
            variant="soft"
            color="neutral"
            onClick={() => setSortOpen(true)}
            endDecorator={iconUi({
              id: getTeamGamesSortDirectionIcon(sortDirection),
              sx: { fontSize: 15, color: '#1ED760' },
            })}
            sx={sx.sortBut}
          >
            {getTeamGamesSortLabel(sortBy)}
          </Button>
        </Box>

        <Box sx={sx.toolbarRow}>
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

      <SortDrawerMobile
        open={sortOpen}
        onClose={() => setSortOpen(false)}
        title="מיון משחקים"
        sortBy={sortBy}
        sortDirection={sortDirection}
        sortOptions={TEAM_GAMES_SORT_OPTIONS}
        onChangeSortBy={onChangeSortBy}
        onChangeSortDirection={onChangeSortDirection}
      />
    </>
  )
}

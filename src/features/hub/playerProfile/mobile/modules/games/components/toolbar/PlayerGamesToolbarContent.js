// playerProfile/mobile/modules/games/components/toolbar/PlayerGamesToolbarContent.js

import React, { useMemo, useState } from 'react'
import { Box, Chip, IconButton, Button } from '@mui/joy'

import { iconUi } from '../../../../../../../../ui/core/icons/iconUi.js'
import {
  FiltersTrigger,
  MobileFiltersDrawerShell,
} from '../../../../../../../../ui/patterns/filters/index.js'

import { SortDrawerMobile } from '../../../../../../../../ui/patterns/sort/index.js'

import { toolbarSx as sx } from '../../sx/toolbar.sx.js'

import PlayerGamesToolbarFilterChip from './PlayerGamesToolbarFilterChip.js'
import GamesFiltersContent from './GamesFiltersContent.js'

import {
  buildToolbarState,
  clearToolbarIndicator,
  safeArray,
} from '../../../../../sharedLogic'

import {
  PLAYER_GAMES_SORT_OPTIONS,
  getPlayerGamesSortLabel,
  getPlayerGamesSortDirectionIcon,
} from '../../../../../sharedLogic'

export default function PlayerGamesToolbarContent({
  summary,
  filters,
  indicators = [],
  options = {},
  onOpenInsights,
  onChangeFilters,
  onResetFilters,
  sortBy = 'date',
  sortDirection = 'desc',
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

            <Box sx={{ flex: 1 }} />

            <Button
              size="sm"
              variant="soft"
              color="neutral"
              onClick={() => setSortOpen(true)}
              endDecorator={iconUi({
                id: getPlayerGamesSortDirectionIcon(sortDirection),
                sx: { fontSize: 15, color: '#1ED760' },
              })}
              sx={sx.sortBut}
            >
              {getPlayerGamesSortLabel(sortBy)}
            </Button>
          </Box>
        </Box>

        {!!safeArray(indicators).length && (
          <Box sx={sx.indicatorsRow}>
            {safeArray(indicators).map((item) => (
              <PlayerGamesToolbarFilterChip
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
        entity='player'
        onClose={() => setFiltersOpen(false)}
        title="פילטרים למשחקים"
        subtitle="סינון רשימת המשחקים במובייל"
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
        sortOptions={PLAYER_GAMES_SORT_OPTIONS}
        onChangeSortBy={onChangeSortBy}
        onChangeSortDirection={onChangeSortDirection}
      />
    </>
  )
}

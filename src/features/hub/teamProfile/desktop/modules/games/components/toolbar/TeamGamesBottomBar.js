// teamProfile/desktop/modules/games/components/toolbar/TeamGamesBottomBar.js

import React from 'react'
import { Box, Chip } from '@mui/joy'

import TeamGamesSortMenu from './TeamGamesSortMenu.js'
import TeamGamesToolbarFilterChip from './TeamGamesToolbarFilterChip.js'
import PerformanceViewSwitch from './PerformanceViewSwitch.js'
import TeamGamesDeleteOptionsButton from './TeamGamesDeleteOptionsButton.js'

import { iconUi } from '../../../../../../../../ui/core/icons/iconUi.js'
import { toolbarSx as sx } from './sx/toolbar.sx.js'

import { safeArray } from '../../../../../sharedLogic/games'

export default function TeamGamesBottomBar({
  summary,
  indicators = [],
  totalGames = 0,
  filteredGames = 0,
  selectedGameIds = [],
  sortBy = 'date',
  sortDirection = 'desc',
  performanceView = 'team',
  onChangePerformanceView,
  onChangeSortBy,
  onChangeSortDirection,
  onClearIndicator,
  onEnterDeleteSelectionMode,
}) {
  const selectedCount = safeArray(selectedGameIds).length

  return (
    <Box sx={sx.toolbarBottom}>
      <Chip
        size="sm"
        variant="soft"
        color="primary"
        startDecorator={iconUi({ id: 'game' })}
      >
        {filteredGames} / {totalGames} משחקים
      </Chip>

      {!!selectedCount && (
        <Chip
          size="sm"
          variant="soft"
          color="danger"
          startDecorator={iconUi({ id: 'done' })}
        >
          {selectedCount} נבחרו
        </Chip>
      )}

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
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          {safeArray(indicators).map(item => (
            <TeamGamesToolbarFilterChip
              key={item.id || item.type}
              item={item}
              onClear={onClearIndicator}
            />
          ))}
        </Box>
      )}

      <Box sx={{ flex: 1 }} />

      <PerformanceViewSwitch
        value={performanceView}
        onChange={onChangePerformanceView}
      />

      <TeamGamesSortMenu
        sortBy={sortBy}
        sortDirection={sortDirection}
        onChangeSortBy={onChangeSortBy}
        onChangeSortDirection={onChangeSortDirection}
      />

      <TeamGamesDeleteOptionsButton
        totalGames={totalGames}
        onEnterDeleteSelectionMode={onEnterDeleteSelectionMode}
      />
    </Box>
  )
}

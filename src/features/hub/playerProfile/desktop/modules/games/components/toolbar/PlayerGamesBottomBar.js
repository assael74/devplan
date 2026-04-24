// plaeyrProfile/desktop/modules/games/components/toolbar/PlayerGamesBottomBar.js

import React from 'react'
import { Box, Chip } from '@mui/joy'

import PlayerGamesSortMenu from './PlayerGamesSortMenu.js'
import PlayerGamesToolbarFilterChip from './PlayerGamesToolbarFilterChip.js'

import { iconUi } from '../../../../../../../../ui/core/icons/iconUi.js'
import { toolbarSx as sx } from '../../sx/toolbar.sx.js'

import { safeArray } from '../../../../../sharedLogic'

export default function PlayerGamesBottomBar({
  summary,
  indicators = [],
  totalGames = 0,
  filteredGames = 0,
  sortBy = 'date',
  sortDirection = 'desc',
  onChangeSortBy,
  onChangeSortDirection,
  onClearIndicator,
}) {
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
          {safeArray(indicators).map((item) => (
            <PlayerGamesToolbarFilterChip
              key={item.id || item.type}
              item={item}
              onClear={onClearIndicator}
            />
          ))}
        </Box>
      )}

      <Box sx={{ flex: 1 }} />

      <PlayerGamesSortMenu
        sortBy={sortBy}
        sortDirection={sortDirection}
        onChangeSortBy={onChangeSortBy}
        onChangeSortDirection={onChangeSortDirection}
      />
    </Box>
  )
}
